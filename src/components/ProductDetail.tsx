"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Truck, RotateCcw } from "lucide-react";
import { money, stockMeta, badgeMeta, colorSwatch } from "@/lib/format";
import { useCartStore, useUiStore, useWishlistStore } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";

type Review = {
  id: string;
  userId: string;
  rating: number;
  title: string;
  text: string;
  photoUrl: string | null;
  createdAt: Date;
  user: { firstName: string; lastName: string };
};

type Variant = { size: string; color: string; stock: number };

type ProductDetailData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "SOLD_OUT";
  totalStock: number;
  badge: string | null;
  material: string | null;
  fit: string | null;
  care: string | null;
  origin: string | null;
  colors: string[];
  sizes: string[];
  variants: Variant[];
  category: { name: string };
  images: { url: string }[];
  reviews: Review[];
};

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? "#f59e0b" : "#e0e0e0", fontSize: size }}>
          ★
        </span>
      ))}
    </div>
  );
}

export function ProductDetail({
  product,
  related,
}: {
  product: ProductDetailData;
  related: { id: string; slug: string; name: string; price: number; images: { url: string }[]; category: { name: string } }[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const firstInStock = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [imgIdx, setImgIdx] = useState(0);
  const [selSize, setSelSize] = useState(firstInStock?.size ?? product.sizes[0] ?? "");
  const [selColor, setSelColor] = useState(firstInStock?.color ?? product.colors[0] ?? "");
  const [tab, setTab] = useState<"description" | "specs" | "reviews">("description");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const { addItem } = useCartStore();
  const { openCart } = useUiStore();
  const { ids, toggle } = useWishlistStore();
  const wishlisted = ids.includes(product.id);

  const hasUserReviewed = session?.user && product.reviews.some((r) => r.userId === session.user.id);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError(null);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, rating: reviewRating, title: reviewTitle, text: reviewText }),
    });

    setReviewSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setReviewError(j.error ?? "Could not submit review.");
      return;
    }

    setShowReviewForm(false);
    setReviewTitle("");
    setReviewText("");
    setReviewRating(5);
    router.refresh();
  }

  const selectedVariant = product.variants.find((v) => v.size === selSize && v.color === selColor);
  const variantStock = selectedVariant?.stock ?? 0;
  const variantStockStatus: "IN_STOCK" | "LOW_STOCK" | "SOLD_OUT" =
    variantStock === 0 ? "SOLD_OUT" : variantStock <= 3 ? "LOW_STOCK" : "IN_STOCK";

  const sizesWithStock = new Set(product.variants.filter((v) => v.stock > 0).map((v) => v.size));
  const colorsForSelectedSize = product.variants.filter((v) => v.size === selSize);

  function selectSize(size: string) {
    setSelSize(size);
    const stillValid = product.variants.find((v) => v.size === size && v.color === selColor);
    if (!stillValid || stillValid.stock === 0) {
      const fallback = product.variants.find((v) => v.size === size && v.stock > 0) ?? product.variants.find((v) => v.size === size);
      if (fallback) setSelColor(fallback.color);
    }
  }

  const price = product.price;
  const compareAt = product.compareAtPrice;
  const discount = compareAt ? Math.round((1 - price / compareAt) * 100) : null;
  const stock = stockMeta(variantStockStatus);
  const bc = badgeMeta(product.badge);

  const avgRating =
    product.reviews.length > 0 ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length : 0;

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      price,
      imgUrl: product.images[0]?.url ?? "",
      size: selSize,
      color: selColor,
    });
    openCart();
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 pb-20">
      <div className="flex items-center gap-2 text-[13px] text-[#bbb] mb-7 flex-wrap">
        <Link href="/" className="hover:text-[#111]">
          Home
        </Link>
        <span>›</span>
        <Link href="/products" className="hover:text-[#111]">
          Shop
        </Link>
        <span>›</span>
        <span className="text-[#333] font-medium">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Gallery */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-20">
          <div className="aspect-4/5 rounded-2xl overflow-hidden bg-[#f5f5f4]">
            <img
              src={product.images[imgIdx]?.url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-400 hover:scale-105"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`aspect-square rounded-lg overflow-hidden bg-[#f5f5f4] cursor-pointer border-2 ${
                  i === imgIdx ? "border-[#111]" : "border-[#e5e5e5]"
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#aaa]">{product.category.name}</span>
            {product.badge && bc && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: bc.bg, color: bc.color }}>
                {product.badge}
              </span>
            )}
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-tight">{product.name}</h1>
          <div className="flex items-center gap-2.5">
            <Stars rating={avgRating} />
            <span className="text-sm font-semibold text-[#555]">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-[#bbb]">({product.reviews.length} reviews)</span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-[28px] sm:text-[32px] font-bold tracking-tight">{money(price)}</span>
            {compareAt && (
              <>
                <span className="text-xl text-[#ccc] line-through">{money(compareAt)}</span>
                <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-[13px] font-bold">-{discount}%</span>
              </>
            )}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg w-fit" style={{ background: stock.bg }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: stock.color }} />
            <span className="text-[13px] font-medium" style={{ color: stock.color }}>
              {stock.label}
            </span>
          </div>

          {product.colors.length > 1 && (
            <div>
              <div className="text-sm font-medium mb-3">
                Color: <span className="font-normal text-[#777]">{selColor}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((c) => {
                  const combo = colorsForSelectedSize.find((v) => v.color === c);
                  const outOfStock = !combo || combo.stock === 0;
                  return (
                    <button
                      key={c}
                      onClick={() => !outOfStock && setSelColor(c)}
                      disabled={outOfStock}
                      className="relative w-7 h-7 rounded-full cursor-pointer shrink-0 disabled:cursor-not-allowed"
                      style={{
                        background: colorSwatch(c),
                        border: `2.5px solid ${c === selColor ? "#fff" : "transparent"}`,
                        boxShadow: c === selColor ? "0 0 0 2.5px #1B4FD8" : "none",
                        opacity: outOfStock ? 0.3 : 1,
                      }}
                      aria-label={outOfStock ? `${c} (out of stock)` : c}
                      title={outOfStock ? `${c} — out of stock` : c}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {product.sizes.length > 1 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">
                  Size: <span className="font-normal text-[#777]">{selSize}</span>
                </span>
                <button className="text-[13px] text-[#1B4FD8] font-medium cursor-pointer">Size guide →</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((sz) => {
                  const outOfStock = !sizesWithStock.has(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => selectSize(sz)}
                      className={`h-10 min-w-12 px-3.5 rounded-lg text-sm font-medium cursor-pointer border-[1.5px] ${
                        sz === selSize ? "bg-[#111] text-white border-[#111]" : "bg-white text-[#333] border-[#e5e5e5]"
                      } ${outOfStock ? "opacity-40" : ""}`}
                      title={outOfStock ? `${sz} — out of stock` : sz}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {variantStock > 0 && variantStock <= 3 && (
            <p className="text-[13px] text-amber-600 font-medium -mt-1">Only {variantStock} left in this size/color</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleAddToCart}
              disabled={variantStock === 0}
              className="flex-1 h-13.5 bg-[#111] text-white rounded-xl text-[15px] font-semibold cursor-pointer hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {variantStock === 0 ? "Sold Out" : "Add to Cart"}
            </button>
            <button
              onClick={() => toggle(product.id)}
              className="w-13.5 h-13.5 bg-white border-[1.5px] border-[#e5e5e5] rounded-xl flex items-center justify-center shrink-0 cursor-pointer hover:bg-red-50 hover:border-red-200"
            >
              <Heart size={20} fill={wishlisted ? "#ef4444" : "none"} stroke={wishlisted ? "#ef4444" : "#555"} strokeWidth={1.8} />
            </button>
          </div>

          <div className="border border-[#e8e8e7] rounded-xl px-5 py-4 flex flex-col gap-3 bg-[#fafafa]">
            <div className="flex items-center gap-3">
              <Truck size={16} className="text-[#666] shrink-0" />
              <div>
                <div className="text-[13px] font-medium">Free shipping over $100</div>
                <div className="text-xs text-[#aaa] mt-0.5">3–5 business days</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw size={16} className="text-[#666] shrink-0" />
              <div>
                <div className="text-[13px] font-medium">Free 30-day returns</div>
                <div className="text-xs text-[#aaa] mt-0.5">Easy, no-hassle policy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16 border-t border-[#e8e8e7]">
        <div className="flex border-b border-[#e8e8e7] overflow-x-auto">
          {(["description", "specs", "reviews"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-4 text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 -mb-px ${
                tab === t ? "border-[#111] text-[#111]" : "border-transparent text-[#aaa]"
              }`}
            >
              {t === "description" ? "Description" : t === "specs" ? "Specifications" : `Reviews (${product.reviews.length})`}
            </button>
          ))}
        </div>

        {tab === "description" && (
          <div className="py-10 max-w-[640px] flex flex-col gap-4">
            <p className="text-[15px] text-[#444] leading-loose">{product.description}</p>
            <ul className="pl-5 flex flex-col gap-2 list-disc">
              <li className="text-[15px] text-[#444]">100% premium natural fabric</li>
              <li className="text-[15px] text-[#444]">Machine washable at 30°C</li>
              <li className="text-[15px] text-[#444]">Ethically produced in certified facility</li>
              <li className="text-[15px] text-[#444]">Relaxed, true-to-size fit</li>
            </ul>
          </div>
        )}

        {tab === "specs" && (
          <div className="py-10 max-w-[500px]">
            {[
              { label: "Material", value: product.material },
              { label: "Fit", value: product.fit },
              { label: "Care", value: product.care },
              { label: "Origin", value: product.origin },
              { label: "SKU", value: `LUMA-${product.id.slice(0, 6).toUpperCase()}` },
            ]
              .filter((row) => row.value)
              .map((row) => (
                <div key={row.label} className="flex border-b border-[#f0f0f0] py-3.5">
                  <span className="w-44 shrink-0 text-sm text-[#aaa]">{row.label}</span>
                  <span className="text-sm font-medium">{row.value}</span>
                </div>
              ))}
            {!product.material && !product.fit && !product.care && !product.origin && (
              <p className="text-sm text-[#aaa]">No specifications provided for this product yet.</p>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="py-10">
            <div className="flex items-center gap-12 pb-8 border-b border-[#e8e8e7] flex-wrap">
              <div className="text-center">
                <div className="text-[52px] font-bold tracking-tight leading-none">{avgRating.toFixed(1)}</div>
                <div className="flex gap-0.5 justify-center my-2">
                  <Stars rating={avgRating} size={18} />
                </div>
                <div className="text-[13px] text-[#aaa]">{product.reviews.length} reviews</div>
              </div>

              <div className="flex-1 min-w-[200px]">
                {!session ? (
                  <p className="text-sm text-[#aaa]">
                    <Link href="/login" className="text-[#1B4FD8] font-medium">
                      Log in
                    </Link>{" "}
                    to write a review.
                  </p>
                ) : hasUserReviewed ? (
                  <p className="text-sm text-[#aaa]">You&apos;ve already reviewed this product. Thanks!</p>
                ) : !showReviewForm ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="h-10 px-4 bg-[#111] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#333]"
                  >
                    Write a Review
                  </button>
                ) : null}
              </div>
            </div>

            {showReviewForm && (
              <form onSubmit={submitReview} className="py-7 border-b border-[#e8e8e7] flex flex-col gap-3.5 max-w-[480px]">
                <div>
                  <div className="text-sm font-medium mb-2">Your rating</div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        className="cursor-pointer text-2xl"
                        style={{ color: s <= reviewRating ? "#f59e0b" : "#e0e0e0" }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#555]">Title</label>
                  <input
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Sum up your experience"
                    className="h-10 px-3 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#555]">Review</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="What did you like or dislike?"
                    className="px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm outline-none resize-vertical focus:border-[#1B4FD8]"
                  />
                </div>
                {reviewError && <p className="text-[13px] text-red-600">{reviewError}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="h-10 px-4 bg-[#f5f5f4] text-[#555] rounded-lg text-sm font-medium cursor-pointer hover:bg-[#e5e5e4]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="h-10 px-4 bg-[#111] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#333] disabled:opacity-60"
                  >
                    {reviewSubmitting ? "Submitting…" : "Submit Review"}
                  </button>
                </div>
              </form>
            )}

            {product.reviews.length === 0 ? (
              <p className="py-8 text-sm text-[#aaa]">No reviews yet. Be the first to review this product.</p>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev.id} className="flex gap-4 py-7 border-b border-[#f5f5f5]">
                  <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center shrink-0 text-sm font-bold text-[#555]">
                    {rev.user.firstName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div>
                        <span className="text-sm font-semibold">
                          {rev.user.firstName} {rev.user.lastName.charAt(0)}.
                        </span>
                        <span className="text-[13px] text-[#bbb] ml-2.5">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Stars rating={rev.rating} size={14} />
                    </div>
                    <div className="text-sm font-semibold mb-1.5">{rev.title}</div>
                    <p className="text-sm text-[#555] leading-loose">{rev.text}</p>
                    {rev.photoUrl && (
                      <div className="mt-3 w-18 h-18 rounded-lg overflow-hidden bg-[#f5f5f4]">
                        <img src={rev.photoUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-18">
          <h2 className="text-2xl font-bold tracking-tight mb-7">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
