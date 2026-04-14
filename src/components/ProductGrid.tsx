import ProductCard from "./ProductCard";
import SkeletonGrid from "./SkeletonGrid";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  stock?: number;
  status?: string;
  discount?: number;
}

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

const ProductGrid = ({ products, title, subtitle, loading = false }: ProductGridProps) => (
  <section className="space-y-4">
    {title && (
      <div>
        <h2 className="font-satoshi text-2xl font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    )}
    {loading ? (
      <SkeletonGrid />
    ) : products.length === 0 ? (
      <p className="text-muted-foreground text-sm py-8 text-center">No products found</p>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>
    )}
  </section>
);

export default ProductGrid;
