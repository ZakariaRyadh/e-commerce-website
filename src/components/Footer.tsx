import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#111] text-white px-4 sm:px-6 pt-16 pb-8">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 mb-12">
          <div className="col-span-2 sm:col-span-1">
            <div className="text-xl font-bold tracking-tight mb-4">LUMA</div>
            <p className="text-[13px] text-white/40 leading-relaxed max-w-[220px]">
              Thoughtfully made essentials for everyday life. Quality you can trust.
            </p>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-white/30 mb-4">Shop</div>
            <div className="flex flex-col gap-2.5">
              <Link href="/products" className="text-[13px] text-white/45 hover:text-white">
                All Products
              </Link>
              <Link href="/products" className="text-[13px] text-white/45 hover:text-white">
                New Arrivals
              </Link>
              <Link href="/products" className="text-[13px] text-white/45 hover:text-white">
                Sale
              </Link>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-white/30 mb-4">Help</div>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-[13px] text-white/45 hover:text-white">
                FAQ
              </a>
              <a href="#" className="text-[13px] text-white/45 hover:text-white">
                Shipping &amp; Returns
              </a>
              <Link href="/account" className="text-[13px] text-white/45 hover:text-white">
                Order Tracking
              </Link>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-white/30 mb-4">Company</div>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-[13px] text-white/45 hover:text-white">
                About
              </a>
              <a href="#" className="text-[13px] text-white/45 hover:text-white">
                Sustainability
              </a>
              <a href="#" className="text-[13px] text-white/45 hover:text-white">
                Careers
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[13px] text-white/25">© 2026 LUMA. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="text-[13px] text-white/25 hover:text-white/60">
              Privacy
            </a>
            <a href="#" className="text-[13px] text-white/25 hover:text-white/60">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
