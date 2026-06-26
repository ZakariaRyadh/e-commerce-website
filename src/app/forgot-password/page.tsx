"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Something went wrong.");
      return;
    }

    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[400px] flex flex-col gap-8">
        <Link href="/" className="text-[20px] font-bold tracking-tight text-center">
          LUMA
        </Link>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-[26px] font-bold tracking-tight">Forgot your password?</h1>
          <p className="text-[14px] text-[#888]">Enter your email and we&apos;ll send you a reset code.</p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#555]">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8] focus:ring-3 focus:ring-[#1B4FD8]/10"
            />
          </div>
          {error && <p className="text-[13px] text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-[#111] text-white rounded-xl text-[15px] font-semibold cursor-pointer hover:bg-[#333] disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Reset Code"}
          </button>
        </form>
        <p className="text-[14px] text-[#888] text-center">
          Remembered it?{" "}
          <Link href="/login" className="text-[#1B4FD8] font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
