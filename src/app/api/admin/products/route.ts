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
  material: z.string().optional(),
  fit: z.string().optional(),
  care: z.string().optional(),
  origin: z.string().optional(),
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

  const { name, price, compareAtPrice, categoryId, description, stock, material, fit, care, origin } = parsed.data;
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // New products start with a single "One Size / Default" variant holding the
  // initial stock count. Admin can add real size/color variants afterward
  // from the product's variant manager.
  const product = await prisma.product.create({
    data: {
      name,
      slug: `${slug}-${Date.now().toString(36)}`,
      description,
      price,
      compareAtPrice,
      categoryId,
      material,
      fit,
      care,
      origin,
      images: { create: [{ url: `https://picsum.photos/seed/${slug}${Date.now()}/600/750`, position: 0 }] },
      variants: { create: [{ size: "One Size", color: "Default", stock }] },
    },
  });

  return NextResponse.json(product);
}
