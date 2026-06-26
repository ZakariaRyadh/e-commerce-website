import { prisma } from "@/lib/prisma";
import { AdminOrdersClient } from "@/components/AdminOrdersClient";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const serialized = orders.map((o) => ({
    id: o.id,
    date: o.createdAt.toLocaleDateString(),
    customer: `${o.user.firstName} ${o.user.lastName}`,
    status: o.status,
    total: Number(o.total),
  }));

  return <AdminOrdersClient initialOrders={serialized} />;
}
