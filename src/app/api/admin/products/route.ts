import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().nullable().optional(),
  categoryId: z.string(),
  description: z.string().min(1),
  stock: z.number().int().min(0).default(10),
});

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    products.map((p) => ({
      ...p,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    }))
  );
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { name, price, compareAtPrice, categoryId, description, stock } = parsed.data;
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const product = await prisma.product.create({
    data: {
      name,
      slug: `${slug}-${Date.now().toString(36)}`,
      description,
      price,
      compareAtPrice,
      stock,
      stockStatus: stock === 0 ? "SOLD_OUT" : stock <= 5 ? "LOW_STOCK" : "IN_STOCK",
      categoryId,
      colors: [],
      sizes: [],
      images: { create: [{ url: `https://picsum.photos/seed/${slug}${Date.now()}/600/750`, position: 0 }] },
    },
  });

  return NextResponse.json(product);
}
