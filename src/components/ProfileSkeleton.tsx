import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="max-w-[680px] mx-auto px-4 py-8 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="skeleton-shimmer h-10 w-10 rounded-xl" />
        <div className="skeleton-shimmer h-8 w-40 rounded-lg" />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[1,2,3].map(i => <div key={i} className="skeleton-shimmer h-24 rounded-xl" />)}
      </div>
      <div className="skeleton-shimmer h-11 w-full rounded-2xl" />
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="skeleton-shimmer h-24 w-full" />
        <div className="p-6 space-y-4">
          <div className="skeleton-shimmer h-6 w-48 rounded-lg" />
          <div className="skeleton-shimmer h-3 w-full rounded" />
          <div className="skeleton-shimmer h-3 w-3/4 rounded" />
          <div className="flex gap-3">
            <div className="skeleton-shimmer h-4 w-4 rounded-full" />
            <div className="skeleton-shimmer h-3 w-32 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="skeleton-shimmer h-4 w-4 rounded-full" />
            <div className="skeleton-shimmer h-3 w-28 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="skeleton-shimmer h-4 w-4 rounded-full" />
            <div className="skeleton-shimmer h-3 w-36 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileSkeleton;
