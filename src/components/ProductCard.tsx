"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { money, badgeMeta } from "@/lib/format";
import { useWishlistStore } from "@/lib/store";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  badge?: string | null;
  category: { name: string };
  images: { url: string }[];
  avgRating?: number;
  reviewCount?: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { ids, toggle } = useWishlistStore();
  const wishlisted = ids.includes(product.id);
  const bc = badgeMeta(product.badge);
  const rating = product.avgRating ?? 4.3;
  const stars = [1, 2, 3, 4, 5];

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-[#f5f5f4] mb-3">
        <img
          src={product.images[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
          }}
          aria-label="Toggle wishlist"
          className="absolute top-2.5 right-2.5 w-8.5 h-8.5 bg-white/90 hover:bg-white rounded-full flex items-center justify-center cursor-pointer"
        >
          <Heart size={14} fill={wishlisted ? "#ef4444" : "none"} stroke={wishlisted ? "#ef4444" : "#555"} strokeWidth={2} />
        </button>
        {bc && product.badge && (
          <span
            className="absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
            style={{ background: bc.bg, color: bc.color }}
          >
            {product.badge}
          </span>
        )}
      </div>
      <span className="text-[11px] text-[#aaa] uppercase tracking-wider">{product.category.name}</span>
      <div className="text-sm font-medium text-[#111] mt-0.5 mb-1">{product.name}</div>
      <div className="flex items-center gap-1 mb-1">
        {stars.map((s) => (
          <span key={s} className="text-xs" style={{ color: s <= Math.round(rating) ? "#f59e0b" : "#e0e0e0" }}>
            ★
          </span>
        ))}
        <span className="text-[11px] text-[#ccc]">({product.reviewCount ?? 0})</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[15px] font-semibold">{money(product.price)}</span>
        {product.compareAtPrice && (
          <span className="text-xs text-[#ccc] line-through">{money(product.compareAtPrice)}</span>
        )}
      </div>
    </Link>
  );
}
