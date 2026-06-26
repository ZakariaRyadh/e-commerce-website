"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { money } from "@/lib/format";

type Order = { id: string; date: string; customer: string; status: string; total: number };

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  DELIVERED: { color: "#16a34a", bg: "#f0fdf4" },
  SHIPPED: { color: "#1B4FD8", bg: "#eff6ff" },
  OUT_FOR_DELIVERY: { color: "#1B4FD8", bg: "#eff6ff" },
  PROCESSING: { color: "#d97706", bg: "#fffbeb" },
  PENDING: { color: "#d97706", bg: "#fffbeb" },
  CANCELLED: { color: "#dc2626", bg: "#fef2f2" },
};

export function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = initialOrders.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.id.includes(search)) return false;
    return true;
  });

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#e5e5e5] flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-50">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="w-full h-9.5 pl-8 pr-3 border border-[#e5e5e5] rounded-lg text-[13px] outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9.5 px-3 border border-[#e5e5e5] rounded-lg text-[13px] text-[#555] bg-white cursor-pointer outline-none"
          >
            <option value="ALL">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
                <Th>Order ID</Th>
                <Th>Date</Th>
                <Th>Customer</Th>
                <Th>Status</Th>
                <Th align="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const sc = STATUS_COLOR[o.status];
                return (
                  <tr key={o.id} className="border-t border-[#f5f5f5] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 text-sm font-medium text-[#1B4FD8]">#{o.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 py-3 text-[13px] text-[#555]">{o.date}</td>
                    <td className="px-5 py-3 text-[13px]">{o.customer}</td>
                    <td className="px-5 py-3">
                      <select
                        value={o.status}
                        disabled={updating === o.id}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="text-xs font-medium px-2 py-1 rounded border-none outline-none cursor-pointer"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-right">{money(o.total)}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#aaa]">
                    No orders found.
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

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th className={`px-5 py-2.5 text-${align} text-[11px] font-bold text-[#aaa] uppercase tracking-wider`}>
      {children}
    </th>
  );
}
