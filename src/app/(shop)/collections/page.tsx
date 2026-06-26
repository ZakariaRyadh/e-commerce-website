import Link from "next/link";
import { getNewArrivals, getBestSellers, getOnSaleProducts, getCategoryPreviews } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";

export default async function CollectionsPage() {
  const [newArrivals, bestSellers, onSale, categories] = await Promise.all([
    getNewArrivals(4),
    getBestSellers(4),
    getOnSaleProducts(4),
    getCategoryPreviews(7),
  ]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 pb-20">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-[36px] font-bold tracking-tight mb-2">Collections</h1>
        <p className="text-[15px] text-[#888]">Curated picks — new arrivals, best sellers, current sales, and every category.</p>
      </div>

      <CollectionRow title="New Arrivals" subtitle="Just landed" products={newArrivals} viewAllHref="/products?sort=newest" />
      <CollectionRow title="Best Sellers" subtitle="Most loved by customers" products={bestSellers} viewAllHref="/products?sort=popular" />

      {onSale.length > 0 && (
        <CollectionRow title="On Sale" subtitle="Limited-time price drops" products={onSale} viewAllHref="/products?sort=price-low" />
      )}

      <section className="mt-4">
        <h2 className="text-2xl font-bold tracking-tight mb-7">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="relative aspect-square rounded-2xl overflow-hidden bg-[#f0ede8] group"
            >
              {cat.imgUrl ? (
                <img
                  src={cat.imgUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-[#f0ede8]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[15px] font-semibold text-white">{cat.name}</div>
                <div className="text-xs text-white/70 mt-0.5">{cat.count} items</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function CollectionRow({
  title,
  subtitle,
  products,
  viewAllHref,
}: {
  title: string;
  subtitle: string;
  products: Awaited<ReturnType<typeof getNewArrivals>>;
  viewAllHref: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="mb-14">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-[#aaa] mt-0.5">{subtitle}</p>
        </div>
        <Link href={viewAllHref} className="text-sm text-[#1B4FD8] font-medium hover:text-[#1240b0] whitespace-nowrap">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
