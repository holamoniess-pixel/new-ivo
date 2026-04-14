import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-4 md:py-6 max-w-6xl">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 md:mb-6">
        <div className="skeleton-shimmer h-3 w-10 rounded" />
        <div className="skeleton-shimmer h-3 w-6 rounded" />
        <div className="skeleton-shimmer h-3 w-24 rounded" />
      </div>
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-16">
        <div className="space-y-3">
          <div className="skeleton-shimmer aspect-square w-full rounded-2xl" />
          <div className="flex gap-2">
            {[1,2,3,4].map(i => <div key={i} className="skeleton-shimmer h-16 w-16 md:h-20 md:w-20 rounded-xl" />)}
          </div>
        </div>
        <div className="space-y-5">
          <div className="skeleton-shimmer h-4 w-24 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton-shimmer h-8 w-full rounded-lg" />
            <div className="skeleton-shimmer h-8 w-3/4 rounded-lg" />
          </div>
          <div className="skeleton-shimmer h-20 w-full rounded-xl" />
          <div className="space-y-3">
            <div className="skeleton-shimmer h-10 w-full rounded-xl" />
            <div className="flex gap-2">
              <div className="skeleton-shimmer h-11 w-1/2 rounded-xl" />
              <div className="skeleton-shimmer h-11 w-1/2 rounded-xl" />
            </div>
          </div>
          <div className="skeleton-shimmer h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export default ProductDetailSkeleton;
