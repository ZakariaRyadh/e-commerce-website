"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Heart, Package } from "lucide-react";
import { useWishlistStore } from "@/lib/store";
import { money } from "@/lib/format";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";

type Order = { id: string; status: string; total: number; itemCount: number; createdAt: string };

const STATUS_COLOR: Record<string, string> = {
  DELIVERED: "#16a34a",
  SHIPPED: "#1B4FD8",
  OUT_FOR_DELIVERY: "#1B4FD8",
  PROCESSING: "#d97706",
  PENDING: "#d97706",
  CANCELLED: "#dc2626",
};

const TRACKING_STEPS = ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

export function AccountTabs({ user, orders }: { user: { firstName: string; email: string }; orders: Order[] }) {
  const [section, setSection] = useState<"orders" | "wishlist" | "tracking">("orders");
  const { ids } = useWishlistStore();
  const [wishlistProducts, setWishlistProducts] = useState<ProductCardData[]>([]);
  const [trackOrder, setTrackOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (ids.length === 0) {
      setWishlistProducts([]);
      return;
    }
    fetch("/api/products/by-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((r) => r.json())
      .then(setWishlistProducts);
  }, [ids]);

  function openTracking(order: Order) {
    setTrackOrder(order);
    setSection("tracking");
  }

  const stepIndex = (status: string) => {
    const map: Record<string, number> = {
      PENDING: 0,
      PROCESSING: 1,
      SHIPPED: 2,
      OUT_FOR_DELIVERY: 3,
      DELIVERED: 4,
      CANCELLED: 1,
    };
    return map[status] ?? 1;
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-20 grid lg:grid-cols-[200px_1fr] gap-8 items-start">
      <div className="bg-[#fafafa] border border-[#e8e8e7] rounded-2xl p-4 lg:sticky lg:top-20">
        <div className="px-3 pb-5 border-b border-[#f0f0f0] mb-2">
          <div className="text-[15px] font-semibold">{user.firstName}</div>
          <div className="text-[13px] text-[#aaa] mt-0.5 truncate">{user.email}</div>
        </div>
        <button
          onClick={() => setSection("orders")}
          className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm cursor-pointer ${
            section === "orders" ? "bg-[#eef2ff] text-[#1B4FD8] font-medium" : "hover:bg-[#eef2ff]"
          }`}
        >
          Order History
        </button>
        <button
          onClick={() => setSection("wishlist")}
          className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm cursor-pointer ${
            section === "wishlist" ? "bg-[#eef2ff] text-[#1B4FD8] font-medium" : "hover:bg-[#eef2ff]"
          }`}
        >
          Saved Wishlist
        </button>
        <button
          onClick={() => setSection("tracking")}
          className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm cursor-pointer ${
            section === "tracking" ? "bg-[#eef2ff] text-[#1B4FD8] font-medium" : "hover:bg-[#eef2ff]"
          }`}
        >
          Order Tracking
        </button>
        <div className="h-px bg-[#f0f0f0] my-2" />
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-[#ccc] hover:text-red-600 cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      <div>
        {section === "orders" && (
          <div>
            <h2 className="text-xl sm:text-[22px] font-bold tracking-tight mb-6">Order History</h2>
            {orders.length === 0 ? (
              <EmptyState icon={Package} title="No orders yet" sub="Your past orders will show up here." />
            ) : (
              <div className="flex flex-col gap-2.5">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-white border border-[#e8e8e7] rounded-xl px-5 py-4.5 flex items-center gap-4 flex-wrap hover:bg-[#fafafa]"
                  >
                    <div className="flex-1 min-w-25">
                      <div className="text-sm font-semibold">#{o.id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-xs text-[#aaa] mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: STATUS_COLOR[o.status] }} />
                      <span className="text-[13px] font-medium" style={{ color: STATUS_COLOR[o.status] }}>
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="text-right min-w-20">
                      <div className="text-[15px] font-semibold">{money(o.total)}</div>
                      <div className="text-xs text-[#aaa] mt-0.5">{o.itemCount} items</div>
                    </div>
                    <button
                      onClick={() => openTracking(o)}
                      className="h-9 px-4 bg-[#f5f5f4] hover:bg-[#e5e5e4] hover:text-[#111] text-[#555] rounded-lg text-[13px] font-medium cursor-pointer whitespace-nowrap"
                    >
                      Track →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {section === "wishlist" && (
          <div>
            <h2 className="text-xl sm:text-[22px] font-bold tracking-tight mb-6">Saved Wishlist</h2>
            {wishlistProducts.length === 0 ? (
              <EmptyState icon={Heart} title="Wishlist is empty" sub="Save items you love to find them later." cta />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {wishlistProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {section === "tracking" && (
          <div>
            <h2 className="text-xl sm:text-[22px] font-bold tracking-tight mb-6">Order Tracking</h2>
            {!trackOrder ? (
              <p className="text-sm text-[#aaa]">Select &quot;Track →&quot; on an order to see its status here.</p>
            ) : (
              <div className="bg-white border border-[#e8e8e7] rounded-2xl p-6 sm:p-7">
                <div className="flex justify-between items-start mb-7 flex-wrap gap-3">
                  <div>
                    <div className="text-[13px] text-[#aaa]">Order</div>
                    <div className="text-lg font-bold">#{trackOrder.id.slice(0, 8).toUpperCase()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] text-[#aaa]">Status</div>
                    <div className="text-[15px] font-semibold" style={{ color: STATUS_COLOR[trackOrder.status] }}>
                      {trackOrder.status.replace(/_/g, " ")}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  {TRACKING_STEPS.map((label, i) => {
                    const current = stepIndex(trackOrder.status);
                    const done = i < current;
                    const active = i === current;
                    return (
                      <div key={label} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2"
                            style={{
                              background: done ? "#16a34a" : active ? "#dbeafe" : "#f5f5f4",
                              borderColor: done ? "#16a34a" : active ? "#1B4FD8" : "#e5e5e5",
                            }}
                          >
                            {done && <span className="text-white text-xs">✓</span>}
                            {active && <div className="w-2 h-2 bg-[#1B4FD8] rounded-full" />}
                          </div>
                          {i < TRACKING_STEPS.length - 1 && (
                            <div className="w-0.5 h-8" style={{ background: done ? "#16a34a" : "#e5e5e5" }} />
                          )}
                        </div>
                        <div className="pb-7 pt-0.5 flex-1">
                          <div
                            className="text-sm font-semibold"
                            style={{ color: done ? "#111" : active ? "#1B4FD8" : "#aaa" }}
                          >
                            {label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  sub,
  cta,
}: {
  icon: typeof Package;
  title: string;
  sub: string;
  cta?: boolean;
}) {
  return (
    <div className="text-center py-16 flex flex-col items-center gap-4">
      <Icon size={40} className="text-[#ddd]" />
      <div>
        <p className="text-base font-semibold mb-1">{title}</p>
        <p className="text-sm text-[#aaa]">{sub}</p>
      </div>
      {cta && (
        <Link href="/products" className="h-10.5 px-6 bg-[#111] text-white rounded-xl text-sm font-medium flex items-center">
          Browse products
        </Link>
      )}
    </div>
  );
}
