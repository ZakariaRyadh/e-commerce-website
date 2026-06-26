"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <AlertTriangle size={40} className="text-[#ccc]" />
      <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="text-sm text-[#aaa] max-w-[320px]">
        An unexpected error occurred. You can try again or head back home.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="h-11 px-6 bg-[#111] text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-[#333]"
        >
          Try Again
        </button>
        <a href="/" className="h-11 px-6 bg-white border border-[#e5e5e5] rounded-xl text-sm font-medium flex items-center hover:bg-[#f5f5f4]">
          Go Home
        </a>
      </div>
    </div>
  );
}
