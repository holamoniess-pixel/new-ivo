import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

const CartSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="skeleton-shimmer h-8 w-40 rounded-lg mb-6" />
      <div className="space-y-3 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl bg-card border border-border">
            <Skeleton className="h-20 w-20 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-3/4 rounded" />
              <div className="skeleton-shimmer h-3 w-1/2 rounded" />
              <div className="skeleton-shimmer h-4 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton-shimmer h-48 w-full rounded-xl" />
    </div>
  </div>
);

export default CartSkeleton;
