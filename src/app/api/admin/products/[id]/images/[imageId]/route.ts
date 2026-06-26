import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageId } = await params;
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.productImage.delete({ where: { id: imageId } });

  if (image.url.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", image.url)).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
