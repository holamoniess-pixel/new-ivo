import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productApi, cartApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import SkeletonGrid from "@/components/SkeletonGrid";
import { Package, ShoppingCart, ArrowRight, Tag } from "lucide-react";
import { toast } from "sonner";

// ── Normalise discount fields that the API may return inconsistently ──────────
function normaliseProduct(p: any) {
  return {
    ...p,
    isDiscounted: p.isDiscounted ?? p.discounted ?? false,
    discountPrice: p.discountPrice != null ? Number(p.discountPrice) : undefined,
    discountPercentage: p.discountPercentage != null ? Number(p.discountPercentage) : undefined,
    price: Number(p.price),
  };
}

const CategoryProducts = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    productApi
      .getByCategory(slug)
      .then(res => {
        if (!res) { setData(null); return; }
        // ── FIX: normalise every product in the response ──
        setData({
          ...res,
          products: Array.isArray(res.products)
            ? res.products.map(normaliseProduct)
            : [],
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error("Please sign in"); return; }
    setAddingToCart(productId);
    try {
      await cartApi.add(productId, 1);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleOrder = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${productId}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="skeleton-shimmer h-6 w-6 rounded-lg" />
            <div className="skeleton-shimmer h-3 w-16 rounded-full" />
          </div>
          <div className="skeleton-shimmer h-8 w-48 rounded-lg mt-2" />
        </div>
        <SkeletonGrid count={10} />
      </div>
    </div>
  );

  const products = data?.products || [];
  const categoryName = data?.category?.name || slug;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/10">
              <Tag className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-ui">
              Category
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-satoshi">
            {categoryName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-inter">
            {products.length} product{products.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">No products in this category yet</p>
            <Link to="/categories" className="text-sm text-primary hover:underline mt-2 inline-block">
              Browse other categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {products.map((product: any) => {
              const hasDiscount = product.isDiscounted && product.discountPrice;
              const displayPrice = hasDiscount ? product.discountPrice : product.price;
              const imageUrl = product.primaryImageUrl || product.images?.[0]?.imageUrl || null;

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group rounded-xl bg-card border border-border overflow-hidden transition-shadow duration-200 hover:shadow-md flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.display = "none";
                          const parent = el.parentElement;
                          if (parent) {
                            const placeholder = document.createElement("div");
                            placeholder.className = "w-full h-full flex items-center justify-center";
                            placeholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`;
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Discount badge */}
                    {hasDiscount && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                        -{product.discountPercentage}%
                      </div>
                    )}

                    {/* Out of stock overlay */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                          Out of stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    {product.brand && (
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5 font-ui">
                        {product.brand}
                      </p>
                    )}
                    <p className="text-xs md:text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-2 flex-1 font-satoshi">
                      {product.name}
                    </p>

                    {/* Price */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="text-sm font-bold text-primary font-ui">
                        GHS {Number(displayPrice).toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          GHS {Number(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {product.stock !== 0 && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => handleAddToCart(e, product.id)}
                          disabled={addingToCart === product.id}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 text-[10px] font-semibold border border-orange-500/20 hover:bg-orange-500/20 transition-colors disabled:opacity-60"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          {addingToCart === product.id ? "…" : "Cart"}
                        </button>
                        <button
                          onClick={(e) => handleOrder(e, product.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary text-white text-[10px] font-semibold hover:bg-orange-700 transition-colors"
                        >
                          <ArrowRight className="h-3 w-3" />
                          Order
                        </button>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
