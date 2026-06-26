"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, ShieldCheck, ShieldOff, UserCog, Trash2 } from "lucide-react";
import { money } from "@/lib/format";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  orderCount: number;
  ltv: number;
};

export function AdminCustomersClient() {
  const [search, setSearch] = useState("");
  const [hasOrdersOnly, setHasOrdersOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ customers: Customer[]; total: number; pageCount: number }>({
    customers: [],
    total: 0,
    pageCount: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      q: search,
      hasOrders: String(hasOrdersOnly),
      page: String(page),
    });
    const res = await fetch(`/api/admin/customers?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [search, hasOrdersOnly, page]);

  useEffect(() => {
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, hasOrdersOnly]);

  async function act(id: string, body: object) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Action failed");
    }
    setBusyId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Delete failed");
    }
    setBusyId(null);
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Customers</h1>

      <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#e5e5e5] flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-50">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers…"
              className="w-full h-9.5 pl-8 pr-3 border border-[#e5e5e5] rounded-lg text-[13px] outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-[#555] cursor-pointer">
            <input
              type="checkbox"
              checked={hasOrdersOnly}
              onChange={(e) => setHasOrdersOnly(e.target.checked)}
              className="cursor-pointer accent-[#1B4FD8]"
            />
            Has orders only
          </label>
          {error && <span className="text-[13px] text-red-600">{error}</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
                <Th>Customer</Th>
                <Th>Joined</Th>
                <Th>Orders</Th>
                <Th>Status</Th>
                <Th align="right">Lifetime Value</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {data.customers.map((c) => (
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
                  <td className="px-5 py-3 text-[13px] text-[#555]">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-[13px] text-[#555]">{c.orderCount}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        c.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {c.status === "ACTIVE" ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-right">{money(c.ltv)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <button
                        disabled={busyId === c.id}
                        onClick={() => act(c.id, { status: c.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" })}
                        title={c.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                        className="h-8 px-2.5 bg-[#f5f5f4] text-[#555] rounded-md text-xs font-medium cursor-pointer hover:bg-[#e5e5e4] hover:text-[#111] flex items-center gap-1 disabled:opacity-50"
                      >
                        {c.status === "ACTIVE" ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
                      </button>
                      <button
                        disabled={busyId === c.id}
                        onClick={() => act(c.id, { role: "ADMIN" })}
                        title="Promote to admin"
                        className="h-8 px-2.5 bg-[#f5f5f4] text-[#555] rounded-md text-xs font-medium cursor-pointer hover:bg-[#e5e5e4] hover:text-[#111] flex items-center gap-1 disabled:opacity-50"
                      >
                        <UserCog size={12} />
                      </button>
                      <button
                        disabled={busyId === c.id}
                        onClick={() => remove(c.id)}
                        title="Delete"
                        className="h-8 px-2.5 bg-red-50 text-red-600 rounded-md text-xs font-medium cursor-pointer hover:bg-red-100 flex items-center gap-1 disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && data.customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#aaa]">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e5e5e5]">
          <span className="text-[13px] text-[#aaa]">{data.total} total customers</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-[#e5e5e5] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[13px] text-[#555]">
              Page {page} of {data.pageCount}
            </span>
            <button
              disabled={page >= data.pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-[#e5e5e5] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
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
