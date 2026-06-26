"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Search, Heart, ShoppingBag, Menu, X, User } from "lucide-react";
import { useCartStore, useUiStore } from "@/lib/store";

export function Header() {
  const { data: session } = useSession();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const { toggleCart, openSearch } = useUiStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-100 bg-white/95 backdrop-blur-md border-b border-[#e8e8e7]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center h-16 gap-4 sm:gap-6">
        <Link href="/" className="text-xl font-bold tracking-tight shrink-0">
          LUMA
        </Link>

        <nav className="hidden md:flex gap-7 items-center flex-1">
          <Link href="/" className="text-sm text-[#666] hover:text-[#111]">
            Home
          </Link>
          <Link href="/products" className="text-sm text-[#666] hover:text-[#111]">
            Shop
          </Link>
          <Link href="/products" className="text-sm text-[#666] hover:text-[#111]">
            Collections
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-1 ml-auto">
          <button
            onClick={openSearch}
            aria-label="Search"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#555] hover:bg-[#f5f5f4] hover:text-[#111] cursor-pointer"
          >
            <Search size={18} />
          </button>
          <Link
            href={session ? "/account" : "/login"}
            aria-label="Account"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#555] hover:bg-[#f5f5f4] hover:text-[#111]"
          >
            <User size={18} />
          </Link>
          <button
            onClick={toggleCart}
            aria-label="Cart"
            className="relative w-10 h-10 flex items-center justify-center rounded-lg text-[#555] hover:bg-[#f5f5f4] hover:text-[#111] cursor-pointer"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-[#1B4FD8] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {isAdmin ? (
            <Link
              href="/admin"
              className="h-8 px-3 bg-[#f5f5f4] hover:bg-[#e5e5e4] hover:text-[#111] rounded-md text-xs font-medium text-[#555] ml-1 flex items-center"
            >
              Admin ↗
            </Link>
          ) : !session ? (
            <div className="flex items-center gap-2 ml-2">
              <Link
                href="/login"
                className="h-8 px-3 flex items-center text-xs font-medium text-[#555] hover:text-[#111]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="h-8 px-3 flex items-center bg-[#111] text-white rounded-md text-xs font-medium hover:bg-[#333]"
              >
                Sign up
              </Link>
            </div>
          ) : null}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-1 ml-auto">
          <button onClick={openSearch} aria-label="Search" className="w-10 h-10 flex items-center justify-center rounded-lg text-[#555]">
            <Search size={18} />
          </button>
          <button onClick={toggleCart} aria-label="Cart" className="relative w-10 h-10 flex items-center justify-center rounded-lg text-[#555]">
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-[#1B4FD8] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#555]"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#e8e8e7] bg-white px-4 py-4 flex flex-col gap-1">
          <Link href="/" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-[#333]">
            Home
          </Link>
          <Link href="/products" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-[#333]">
            Shop
          </Link>
          <Link href="/products" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-[#333]">
            Collections
          </Link>
          <div className="h-px bg-[#f0f0f0] my-2" />
          {isAdmin && (
            <Link href="/admin" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-[#1B4FD8]">
              Admin Dashboard ↗
            </Link>
          )}
          {!session ? (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-[#333]">
                Log in
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-[#1B4FD8]">
                Sign up
              </Link>
            </>
          ) : (
            <Link href="/account" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-[#333]">
              My Account
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
