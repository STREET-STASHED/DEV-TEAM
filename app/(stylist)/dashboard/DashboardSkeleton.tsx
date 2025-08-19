export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6 animate-pulse">
            <div className="flex items-center">
              <div className="p-2 bg-ink-600 rounded-lg">
                <div className="w-6 h-6 bg-ink-500 rounded"></div>
              </div>
              <div className="ml-4">
                <div className="h-4 bg-ink-600 rounded w-24 mb-2"></div>
                <div className="h-8 bg-ink-600 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-4 animate-pulse">
            <div className="flex items-center">
              <div className="p-2 bg-ink-600 rounded-lg">
                <div className="w-5 h-5 bg-ink-500 rounded"></div>
              </div>
              <div className="ml-3 h-4 bg-ink-600 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Skeleton */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-ink-600 rounded w-32"></div>
          <div className="h-4 bg-ink-600 rounded w-16"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-ink-700/30 rounded-lg border border-ink-600 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-ink-600 rounded w-16"></div>
                <div>
                  <div className="h-4 bg-ink-600 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-ink-600 rounded w-24"></div>
                </div>
              </div>
              <div className="h-6 bg-ink-600 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Looks Skeleton */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-ink-600 rounded w-32"></div>
          <div className="h-4 bg-ink-600 rounded w-16"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-ink-700/30 rounded-lg border border-ink-600 p-4 animate-pulse">
              <div className="aspect-square bg-ink-600 rounded-lg mb-3"></div>
              <div className="h-4 bg-ink-600 rounded w-24 mb-1"></div>
              <div className="h-3 bg-ink-600 rounded w-16 mb-2"></div>
              <div className="flex items-center justify-between">
                <div className="h-3 bg-ink-600 rounded w-12"></div>
                <div className="h-3 bg-ink-600 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
