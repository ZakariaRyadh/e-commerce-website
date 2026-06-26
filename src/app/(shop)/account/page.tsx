import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountTabs } from "@/components/AccountTabs";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const serializedOrders = orders.map((o) => ({
    id: o.id,
    status: o.status,
    total: Number(o.total),
    itemCount: o.items.reduce((s, i) => s + i.qty, 0),
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <AccountTabs
      user={{ firstName: session.user.name?.split(" ")[0] ?? "User", email: session.user.email ?? "" }}
      orders={serializedOrders}
    />
  );
}
