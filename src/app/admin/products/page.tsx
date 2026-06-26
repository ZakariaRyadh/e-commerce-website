import { prisma } from "@/lib/prisma";
import { AdminProductsClient } from "@/components/AdminProductsClient";

function stockStatusOf(totalStock: number) {
  if (totalStock === 0) return "SOLD_OUT" as const;
  if (totalStock <= 5) return "LOW_STOCK" as const;
  return "IN_STOCK" as const;
}

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serialized = products.map((p) => {
    const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
    return {
      id: p.id,
      name: p.name,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      description: p.description,
      categoryId: p.categoryId,
      totalStock,
      stockStatus: stockStatusOf(totalStock),
      variantCount: p.variants.length,
      category: p.category.name,
      imgUrl: p.images[0]?.url ?? "",
    };
  });

  return <AdminProductsClient initialProducts={serialized} categories={categories} />;
}
