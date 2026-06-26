"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/store";
import { money } from "@/lib/format";

const STEPS = ["Shipping", "Payment", "Review"];

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const { items, promoApplied, clear } = useCartStore();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState({ street: "", city: "", state: "", zip: "" });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 9.95;
  const tax = subtotal * 0.08;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping + tax - discount;

  if (status === "unauthenticated") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold">Log in to check out</h1>
        <p className="text-[#888] text-sm">You need an account to place an order.</p>
        <Link href="/login" className="h-11 px-6 bg-[#111] text-white rounded-xl text-sm font-medium flex items-center">
          Log In
        </Link>
      </div>
    );
  }

  if (items.length === 0 && !placing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-[#888] text-sm">Add items before checking out.</p>
        <Link href="/products" className="h-11 px-6 bg-[#111] text-white rounded-xl text-sm font-medium flex items-center">
          Browse Products
        </Link>
      </div>
    );
  }

  async function placeOrder() {
    setPlacing(true);
    setError(null);
    const fullAddress = `${address.street}, ${address.city} ${address.state} ${address.zip}`.trim();
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          qty: i.qty,
          size: i.size,
          color: i.color,
        })),
        subtotal,
        shipping,
        tax,
        total,
        promoCode: promoApplied ? "SAVE10" : undefined,
        shippingAddress: fullAddress || "123 Main St, New York NY 10001",
      }),
    });

    if (!res.ok) {
      setError("Could not place order. Please try again.");
      setPlacing(false);
      return;
    }

    clear();
    router.push("/account");
  }

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-20">
        <Link href="/" className="text-xl font-bold tracking-tight mb-8 sm:mb-10 block">
          LUMA
        </Link>
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 sm:gap-12 items-start">
          <div className="flex flex-col gap-6 sm:gap-7">
            {/* Steps */}
            <div className="flex items-center">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold"
                      style={{
                        background: i <= step ? "#111" : "#fff",
                        color: i <= step ? "#fff" : "#bbb",
                        border: i <= step ? "2px solid #111" : "2px solid #e0e0e0",
                      }}
                    >
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span
                      className="text-xs font-medium whitespace-nowrap"
                      style={{ color: i <= step ? "#111" : "#bbb" }}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="h-px flex-1 mx-2 mb-5"
                      style={{ background: i < step ? "#111" : "#e0e0e0" }}
                    />
                  )}
                </div>
              ))}
            </div>

            {step === 0 && (
              <div className="bg-white rounded-2xl border border-[#e8e8e7] p-6 sm:p-7 flex flex-col gap-4">
                <h2 className="text-[17px] font-semibold">Contact &amp; Shipping</h2>
                <Field label="Email address" type="email" placeholder="you@example.com" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name" placeholder="Jane" />
                  <Field label="Last name" placeholder="Smith" />
                </div>
                <Field
                  label="Street address"
                  placeholder="123 Main Street"
                  value={address.street}
                  onChange={(v) => setAddress((a) => ({ ...a, street: v }))}
                />
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
                  <Field label="City" placeholder="New York" value={address.city} onChange={(v) => setAddress((a) => ({ ...a, city: v }))} />
                  <Field label="State" placeholder="NY" value={address.state} onChange={(v) => setAddress((a) => ({ ...a, state: v }))} />
                  <Field label="ZIP" placeholder="10001" value={address.zip} onChange={(v) => setAddress((a) => ({ ...a, zip: v }))} />
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <div className="border-[1.5px] border-[#1B4FD8] rounded-xl px-4 py-3.5 flex justify-between items-center bg-[#f0f5ff] cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#1B4FD8] border-2.5 border-white shadow-[0_0_0_2px_#1B4FD8] shrink-0" />
                      <div>
                        <div className="text-[13px] font-semibold">Standard Shipping</div>
                        <div className="text-xs text-[#888] mt-0.5">3–5 business days</div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">Free</span>
                  </div>
                  <div className="border border-[#e5e5e5] rounded-xl px-4 py-3.5 flex justify-between items-center cursor-pointer hover:bg-[#fafafa]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border-[1.5px] border-[#ddd] shrink-0" />
                      <div>
                        <div className="text-[13px] font-semibold">Express Shipping</div>
                        <div className="text-xs text-[#888] mt-0.5">1–2 business days</div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">$9.95</span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="h-13 bg-[#111] text-white rounded-xl text-[15px] font-semibold mt-2 cursor-pointer hover:bg-[#333]"
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="bg-white rounded-2xl border border-[#e8e8e7] p-6 sm:p-7 flex flex-col gap-4">
                <h2 className="text-[17px] font-semibold">Payment</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Card", "PayPal", "Apple Pay", "Google Pay"].map((m, i) => (
                    <div
                      key={m}
                      className={`rounded-xl p-3 flex flex-col items-center gap-1.5 cursor-pointer border ${
                        i === 0 ? "border-[1.5px] border-[#1B4FD8] bg-[#f0f5ff]" : "border-[#e5e5e5] hover:bg-[#fafafa]"
                      }`}
                    >
                      <span className={`text-[11px] font-semibold ${i === 0 ? "text-[#1B4FD8]" : "text-[#666]"}`}>{m}</span>
                    </div>
                  ))}
                </div>
                <Field label="Card number" placeholder="1234 5678 9012 3456" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry" placeholder="MM / YY" />
                  <Field label="CVV" placeholder="123" />
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setStep(0)}
                    className="h-13 px-6 bg-white text-[#555] border-[1.5px] border-[#e5e5e5] rounded-xl text-[15px] font-medium cursor-pointer hover:bg-[#f5f5f4]"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 h-13 bg-[#111] text-white rounded-xl text-[15px] font-semibold cursor-pointer hover:bg-[#333]"
                  >
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl border border-[#e8e8e7] p-6 sm:p-7 flex flex-col gap-4">
                <h2 className="text-[17px] font-semibold">Review Order</h2>
                <div className="bg-[#f9f9f8] rounded-xl p-4 flex flex-col gap-2.5">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#888]">Ship to</span>
                    <span className="font-medium">123 Main St, New York NY 10001</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#888]">Payment</span>
                    <span className="font-medium">Card •••• 3456</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#888]">Delivery</span>
                    <span className="font-medium">Standard (Free)</span>
                  </div>
                </div>
                {error && <p className="text-[13px] text-red-600">{error}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="h-13 px-6 bg-white text-[#555] border-[1.5px] border-[#e5e5e5] rounded-xl text-[15px] font-medium cursor-pointer hover:bg-[#f5f5f4]"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={placing}
                    className="flex-1 h-13 bg-[#1B4FD8] text-white rounded-xl text-[15px] font-semibold cursor-pointer hover:bg-[#1240b0] disabled:opacity-60"
                  >
                    {placing ? "Placing order…" : `Place Order — ${money(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white border border-[#e8e8e7] rounded-2xl p-6 lg:sticky lg:top-10 flex flex-col gap-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider">Order Summary</h3>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 items-center">
                  <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-[#f5f5f4] shrink-0">
                    <img src={item.imgUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#555] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                      {item.qty}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{item.name}</div>
                    <div className="text-xs text-[#aaa] mt-0.5">
                      {item.size} · {item.color}
                    </div>
                  </div>
                  <span className="text-sm font-medium shrink-0">{money(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#f0f0f0] pt-3.5 flex flex-col gap-2">
              <div className="flex justify-between text-[13px] text-[#888]">
                <span>Subtotal</span>
                <span className="text-[#333]">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-[#888]">
                <span>Shipping</span>
                <span className="text-[#333]">{shipping === 0 ? "Free" : money(shipping)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-[#888]">
                <span>Tax</span>
                <span className="text-[#333]">{money(tax)}</span>
              </div>
            </div>
            <div className="border-t border-[#e5e5e5] pt-3.5 flex justify-between items-center">
              <span className="text-[15px] font-semibold">Total</span>
              <span className="text-xl font-bold">{money(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[#555]">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8]"
      />
    </div>
  );
}
