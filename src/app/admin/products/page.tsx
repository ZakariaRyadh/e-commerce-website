import { prisma } from "@/lib/prisma";
import { AdminProductsClient } from "@/components/AdminProductsClient";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serialized = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    description: p.description,
    categoryId: p.categoryId,
    stock: p.stock,
    stockStatus: p.stockStatus,
    category: p.category.name,
    imgUrl: p.images[0]?.url ?? "",
  }));

  return <AdminProductsClient initialProducts={serialized} categories={categories} />;
}
