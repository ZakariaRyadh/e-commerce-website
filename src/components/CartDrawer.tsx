"use client";

import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore, useUiStore } from "@/lib/store";
import { money } from "@/lib/format";

export function CartDrawer() {
  const { cartOpen, closeCart } = useUiStore();
  const { items, promoCode, promoApplied, setPromoCode, applyPromo, removeItem, updateQty } = useCartStore();

  if (!cartOpen) return null;

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 9.95;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="fixed inset-0 z-400 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />
      <div className="relative w-full sm:w-105 max-w-full h-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-right">
        <div className="px-6 py-4.5 border-b border-[#e8e8e7] flex items-center justify-between shrink-0">
          <h2 className="text-[17px] font-semibold">Cart ({items.reduce((s, i) => s + i.qty, 0)})</h2>
          <button onClick={closeCart} className="w-8 h-8 flex items-center justify-center rounded-md text-[#aaa] hover:bg-[#f5f5f4] hover:text-[#111] cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-10 text-center">
            <div className="w-16 h-16 bg-[#f5f5f4] rounded-full flex items-center justify-center">
              <ShoppingBag size={28} className="text-[#ccc]" />
            </div>
            <div>
              <p className="text-base font-medium mb-1">Your cart is empty</p>
              <p className="text-sm text-[#aaa]">Add items to get started.</p>
            </div>
            <Link href="/products" onClick={closeCart} className="h-11 px-6 bg-[#111] text-white rounded-xl text-sm font-medium flex items-center hover:bg-[#333]">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3.5">
                  <div className="w-18 h-22.5 rounded-lg overflow-hidden bg-[#f5f5f4] shrink-0">
                    <img src={item.imgUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <span className="text-sm font-medium leading-tight">{item.name}</span>
                      <button onClick={() => removeItem(item.productId, item.size, item.color)} className="shrink-0 text-[#ccc] hover:text-red-600 cursor-pointer">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="text-xs text-[#aaa] mt-0.5">
                      {item.size} · {item.color}
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-[#e5e5e5] rounded-md overflow-hidden">
                        <button onClick={() => updateQty(item.productId, item.size, item.color, -1)} className="w-7.5 h-7.5 flex items-center justify-center text-[#555] hover:bg-[#f5f5f4] cursor-pointer">
                          <Minus size={13} />
                        </button>
                        <span className="px-2 text-sm font-medium min-w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.productId, item.size, item.color, 1)} className="w-7.5 h-7.5 flex items-center justify-center text-[#555] hover:bg-[#f5f5f4] cursor-pointer">
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="text-[15px] font-semibold">{money(item.price * item.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e8e8e7] px-6 py-4 flex flex-col gap-3 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code (try SAVE10)"
                  className="flex-1 h-10 px-3 border border-[#e5e5e5] rounded-md text-[13px] outline-none bg-[#fafafa] focus:border-[#1B4FD8]"
                />
                <button onClick={applyPromo} className="h-10 px-3.5 bg-[#f5f5f4] hover:bg-[#e5e5e4] hover:text-[#111] text-[#555] rounded-md text-[13px] font-medium whitespace-nowrap cursor-pointer">
                  Apply
                </button>
              </div>
              {promoApplied && (
                <div className="flex items-center gap-1.5 text-[13px] text-green-600 font-medium">
                  SAVE10 applied — saving {money(discount)}
                </div>
              )}
              <div className="flex flex-col gap-1.5 py-2 border-t border-[#f5f5f5] text-[13px] text-[#888]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#555]">{money(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[#555]">{shipping === 0 ? "Free" : money(shipping)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[15px] font-semibold">Total</span>
                <span className="text-xl font-bold">{money(total)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full h-13 bg-[#111] text-white rounded-xl text-[15px] font-semibold flex items-center justify-center hover:bg-[#333]"
              >
                Checkout →
              </Link>
              <Link href="/products" onClick={closeCart} className="w-full h-11 text-[#aaa] text-sm flex items-center justify-center hover:text-[#555]">
                Continue shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
