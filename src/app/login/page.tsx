"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
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
          <h1 className="text-[26px] font-bold tracking-tight">Welcome back</h1>
          <p className="text-[14px] text-[#888]">Log in to your account to continue.</p>
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
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#555]">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8] focus:ring-3 focus:ring-[#1B4FD8]/10"
            />
          </div>
          {error && <p className="text-[13px] text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-[#111] text-white rounded-xl text-[15px] font-semibold cursor-pointer hover:bg-[#333] disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>
        <p className="text-[14px] text-[#888] text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#1B4FD8] font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
