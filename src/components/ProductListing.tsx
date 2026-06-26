"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";

type Category = { id: string; name: string; slug: string };
type Product = ProductCardData & { categoryId: string; price: number | string; avgRating: number };

const RATING_OPTS = [
  { label: "Any", v: 0 },
  { label: "4★ & above", v: 4 },
  { label: "4.5★ & above", v: 4.5 },
];

export function ProductListing({
  categories,
  initialProducts,
  initialQuery,
  initialCategory,
}: {
  categories: Category[];
  initialProducts: Product[];
  initialQuery: string;
  initialCategory?: string;
}) {
  const [filterCat, setFilterCat] = useState(initialCategory ?? "all");
  const [maxPrice, setMaxPrice] = useState(300);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = initialProducts.filter((p) => {
      if (filterCat !== "all" && p.category.name !== filterCat) return false;
      if (Number(p.price) > maxPrice) return false;
      if (minRating > 0 && p.avgRating < minRating) return false;
      return true;
    });
    if (sortBy === "price-low") list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === "price-high") list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortBy === "rating") list = [...list].sort((a, b) => b.avgRating - a.avgRating);
    return list;
  }, [initialProducts, filterCat, maxPrice, minRating, sortBy]);

  function clearFilters() {
    setFilterCat("all");
    setMaxPrice(300);
    setMinRating(0);
  }

  const FiltersPanel = () => (
    <>
      <div className="mb-6">
        <div className="text-[11px] font-bold tracking-wider uppercase text-[#bbb] mb-2.5">Category</div>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => setFilterCat("all")}
            className={`text-left flex justify-between px-2.5 py-2 rounded-lg text-[13px] cursor-pointer ${
              filterCat === "all" ? "bg-[#eef2ff] text-[#1B4FD8] font-semibold" : "text-[#555] hover:bg-[#f0f0f0]"
            }`}
          >
            <span>All</span>
            <span className="text-[11px] opacity-55">{initialProducts.length}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.name)}
              className={`text-left flex justify-between px-2.5 py-2 rounded-lg text-[13px] cursor-pointer ${
                filterCat === cat.name ? "bg-[#eef2ff] text-[#1B4FD8] font-semibold" : "text-[#555] hover:bg-[#f0f0f0]"
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[11px] opacity-55">
                {initialProducts.filter((p) => p.category.name === cat.name).length}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <div className="text-[11px] font-bold tracking-wider uppercase text-[#bbb] mb-2.5">Price Range</div>
        <input
          type="range"
          min={0}
          max={300}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#1B4FD8] cursor-pointer"
        />
        <div className="flex justify-between mt-2 text-[13px] text-[#555]">
          <span>$0</span>
          <span className="font-semibold text-[#111]">Up to ${maxPrice}</span>
        </div>
      </div>
      <div>
        <div className="text-[11px] font-bold tracking-wider uppercase text-[#bbb] mb-2.5">Min. Rating</div>
        <div className="flex flex-col gap-0.5">
          {RATING_OPTS.map((r) => (
            <button
              key={r.label}
              onClick={() => setMinRating(r.v)}
              className={`text-left flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] cursor-pointer ${
                minRating === r.v ? "bg-[#eef2ff] text-[#1B4FD8]" : "text-[#555] hover:bg-[#f0f0f0]"
              }`}
            >
              <span className="text-[#f59e0b] text-xs tracking-[1px]">★★★★★</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 pb-20">
      <div className="flex items-center gap-2 text-[13px] text-[#bbb] mb-6">
        <Link href="/" className="hover:text-[#111]">
          Home
        </Link>
        <span>›</span>
        <span className="text-[#333] font-medium">Shop</span>
      </div>

      <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight">
            {initialQuery ? `Results for "${initialQuery}"` : "All Products"}
          </h1>
          <p className="text-sm text-[#aaa] mt-1">{filtered.length} products</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden h-10 px-3.5 border border-[#e5e5e5] rounded-lg text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3.5 border border-[#e5e5e5] rounded-lg text-sm bg-white cursor-pointer outline-none"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8 items-start">
        <aside className="hidden lg:block bg-[#fafafa] border border-[#e8e8e7] rounded-2xl p-6 sticky top-20">
          <div className="text-[15px] font-semibold mb-6">Filters</div>
          <FiltersPanel />
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-5">
              <div className="w-18 h-18 bg-[#f5f5f4] rounded-full flex items-center justify-center">
                <Search size={28} className="text-[#ccc]" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-2">No products found</h3>
                <p className="text-sm text-[#aaa] max-w-[300px] leading-relaxed">
                  Try adjusting your filters or search terms.
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="h-11 px-6 bg-[#111] text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-[#333]"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-200 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85vw] max-w-[340px] bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[15px] font-semibold">Filters</div>
              <button onClick={() => setMobileFiltersOpen(false)} className="cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <FiltersPanel />
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full h-11 bg-[#111] text-white rounded-xl text-sm font-medium cursor-pointer"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
