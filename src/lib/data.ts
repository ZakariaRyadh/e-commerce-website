import { prisma } from "@/lib/prisma";

function serializeProduct<T extends { price: unknown; compareAtPrice: unknown }>(p: T) {
  return {
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
  };
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getProducts(opts?: {
  categorySlug?: string;
  maxPrice?: number;
  minRating?: number;
  sortBy?: "popular" | "newest" | "price-low" | "price-high" | "rating";
  search?: string;
}) {
  const products = await prisma.product.findMany({
    where: {
      ...(opts?.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
      ...(opts?.maxPrice ? { price: { lte: opts.maxPrice } } : {}),
      ...(opts?.search
        ? { name: { contains: opts.search, mode: "insensitive" } }
        : {}),
    },
    include: { category: true, images: { orderBy: { position: "asc" } }, reviews: true },
  });

  const withRating = products.map((p) => ({
    ...serializeProduct(p),
    avgRating:
      p.reviews.length > 0
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : 4.3,
    reviewCount: p.reviews.length,
  }));

  let filtered = withRating;
  if (opts?.minRating) {
    filtered = filtered.filter((p) => p.avgRating >= opts.minRating!);
  }

  if (opts?.sortBy === "price-low") filtered.sort((a, b) => a.price - b.price);
  else if (opts?.sortBy === "price-high") filtered.sort((a, b) => b.price - a.price);
  else if (opts?.sortBy === "rating") filtered.sort((a, b) => b.avgRating - a.avgRating);
  else if (opts?.sortBy === "newest") filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return filtered;
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!product) return null;
  return serializeProduct(product);
}

export async function getRelatedProducts(categoryId: string, excludeId: string, take = 4) {
  const products = await prisma.product.findMany({
    where: { categoryId, id: { not: excludeId } },
    include: { category: true, images: { orderBy: { position: "asc" } } },
    take,
  });
  return products.map(serializeProduct);
}

export async function getFeaturedProducts(take = 4) {
  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { position: "asc" } }, reviews: true },
    take,
  });
  return products.map((p) => ({
    ...serializeProduct(p),
    avgRating:
      p.reviews.length > 0
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : 4.3,
    reviewCount: p.reviews.length,
  }));
}
