export default function DashboardLoading() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-pulse">
      <div className="h-8 bg-[#E0E0E0] rounded w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map((i) => (
          <div key={i} className="ms-card h-24 bg-[#E0E0E0]" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map((i) => (
          <div key={i} className="ms-card h-32 bg-[#E0E0E0]" />
        ))}
      </div>
    </div>
  );
}
