export default function LinkUpLoading() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 animate-pulse">
      <div className="h-12 bg-[#E0E0E0] rounded-lg mb-6 max-w-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="ms-card h-48 bg-[#E0E0E0]" />
        ))}
      </div>
    </div>
  );
}
