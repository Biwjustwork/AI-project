export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-44 rounded-3xl bg-slate-200/80" />

      {/* Date Bar Skeleton */}
      <div className="h-20 rounded-2xl bg-slate-200/60" />

      {/* Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 rounded-lg bg-slate-200/80" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-200/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
