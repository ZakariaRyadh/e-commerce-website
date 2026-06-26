"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock } from "lucide-react";
import { useUiStore, useRecentSearchStore } from "@/lib/store";
import { money } from "@/lib/format";

type Suggestion = { id: string; slug: string; name: string; price: string; imgUrl: string };

const TAGS = ["New Arrivals", "Sale Items", "Knitwear", "Outerwear"];

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUiStore();
  const { terms, add } = useRecentSearchStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (!searchOpen) setQuery("");
  }, [searchOpen]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const id = setTimeout(() => {
      fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then(setResults);
    }, 200);
    return () => clearTimeout(id);
  }, [query]);

  if (!searchOpen) return null;

  function go(term: string) {
    add(term);
    closeSearch();
    router.push(`/products?q=${encodeURIComponent(term)}`);
  }

  return (
    <div className="fixed inset-0 z-300 bg-white/97 backdrop-blur-md flex flex-col items-center pt-20 px-4">
      <div className="w-full max-w-[620px]">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && query && go(query)}
            placeholder="Search products…"
            className="w-full h-14 px-13 border-[1.5px] border-[#e5e5e5] rounded-2xl text-base sm:text-[17px] outline-none shadow-lg focus:border-[#1B4FD8]"
          />
          <button
            onClick={closeSearch}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-[#aaa] hover:bg-[#f5f5f4] hover:text-[#111] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-2 bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shadow-lg">
          {query.length === 0 && (
            <>
              {terms.length > 0 && (
                <div className="p-3">
                  <div className="text-[11px] font-bold tracking-wider text-[#ccc] uppercase px-2 mb-1">Recent</div>
                  {terms.map((t) => (
                    <button
                      key={t}
                      onClick={() => go(t)}
                      className="flex items-center gap-2.5 w-full px-2 py-2.5 rounded-lg text-sm text-[#555] hover:bg-[#f5f5f4] hover:text-[#111] cursor-pointer text-left"
                    >
                      <Clock size={14} className="text-[#ccc]" />
                      {t}
                    </button>
                  ))}
                </div>
              )}
              <div className="p-4 flex gap-2 flex-wrap">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => go(tag)}
                    className="h-8.5 px-3.5 border border-[#e5e5e5] rounded-full text-[13px] text-[#555] bg-white hover:bg-[#f5f5f4] cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </>
          )}

          {query.length > 1 && results.length > 0 && (
            <div className="p-3">
              <div className="text-[11px] font-bold tracking-wider text-[#ccc] uppercase px-2 mb-1">Products</div>
              {results.map((p) => (
                <a
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={() => add(query)}
                  className="flex items-center gap-3 w-full px-2 py-2.5 rounded-lg hover:bg-[#f5f5f4] cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-md overflow-hidden bg-[#f5f5f4] shrink-0">
                    <img src={p.imgUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-medium text-[#111] text-sm">{p.name}</div>
                    <div className="text-[13px] text-[#aaa]">{money(p.price)}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
