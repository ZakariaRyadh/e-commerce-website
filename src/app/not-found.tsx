import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <Compass size={40} className="text-[#ccc]" />
      <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="text-sm text-[#aaa] max-w-[320px]">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" className="h-11 px-6 bg-[#111] text-white rounded-xl text-sm font-medium flex items-center hover:bg-[#333]">
        Go Home
      </Link>
    </div>
  );
}
