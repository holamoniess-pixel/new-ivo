import { SidebarProvider } from "@/components/ui/sidebar";
import { SellerSidebar } from "./SellerSidebar";
import { Skeleton } from "@/components/ui/skeleton";

const SellerLayoutSkeleton = () => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background">
      <SellerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center border-b border-border px-4 bg-card shrink-0">
          <div className="skeleton-shimmer h-6 w-48 rounded-lg" />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton-shimmer h-24 rounded-xl" />
            ))}
          </div>
          <div className="skeleton-shimmer h-48 w-full rounded-xl mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden">
                <Skeleton className="aspect-[4/5] w-full rounded-none" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  </SidebarProvider>
);

export default SellerLayoutSkeleton;
