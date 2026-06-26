import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";

const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  DELIVERED: { color: "#16a34a", bg: "#f0fdf4" },
  SHIPPED: { color: "#1B4FD8", bg: "#eff6ff" },
  OUT_FOR_DELIVERY: { color: "#1B4FD8", bg: "#eff6ff" },
  PROCESSING: { color: "#d97706", bg: "#fffbeb" },
  PENDING: { color: "#d97706", bg: "#fffbeb" },
  CANCELLED: { color: "#dc2626", bg: "#fef2f2" },
};

export default async function AdminDashboard() {
  const [orders, customerCount, recentOrders] = await Promise.all([
    prisma.order.findMany({ select: { total: true, createdAt: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const conversion = customerCount > 0 ? (orders.length / Math.max(customerCount, 1)) * 100 : 0;

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
    <div className="flex flex-col gap-7">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#aaa] mt-0.5">Welcome back. Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="text-[13px] text-[#aaa] bg-white border border-[#e5e5e5] px-3.5 py-2 rounded-lg">
          {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={money(totalRevenue)} />
        <StatCard label="Orders" value={String(orders.length)} />
        <StatCard label="Customers" value={String(customerCount)} />
        <StatCard label="Conversion" value={`${conversion.toFixed(1)}%`} />
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-[15px] font-semibold">Revenue Overview</h3>
            <p className="text-[13px] text-[#aaa] mt-0.5">Last 6 months</p>
          </div>
          <span className="text-xl font-bold">{money(totalRevenue)}</span>
        </div>
        <div className="flex items-end gap-2.5 h-35">
          {chartData.map((bar) => (
            <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className="w-full rounded-t bg-[#1B4FD8] transition-all"
                style={{ height: `${Math.max((bar.value / maxV) * 110, 4)}px` }}
              />
              <span className="text-[11px] text-[#aaa]">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-[#e5e5e5] flex justify-between items-center">
          <h3 className="text-[15px] font-semibold">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[480px]">
            <thead>
              <tr className="bg-[#fafafa]">
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Status</Th>
                <Th align="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => {
                const sc = STATUS_COLOR[o.status];
                return (
                  <tr key={o.id} className="border-t border-[#f5f5f5] hover:bg-[#fafafa]">
                    <td className="px-5 sm:px-6 py-3 text-sm font-medium text-[#1B4FD8]">#{o.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 sm:px-6 py-3 text-[13px]">{o.user.firstName} {o.user.lastName}</td>
                    <td className="px-5 sm:px-6 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: sc.color }} />
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-3 text-sm font-semibold text-right">{money(Number(o.total))}</td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-[#aaa]">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-xl p-5">
      <div className="text-xs font-semibold text-[#aaa] uppercase tracking-wider mb-3">{label}</div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th className={`px-5 sm:px-6 py-2.5 text-${align} text-[11px] font-bold text-[#aaa] uppercase tracking-wider`}>
      {children}
    </th>
  );
}
