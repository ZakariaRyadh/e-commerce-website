export default function Loading() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 pb-20 animate-pulse">
      <div className="h-4 w-40 bg-[#f0f0f0] rounded mb-7" />
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="flex flex-col gap-3">
          <div className="aspect-4/5 rounded-2xl bg-[#f0f0f0]" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-[#f0f0f0]" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="h-4 w-20 bg-[#f0f0f0] rounded" />
          <div className="h-9 w-3/4 bg-[#f0f0f0] rounded" />
          <div className="h-5 w-32 bg-[#f0f0f0] rounded" />
          <div className="h-9 w-24 bg-[#f0f0f0] rounded" />
          <div className="h-13 w-full bg-[#f0f0f0] rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}
