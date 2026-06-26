import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    take: 5,
  });

  return NextResponse.json(
    products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      imgUrl: p.images[0]?.url,
    }))
  );
}
