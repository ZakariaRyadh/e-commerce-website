"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, ClipboardCheck, Users, BarChart3, ArrowLeft, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ClipboardCheck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const content = (
    <>
      <div className="p-6 border-b border-white/8">
        <div className="text-[17px] font-bold tracking-tight">LUMA Admin</div>
        <div className="text-xs text-white/35 mt-0.5">Management Console</div>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                active ? "bg-white/12 text-white" : "text-white/45 hover:text-white/80"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/8">
        <Link href="/" className="flex items-center gap-2 text-[13px] text-white/40 hover:text-white/80">
          <ArrowLeft size={14} />
          Back to Store
        </Link>
      </div>
    </>
  );

  return (
    <>
      <div className="hidden lg:block w-60 shrink-0">
        <aside className="fixed top-0 left-0 w-60 h-screen bg-[#111] text-white flex flex-col z-50">{content}</aside>
      </div>

      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 bg-[#111] text-white rounded-lg flex items-center justify-center cursor-pointer"
        >
          <Menu size={18} />
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative w-60 h-full bg-[#111] text-white flex flex-col">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/60 cursor-pointer">
              <X size={18} />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
