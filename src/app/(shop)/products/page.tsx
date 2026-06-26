import { getCategories, getProducts } from "@/lib/data";
import { ProductListing } from "@/components/ProductListing";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const { q, category, sort } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ search: q }),
  ]);

  const initialCategoryName = categories.find((c) => c.slug === category)?.name ?? "all";
  const validSorts = ["popular", "newest", "price-low", "price-high", "rating"];
  const initialSort = validSorts.includes(sort ?? "") ? sort! : "popular";

  return (
    <ProductListing
      categories={categories}
      initialProducts={products}
      initialQuery={q ?? ""}
      initialCategory={initialCategoryName}
      initialSort={initialSort}
    />
  );
}
