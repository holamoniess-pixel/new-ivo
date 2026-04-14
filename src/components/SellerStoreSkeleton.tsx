import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonGrid from "./SkeletonGrid";

const SellerStoreSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-card border border-border">
        <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
        <div className="space-y-2">
          <div className="skeleton-shimmer h-5 w-40 rounded" />
          <div className="skeleton-shimmer h-3 w-28 rounded" />
          <div className="skeleton-shimmer h-3 w-52 rounded" />
        </div>
      </div>
      <SkeletonGrid count={10} />
    </div>
  </div>
);

export default SellerStoreSkeleton;
