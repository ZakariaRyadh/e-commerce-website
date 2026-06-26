import { getCategories, getProducts } from "@/lib/data";
import { ProductListing } from "@/components/ProductListing";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ search: q }),
  ]);

  const initialCategoryName = categories.find((c) => c.slug === category)?.name ?? "all";

  return (
    <ProductListing
      categories={categories}
      initialProducts={products}
      initialQuery={q ?? ""}
      initialCategory={initialCategoryName}
    />
  );
}
