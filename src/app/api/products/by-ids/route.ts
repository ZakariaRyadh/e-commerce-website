import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { category: true, images: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json(
    products.map((p) => ({
      ...p,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    }))
  );
}
