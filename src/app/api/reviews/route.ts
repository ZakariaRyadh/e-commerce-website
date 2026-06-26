import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(120),
  text: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in to leave a review." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: session.user.id, productId: parsed.data.productId } },
  });
  if (existing) {
    return NextResponse.json({ error: "You've already reviewed this product." }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: { ...parsed.data, userId: session.user.id },
    include: { user: true },
  });

  return NextResponse.json(review);
}
