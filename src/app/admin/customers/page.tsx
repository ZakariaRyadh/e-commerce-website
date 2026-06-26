import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
      <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[560px]">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
                <th className="px-5 py-2.5 text-left text-[11px] font-bold text-[#aaa] uppercase tracking-wider">Customer</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-bold text-[#aaa] uppercase tracking-wider">Joined</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-bold text-[#aaa] uppercase tracking-wider">Orders</th>
                <th className="px-5 py-2.5 text-right text-[11px] font-bold text-[#aaa] uppercase tracking-wider">Lifetime Value</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const ltv = c.orders.reduce((s, o) => s + Number(o.total), 0);
                return (
                  <tr key={c.id} className="border-t border-[#f5f5f5] hover:bg-[#fafafa]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-xs font-bold text-[#555] shrink-0">
                          {c.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {c.firstName} {c.lastName}
                          </div>
                          <div className="text-xs text-[#aaa]">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-[#555]">{c.createdAt.toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-[13px] text-[#555]">{c.orders.length}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-right">{money(ltv)}</td>
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-[#aaa]">
                    No customers yet.
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
