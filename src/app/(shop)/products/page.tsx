import { getCategories, getProducts } from "@/lib/data";
import { ProductListing } from "@/components/ProductListing";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ search: q }),
  ]);

  return <ProductListing categories={categories} initialProducts={products} initialQuery={q ?? ""} />;
}
