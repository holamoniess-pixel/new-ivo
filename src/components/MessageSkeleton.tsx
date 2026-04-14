import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

const MessageSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-6">
      <div className="skeleton-shimmer h-8 w-36 rounded-lg mb-4" />
      <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-160px)] max-h-[700px]">
        <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
          <div className="p-3 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-2.5 w-36 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 rounded-xl bg-card border border-border shadow-sm flex flex-col items-center justify-center">
          <Skeleton className="h-12 w-12 rounded-full mb-3" />
          <Skeleton className="h-4 w-48 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export default MessageSkeleton;
