import { Skeleton } from "@/components/ui/skeleton";
import SkeletonGrid from "./SkeletonGrid";

const SellerDashboardSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <div className="skeleton-shimmer h-8 w-48 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-36 rounded" />
        </div>
        <div className="skeleton-shimmer h-10 w-28 rounded-xl" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-xl bg-card border border-border p-4 space-y-2">
            <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
            <div className="skeleton-shimmer h-6 w-20 rounded" />
            <div className="skeleton-shimmer h-3 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="skeleton-shimmer h-48 w-full rounded-xl mb-6" />

      {/* Recent orders placeholder */}
      <div className="skeleton-shimmer h-40 w-full rounded-xl mb-6" />

      {/* Products grid */}
      <SkeletonGrid count={8} title="Recent Products" />
    </div>
  </div>
);

export default SellerDashboardSkeleton;
