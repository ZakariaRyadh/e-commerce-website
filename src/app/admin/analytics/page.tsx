import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";

export default async function AdminAnalyticsPage() {
  const [orders, customerCount] = await Promise.all([
    prisma.order.findMany(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const repeatCustomers = new Set(orders.map((o) => o.userId)).size;
  const repeatRate = customerCount > 0 ? (repeatCustomers / customerCount) * 100 : 0;

  const cards = [
    { label: "Total Orders", value: String(orders.length) },
    { label: "Avg. Order Value", value: money(avgOrderValue) },
    { label: "Total Customers", value: String(customerCount) },
    { label: "Customers w/ Orders", value: String(repeatCustomers) },
    { label: "Order Rate", value: `${repeatRate.toFixed(0)}%` },
    { label: "Total Revenue", value: money(totalRevenue) },
  ];

  const now = new Date();
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const monthRevenue = orders
      .filter((o) => o.createdAt.getMonth() === d.getMonth() && o.createdAt.getFullYear() === d.getFullYear())
      .reduce((s, o) => s + Number(o.total), 0);
    return { label, value: monthRevenue };
  });
  const maxV = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-[#e5e5e5] rounded-xl p-5">
            <div className="text-xs font-semibold text-[#aaa] uppercase tracking-wider mb-2">{c.label}</div>
            <div className="text-2xl font-bold tracking-tight">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 sm:p-6">
        <h3 className="text-[15px] font-semibold mb-5">Monthly Revenue</h3>
        <div className="flex items-end gap-2.5 h-35">
          {chartData.map((bar) => (
            <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className="w-full rounded-t bg-[#1B4FD8]"
                style={{ height: `${Math.max((bar.value / maxV) * 110, 4)}px` }}
              />
              <span className="text-[11px] text-[#aaa]">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
