import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const createSchema = z.object({ name: z.string().min(1) });

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, productCount: c._count.products }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const slug = parsed.data.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existing = await prisma.category.findFirst({ where: { OR: [{ name: parsed.data.name }, { slug }] } });
  if (existing) return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });

  const category = await prisma.category.create({ data: { name: parsed.data.name, slug } });
  return NextResponse.json(category);
}
