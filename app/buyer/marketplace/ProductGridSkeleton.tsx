export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-black rounded-3xl shadow-card border border-ink-800 animate-pulse">
          {/* Image skeleton */}
          <div className="aspect-square bg-ink-800 rounded-t-2xl"></div>
          
          {/* Content skeleton */}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-5 bg-ink-800 rounded w-3/4"></div>
              <div className="h-4 bg-ink-800 rounded w-full"></div>
              <div className="h-4 bg-ink-800 rounded w-2/3"></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-6 bg-ink-800 rounded w-16"></div>
                <div className="h-3 bg-ink-800 rounded w-20"></div>
              </div>
              
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="w-4 h-4 bg-ink-800 rounded"></div>
                  ))}
                </div>
                <div className="h-3 bg-ink-800 rounded w-8 ml-1"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
