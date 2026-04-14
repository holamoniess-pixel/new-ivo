import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonListProps {
  count?: number;
}

const SkeletonList = ({ count = 5 }: SkeletonListProps) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3.5 p-4 rounded-xl bg-card border border-border">
        <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3.5 w-32 rounded" />
            <Skeleton className="h-3 w-16 rounded-full shrink-0" />
          </div>
          <Skeleton className="h-3 w-48 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonList;
