import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = ["Tops", "Bottoms", "Knitwear", "Outerwear", "Footwear", "Bags", "Accessories"];

const PRODUCTS = [
  { name: "Classic Essential Tee", slug: "classic-essential-tee", price: 49, compareAtPrice: 69, cat: "Tops", badge: null, stock: 40, colors: ["Black", "White", "Navy"], sizes: ["XS", "S", "M", "L", "XL"] },
  { name: "Relaxed Linen Pant", slug: "relaxed-linen-pant", price: 89, compareAtPrice: null, cat: "Bottoms", badge: "New", stock: 25, colors: ["Sand", "Olive", "Stone"], sizes: ["XS", "S", "M", "L", "XL"] },
  { name: "Merino Wool Sweater", slug: "merino-wool-sweater", price: 129, compareAtPrice: 159, cat: "Knitwear", badge: "Sale", stock: 30, colors: ["Oatmeal", "Charcoal", "Rust"], sizes: ["XS", "S", "M", "L", "XL"] },
  { name: "Technical Jacket", slug: "technical-jacket", price: 199, compareAtPrice: null, cat: "Outerwear", badge: null, stock: 0, colors: ["Olive", "Black"], sizes: ["S", "M", "L", "XL"] },
  { name: "Canvas Sneaker", slug: "canvas-sneaker", price: 79, compareAtPrice: null, cat: "Footwear", badge: null, stock: 50, colors: ["White", "Black", "Cream"], sizes: ["38", "39", "40", "41", "42", "43"] },
  { name: "Structured Tote", slug: "structured-tote", price: 119, compareAtPrice: 149, cat: "Bags", badge: "Sale", stock: 5, colors: ["Tan", "Black", "Burgundy"], sizes: ["One Size"] },
  { name: "Ribbed Knit Cardigan", slug: "ribbed-knit-cardigan", price: 95, compareAtPrice: null, cat: "Knitwear", badge: "New", stock: 20, colors: ["Cream", "Brown", "Black"], sizes: ["XS", "S", "M", "L", "XL"] },
  { name: "Wide Brim Hat", slug: "wide-brim-hat", price: 45, compareAtPrice: 55, cat: "Accessories", badge: null, stock: 15, colors: ["Tan", "Black"], sizes: ["S/M", "L/XL"] },
];

function stockStatus(stock: number) {
  if (stock === 0) return "SOLD_OUT" as const;
  if (stock <= 5) return "LOW_STOCK" as const;
  return "IN_STOCK" as const;
}

async function main() {
  for (const name of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: name.toLowerCase() },
    });
  }

  for (const p of PRODUCTS) {
    const category = await prisma.category.findUnique({ where: { name: p.cat } });
    if (!category) continue;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description:
          "Crafted from premium materials with attention to detail that sets it apart. Thoughtful construction meets timeless design — made to wear day after day.",
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? undefined,
        stock: p.stock,
        stockStatus: stockStatus(p.stock),
        colors: p.colors,
        sizes: p.sizes,
        badge: p.badge ?? undefined,
        categoryId: category.id,
      },
    });
    await prisma.productImage.createMany({
      data: [0, 1, 2, 3].map((i) => ({
        productId: product.id,
        position: i,
        url: `https://picsum.photos/seed/${p.slug}_${i}/800/1000`,
      })),
      skipDuplicates: true,
    });
  }

  const adminPassword = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@luma.test" },
    update: {},
    create: {
      email: "admin@luma.test",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
