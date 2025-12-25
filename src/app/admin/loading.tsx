export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8 sm:mb-12">
          <div className="mb-2 h-9 w-64 rounded-lg bg-white/10 animate-pulse sm:mb-3" />
          <div className="h-5 w-96 rounded-lg bg-white/5 animate-pulse" />
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="mb-8 border-b border-white/10">
          <div className="flex gap-2">
            {[1, 2, 3].map((id) => (
              <div
                key={id}
                className="relative px-6 py-3"
                style={{ animationDelay: `${(id - 1) * 50}ms` }}
              >
                <div className="h-5 w-20 rounded bg-white/10 animate-pulse" />
                {id === 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          {/* Action Buttons Row */}
          <div className="flex flex-wrap gap-3">
            <div className="h-10 w-40 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
            <div className="h-10 w-32 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
          </div>

          {/* Stats/Info Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((id) => (
              <div
                key={id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                style={{ animationDelay: `${(id - 1) * 100}ms` }}
              >
                <div className="h-4 w-20 rounded bg-white/5 animate-pulse mb-2" />
                <div className="h-8 w-16 rounded bg-white/10 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Table/List Skeleton */}
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
            {/* Table Header */}
            <div className="border-b border-white/10 bg-white/5 px-6 py-4">
              <div className="flex gap-4">
                <div className="h-5 w-32 rounded bg-white/10 animate-pulse" />
                <div className="h-5 w-24 rounded bg-white/10 animate-pulse" />
                <div className="h-5 w-28 rounded bg-white/10 animate-pulse" />
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/10">
              {[1, 2, 3, 4, 5].map((id) => (
                <div
                  key={id}
                  className="px-6 py-4"
                  style={{ animationDelay: `${(id - 1) * 75}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-48 rounded bg-white/10 animate-pulse" />
                      <div className="h-4 w-64 rounded bg-white/5 animate-pulse" />
                    </div>
                    <div className="h-8 w-24 rounded-lg border border-white/10 bg-white/5 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
