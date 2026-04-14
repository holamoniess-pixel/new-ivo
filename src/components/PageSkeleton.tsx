import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import SkeletonGrid from "./SkeletonGrid";
import SkeletonList from "./SkeletonList";

interface PageSkeletonProps {
  variant?: "grid" | "list" | "mixed";
  gridCount?: number;
  listCount?: number;
  showGrid?: boolean;
  showList?: boolean;
  gridTitle?: string;
  listTitle?: string;
}

const PageSkeleton = ({
  variant = "grid",
  gridCount = 10,
  listCount = 5,
  showGrid = variant === "grid" || variant === "mixed",
  showList = variant === "list" || variant === "mixed",
  gridTitle,
  listTitle,
}: PageSkeletonProps) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-8">
        {showGrid && <SkeletonGrid count={gridCount} title={gridTitle} />}
        {showList && <SkeletonList count={listCount} />}
      </div>
    </div>
  </div>
);

export default PageSkeleton;
