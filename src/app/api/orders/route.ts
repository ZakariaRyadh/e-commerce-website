import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      price: z.number(),
      qty: z.number(),
      size: z.string().optional(),
      color: z.string().optional(),
    })
  ),
  subtotal: z.number(),
  shipping: z.number(),
  tax: z.number(),
  total: z.number(),
  promoCode: z.string().optional(),
  shippingAddress: z.string(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { items, subtotal, shipping, tax, total, promoCode, shippingAddress } = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const variant = await tx.productVariant.findFirst({
          where: { productId: item.productId, size: item.size ?? undefined, color: item.color ?? undefined },
        });
        if (!variant || variant.stock < item.qty) {
          throw new Error(`INSUFFICIENT_STOCK:${item.name}`);
        }
      }

      for (const item of items) {
        await tx.productVariant.updateMany({
          where: { productId: item.productId, size: item.size ?? undefined, color: item.color ?? undefined },
          data: { stock: { decrement: item.qty } },
        });
      }

      return tx.order.create({
        data: {
          userId: session.user.id,
          subtotal,
          shipping,
          tax,
          total,
          promoCode,
          shippingAddress,
          status: "PROCESSING",
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              name: i.name,
              price: i.price,
              qty: i.qty,
              size: i.size,
              color: i.color,
            })),
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(order);
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("INSUFFICIENT_STOCK:")) {
      const productName = e.message.split(":")[1];
      return NextResponse.json({ error: `Not enough stock for "${productName}" in that size/color.` }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not place order." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
