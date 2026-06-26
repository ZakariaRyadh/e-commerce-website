"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[400px] flex flex-col gap-8">
        <Link href="/" className="text-[20px] font-bold tracking-tight text-center">
          LUMA
        </Link>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-[26px] font-bold tracking-tight">Create your account</h1>
          <p className="text-[14px] text-[#888]">Join to track orders, save favorites, and more.</p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#555]">First name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8] focus:ring-3 focus:ring-[#1B4FD8]/10"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#555]">Last name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8] focus:ring-3 focus:ring-[#1B4FD8]/10"
              />
            </div>
          </div>
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
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#555]">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8] focus:ring-3 focus:ring-[#1B4FD8]/10"
            />
          </div>
          {error && <p className="text-[13px] text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-[#111] text-white rounded-xl text-[15px] font-semibold cursor-pointer hover:bg-[#333] disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
        <p className="text-[14px] text-[#888] text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-[#1B4FD8] font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
