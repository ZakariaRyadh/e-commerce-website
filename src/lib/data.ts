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

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "SOLD_OUT";

function stockFields(variants: { size: string; color: string; stock: number }[]) {
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);
  const stockStatus: StockStatus = totalStock === 0 ? "SOLD_OUT" : totalStock <= 5 ? "LOW_STOCK" : "IN_STOCK";
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const colors = Array.from(new Set(variants.map((v) => v.color)));
  return { variants, totalStock, stockStatus, sizes, colors };
}

const productListInclude = {
  category: true,
  images: { orderBy: { position: "asc" as const } },
  reviews: true,
  variants: true,
};

function mapProduct<
  T extends {
    price: unknown;
    compareAtPrice: unknown;
    reviews: { rating: number }[];
    variants: { size: string; color: string; stock: number }[];
  },
>(p: T) {
  return { ...serializeProduct(p), ...ratingFields(p.reviews), ...stockFields(p.variants) };
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getCategoryPreviews(take = 4) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    take,
    include: {
      products: {
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
        take: 1,
      },
      _count: { select: { products: true } },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: c._count.products,
    imgUrl: c.products[0]?.images[0]?.url ?? null,
  }));
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
    include: productListInclude,
  });

  let filtered = products.map(mapProduct);
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
      variants: true,
    },
  });
  if (!product) return null;
  return mapProduct(product);
}

export async function getRelatedProducts(categoryId: string, excludeId: string, take = 4) {
  const products = await prisma.product.findMany({
    where: { categoryId, id: { not: excludeId } },
    include: productListInclude,
    take,
  });
  return products.map(mapProduct);
}

export async function getFeaturedProducts(take = 4) {
  const products = await prisma.product.findMany({
    include: productListInclude,
    take,
  });
  return products.map(mapProduct);
}

export async function getNewArrivals(take = 4) {
  const products = await prisma.product.findMany({
    include: productListInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
  return products.map(mapProduct);
}

export async function getOnSaleProducts(take = 8) {
  const products = await prisma.product.findMany({
    where: { compareAtPrice: { not: null } },
    include: productListInclude,
    take,
  });
  return products.map(mapProduct);
}

export async function getBestSellers(take = 4) {
  const topSold = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { qty: true },
    orderBy: { _sum: { qty: "desc" } },
    take,
  });

  if (topSold.length === 0) {
    const products = await prisma.product.findMany({ include: productListInclude });
    return products
      .map(mapProduct)
      .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
      .slice(0, take);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: topSold.map((t) => t.productId) } },
    include: productListInclude,
  });

  const qtyMap = new Map(topSold.map((t) => [t.productId, t._sum.qty ?? 0]));
  return products.map(mapProduct).sort((a, b) => (qtyMap.get(b.id) ?? 0) - (qtyMap.get(a.id) ?? 0));
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
      include: { images: { orderBy: { position: "asc" }, take: 1 }, reviews: true, variants: true },
    });
    if (product) bestSeller = { ...mapProduct(product), unitsSold: bestSellingItem[0]._sum.qty, basedOnSales: true };
  }

  if (!bestSeller) {
    const topRated = await prisma.product.findMany({
      include: { images: { orderBy: { position: "asc" }, take: 1 }, reviews: true, variants: true },
    });
    const sorted = topRated.map(mapProduct).sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
    if (sorted[0]) bestSeller = { ...sorted[0], unitsSold: 0, basedOnSales: false };
  }

  return { customerCount, satisfactionRate, bestSeller };
}
