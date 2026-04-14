import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

const CategorySkeleton = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-6">
      <div className="skeleton-shimmer h-8 w-36 rounded-lg mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-card border border-border p-5 flex flex-col items-center gap-3 text-center">
            <div className="skeleton-shimmer h-14 w-14 rounded-2xl" />
            <div className="skeleton-shimmer h-3.5 w-20 rounded" />
            <div className="skeleton-shimmer h-2.5 w-14 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CategorySkeleton;
