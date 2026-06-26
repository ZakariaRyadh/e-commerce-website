import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const variants = await prisma.productVariant.findMany({
    where: { productId: id },
    orderBy: [{ size: "asc" }, { color: "asc" }],
  });
  return NextResponse.json(variants);
}

const variantsSchema = z.object({
  variants: z.array(
    z.object({
      id: z.string().optional(),
      size: z.string().min(1),
      color: z.string().min(1),
      stock: z.number().int().min(0),
    })
  ),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const parsed = variantsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const incoming = parsed.data.variants;
  const seen = new Set<string>();
  for (const v of incoming) {
    const key = `${v.size}|${v.color}`;
    if (seen.has(key)) {
      return NextResponse.json({ error: `Duplicate size/color combo: ${v.size} / ${v.color}` }, { status: 400 });
    }
    seen.add(key);
  }

  await prisma.$transaction(async (tx) => {
    await tx.productVariant.deleteMany({ where: { productId: id } });
    if (incoming.length > 0) {
      await tx.productVariant.createMany({
        data: incoming.map((v) => ({ productId: id, size: v.size, color: v.color, stock: v.stock })),
      });
    }
  });

  const variants = await prisma.productVariant.findMany({
    where: { productId: id },
    orderBy: [{ size: "asc" }, { color: "asc" }],
  });
  return NextResponse.json(variants);
}
