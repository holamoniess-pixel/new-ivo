import { useEffect, useState } from "react";
import { productApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import CategoryCard from "@/components/CategoryCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import CategorySkeleton from "@/components/CategorySkeleton";

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi
      .getCategories()
      // productApi now uses unwrap() internally, so the resolved value is
      // already the array — no more manual res?.data unwrapping needed
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CategorySkeleton />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <h1 className="font-satoshi text-2xl font-bold mb-6">All Categories</h1>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {categories.map(cat => (
            <CategoryCard key={cat.id} {...cat} />
          ))}
        </div>
        {categories.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No categories yet</p>
        )}
      </div>
    </div>
  );
};

export default Categories;