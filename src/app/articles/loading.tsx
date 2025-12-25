export default function ArticlesLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="h-9 w-32 rounded-lg bg-white/10 animate-pulse" />
            <div className="h-5 w-64 rounded-lg bg-white/5 animate-pulse" />
          </div>
          <div className="h-9 w-48 rounded-full border border-white/10 bg-white/5 animate-pulse" />
        </div>

        {/* Search & Filters Skeleton */}
        <div className="sticky top-16 z-30 -mx-4 bg-[#0A0A0A]/95 px-4 backdrop-blur-lg sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="py-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-full sm:min-w-[300px] h-12 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
              <div className="h-12 w-32 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
              <div className="h-12 w-32 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
              <div className="h-12 w-32 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Article Count Skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-5 w-40 rounded bg-white/5 animate-pulse" />
        </div>

        {/* Article Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <div
              key={id}
              className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              style={{ animationDelay: `${(id - 1) * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Meta Info - Company and Category Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="h-6 w-24 rounded-lg border border-white/10 bg-white/5 animate-pulse" />
                    <div className="h-6 w-32 rounded-lg border border-purple-500/20 bg-purple-500/10 animate-pulse" />
                    <div className="h-6 w-28 rounded-lg border border-blue-500/20 bg-blue-500/10 animate-pulse" />
                    <div className="h-4 w-4 rounded-full bg-white/5 animate-pulse" />
                    <div className="h-4 w-16 rounded bg-white/5 animate-pulse" />
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <div className="h-6 w-full rounded bg-white/10 animate-pulse" />
                    <div className="h-6 w-3/4 rounded bg-white/10 animate-pulse" />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
                    <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
                    <div className="h-4 w-2/3 rounded bg-white/5 animate-pulse" />
                  </div>
                </div>

                {/* External Link Icon */}
                <div className="h-5 w-5 rounded bg-white/5 animate-pulse shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
