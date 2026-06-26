import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";
import { getFeaturedProducts, getCategories } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(4), getCategories()]);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-0 lg:min-h-[560px] py-10 lg:py-16">
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-[#f5f5f4] px-3.5 py-1.5 rounded-full w-fit">
              <span className="w-1.5 h-1.5 bg-[#1B4FD8] rounded-full inline-block" />
              <span className="text-xs font-medium text-[#666] tracking-wide">New Collection — Summer 2026</span>
            </div>
            <h1 className="text-[40px] sm:text-[56px] lg:text-[68px] font-bold tracking-tight leading-[1.02]">
              Designed for
              <br />
              <span className="text-[#1B4FD8]">everyday</span>
              <br />
              living.
            </h1>
            <p className="text-base sm:text-[17px] text-[#666] leading-relaxed max-w-[380px]">
              Thoughtfully crafted essentials built to last. Timeless pieces that fit your life, effortlessly.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/products" className="h-13 px-8 bg-[#111] text-white rounded-xl text-[15px] font-medium flex items-center hover:bg-[#333]">
                Shop Now
              </Link>
              <Link href="/products" className="h-13 px-7 bg-white text-[#111] border-[1.5px] border-[#e5e5e5] rounded-xl text-[15px] font-medium flex items-center hover:bg-[#f5f5f4]">
                View Collections
              </Link>
            </div>
            <div className="flex gap-8 pt-2">
              <div>
                <div className="text-xl font-bold tracking-tight">12k+</div>
                <div className="text-xs text-[#999] mt-0.5">Happy customers</div>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight">98%</div>
                <div className="text-xs text-[#999] mt-0.5">Satisfaction rate</div>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight">Free</div>
                <div className="text-xs text-[#999] mt-0.5">Returns always</div>
              </div>
            </div>
          </div>
          <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-[#f0ede8] order-1 lg:order-2">
            <img src="https://picsum.photos/seed/luma_hero/800/1000" alt="Hero" className="w-full h-full object-cover" />
            {featured[0] && (
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 bg-white/95 backdrop-blur-sm rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 shadow-xl">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#aaa] mb-1">Best Seller</div>
                <div className="text-sm font-semibold">{featured[0].name}</div>
                <div className="text-[17px] font-bold text-[#1B4FD8] mt-1">${Number(featured[0].price).toFixed(0)}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight">Featured products</h2>
            <p className="text-sm text-[#aaa] mt-1">Curated picks this season</p>
          </div>
          <Link href="/products" className="text-sm text-[#1B4FD8] font-medium hover:text-[#1240b0] whitespace-nowrap">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-10 sm:pb-16">
        <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight mb-7">Shop by category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((cat, i) => (
            <Link key={cat.id} href="/products" className="relative aspect-square rounded-2xl overflow-hidden bg-[#f0ede8] group">
              <img
                src={`https://picsum.photos/seed/cat${i}/600/600`}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="text-[17px] font-semibold text-white">{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="border-t border-b border-[#e8e8e7] py-8 px-4 sm:px-6 bg-[#fafafa]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {[
            { icon: Truck, title: "Free shipping $100+", sub: "Delivered in 3–5 days" },
            { icon: RotateCcw, title: "Free 30-day returns", sub: "Hassle-free policy" },
            { icon: ShieldCheck, title: "Secure payments", sub: "SSL encrypted checkout" },
            { icon: Headphones, title: "24/7 support", sub: "Always here to help" },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-white border border-[#e8e8e7] rounded-xl flex items-center justify-center shrink-0">
                <Icon size={17} className="text-[#555]" />
              </div>
              <div>
                <div className="text-[13px] font-semibold">{title}</div>
                <div className="text-xs text-[#aaa] mt-0.5">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-[480px] mx-auto text-center flex flex-col items-center gap-4">
          <span className="text-[11px] font-bold tracking-widest text-[#aaa] uppercase">Newsletter</span>
          <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-tight">Stay in the loop.</h2>
          <p className="text-[15px] text-[#777] leading-relaxed">
            Be first to know about new collections, exclusive offers, and style picks.
          </p>
          <form className="flex w-full max-w-[420px] bg-white border-[1.5px] border-[#e5e5e5] rounded-xl overflow-hidden shadow-sm">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3.5 text-sm outline-none min-w-0"
            />
            <button type="submit" className="px-5 bg-[#111] text-white text-sm font-medium shrink-0 hover:bg-[#333] cursor-pointer">
              Subscribe
            </button>
          </form>
          <p className="text-xs text-[#ccc]">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}
