import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") ?? "";
  const onlyWithOrders = searchParams.get("hasOrders") === "true";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  const where = {
    role: "CUSTOMER" as const,
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(onlyWithOrders ? { orders: { some: {} } } : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { orders: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    customers: customers.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      orderCount: c.orders.length,
      ltv: c.orders.reduce((s, o) => s + Number(o.total), 0),
    })),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
}
