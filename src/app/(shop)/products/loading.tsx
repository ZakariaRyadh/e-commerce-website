export default function Loading() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 pb-20 animate-pulse">
      <div className="h-4 w-32 bg-[#f0f0f0] rounded mb-6" />
      <div className="h-8 w-48 bg-[#f0f0f0] rounded mb-2" />
      <div className="h-4 w-24 bg-[#f0f0f0] rounded mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-3/4 rounded-xl bg-[#f0f0f0] mb-3" />
            <div className="h-3 w-16 bg-[#f0f0f0] rounded mb-2" />
            <div className="h-4 w-28 bg-[#f0f0f0] rounded mb-2" />
            <div className="h-4 w-20 bg-[#f0f0f0] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
