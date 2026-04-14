import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  className?: string;
}

const SkeletonCard = ({ className = "" }: SkeletonCardProps) => (
  <div className={`rounded-2xl bg-card shadow-soft overflow-hidden ${className}`}>
    <Skeleton className="aspect-[4/5] w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-3.5 w-full rounded" />
      <Skeleton className="h-3.5 w-3/4 rounded" />
      <div className="flex items-baseline gap-2 pt-1">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-3 w-12 rounded" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
