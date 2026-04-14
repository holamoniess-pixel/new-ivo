import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

const HomeSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 pb-10">

      {/* Hero skeleton */}
      <div className="rounded-2xl overflow-hidden mt-4 mb-6">
        <div className="skeleton-shimmer h-[280px] sm:h-[340px] w-full rounded-2xl" />
      </div>

      {/* Categories skeleton */}
      <div className="space-y-3 mb-8">
        <div className="skeleton-shimmer h-7 w-32 rounded-lg" />
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="skeleton-shimmer h-12 w-12 rounded-full" />
              <div className="skeleton-shimmer h-2.5 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* New Arrivals skeleton */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="skeleton-shimmer h-7 w-36 rounded-lg" />
          <div className="skeleton-shimmer h-8 w-20 rounded-xl" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[160px] sm:w-[200px] rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <Skeleton className="aspect-[4/5] w-full rounded-none" />
              <div className="p-3 space-y-2">
                <div className="skeleton-shimmer h-3.5 w-full rounded" />
                <div className="skeleton-shimmer h-3.5 w-3/4 rounded" />
                <div className="skeleton-shimmer h-5 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flash Sale skeleton */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="skeleton-shimmer h-7 w-28 rounded-lg" />
            <div className="skeleton-shimmer h-5 w-16 rounded-full" />
          </div>
          <div className="skeleton-shimmer h-8 w-20 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <Skeleton className="aspect-[4/5] w-full rounded-none" />
              <div className="p-3 space-y-2">
                <div className="skeleton-shimmer h-3.5 w-full rounded" />
                <div className="skeleton-shimmer h-3.5 w-3/4 rounded" />
                <div className="skeleton-shimmer h-5 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="skeleton-shimmer h-10 w-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <div className="skeleton-shimmer h-3.5 w-24 rounded" />
                <div className="skeleton-shimmer h-2.5 w-36 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  </div>
);

export default HomeSkeleton;
