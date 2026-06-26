import Link from "next/link";
import { PackageX } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <PackageX size={40} className="text-[#ccc]" />
      <h1 className="text-2xl font-bold tracking-tight">Product not found</h1>
      <p className="text-sm text-[#aaa] max-w-[320px]">
        This product may have been removed or the link is incorrect.
      </p>
      <Link href="/products" className="h-11 px-6 bg-[#111] text-white rounded-xl text-sm font-medium flex items-center hover:bg-[#333]">
        Browse Products
      </Link>
    </div>
  );
}
