import { prisma } from "@/lib/prisma";

function serializeProduct<T extends { price: unknown; compareAtPrice: unknown }>(p: T) {
  return {
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
  };
}

function ratingFields(reviews: { rating: number }[]) {
  return {
    avgRating: reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0,
    reviewCount: reviews.length,
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

  const withRating = products.map((p) => ({ ...serializeProduct(p), ...ratingFields(p.reviews) }));

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
  return products.map((p) => ({ ...serializeProduct(p), ...ratingFields(p.reviews) }));
}

export async function getHomeStats() {
  const [customerCount, reviews, bestSellingItem] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.review.findMany({ select: { rating: true } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 1,
    }),
  ]);

  const satisfactionRate =
    reviews.length > 0 ? Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100) : null;

  let bestSeller = null;
  if (bestSellingItem.length > 0 && bestSellingItem[0]._sum.qty) {
    const product = await prisma.product.findUnique({
      where: { id: bestSellingItem[0].productId },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    });
    if (product) bestSeller = { ...serializeProduct(product), unitsSold: bestSellingItem[0]._sum.qty, basedOnSales: true };
  }

  if (!bestSeller) {
    const topRated = await prisma.product.findMany({
      include: { images: { orderBy: { position: "asc" }, take: 1 }, reviews: true },
    });
    const sorted = topRated
      .map((p) => ({ ...serializeProduct(p), ...ratingFields(p.reviews) }))
      .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
    if (sorted[0]) bestSeller = { ...sorted[0], unitsSold: 0, basedOnSales: false };
  }

  return { customerCount, satisfactionRate, bestSeller };
}
