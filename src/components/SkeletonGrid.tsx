import SkeletonCard from "./SkeletonCard";

interface SkeletonGridProps {
  count?: number;
  title?: string;
  subtitle?: string;
}

const SkeletonGrid = ({ count = 10, title, subtitle }: SkeletonGridProps) => (
  <section className="space-y-4">
    {title && (
      <div className="space-y-1.5">
        <div className="skeleton-shimmer h-7 w-48 rounded-lg" />
        {subtitle && <div className="skeleton-shimmer h-4 w-64 rounded" />}
      </div>
    )}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </section>
);

export default SkeletonGrid;
