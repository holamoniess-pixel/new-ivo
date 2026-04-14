import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart, MessageCircle, ArrowLeft, Store,
  Minus, Plus, Play, Package, ChevronRight,
  Tag, Star, Truck, ShieldCheck, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { productApi, cartApi, chatApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProductDetailSkeleton from "@/components/ProductDetailSkeleton";
import { toast } from "sonner";

// ── Normalise discount fields that the API may return inconsistently ──────────
function normaliseProduct(p: any) {
  if (!p) return p;
  return {
    ...p,
    isDiscounted: p.isDiscounted ?? p.discounted ?? false,
    discountPrice: p.discountPrice != null ? Number(p.discountPrice) : undefined,
    discountPercentage: p.discountPercentage != null ? Number(p.discountPercentage) : undefined,
    price: Number(p.price),
    // Also normalise any related products in the same pass
    relatedProducts: Array.isArray(p.relatedProducts)
      ? p.relatedProducts.map((rp: any) => ({
          ...rp,
          isDiscounted: rp.isDiscounted ?? rp.discounted ?? false,
          discountPrice: rp.discountPrice != null ? Number(rp.discountPrice) : undefined,
          discountPercentage: rp.discountPercentage != null ? Number(rp.discountPercentage) : undefined,
          price: Number(rp.price),
        }))
      : p.relatedProducts,
  };
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: "image" | "video"; index: number }>({
    type: "image",
    index: 0,
  });

  useEffect(() => {
    if (!id) return;
    productApi
      .getDetails(id)
      .then(data => setProduct(normaliseProduct(data)))   // ← FIX applied here
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error("Please sign in"); return; }
    setAddingToCart(true);
    try {
      await cartApi.add(id!, quantity);
      toast.success(`${quantity} item${quantity > 1 ? "s" : ""} added to cart!`);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleOrderNow = () => {
    if (!isAuthenticated) { toast.error("Please sign in"); return; }
    handleAddToCart().then(() => navigate("/cart"));
  };

  const handleContactSeller = async () => {
    if (!isAuthenticated) { toast.error("Please sign in"); return; }
    try {
      const conversation = await chatApi.startConversation(id!);
      toast.success("Conversation started!");
      navigate(`/messages?conversation=${conversation.id}`);
    } catch {
      toast.error("Failed to start conversation");
    }
  };

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return (
    <>
      <Navbar />
      <div className="text-center py-20">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Product not found</p>
        <Link to="/" className="text-sm text-primary hover:underline mt-2 inline-block">Go back home</Link>
      </div>
    </>
  );

  const images: any[] = product.images || [];
  const video: any | null = product.video ?? null;

  const mediaItems = [
    ...images.map((img: any) => ({ type: "image" as const, url: img.imageUrl, id: img.id })),
    ...(video ? [{ type: "video" as const, url: video.videoUrl, thumbnailUrl: video.thumbnailUrl, id: video.id }] : []),
  ];

  const current = mediaItems[selectedMedia.index] ?? mediaItems[0];
  const inStock = product.stock > 0;
  const hasDiscount = product.isDiscounted && product.discountPrice;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-4 md:py-6 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 md:mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          {product.category && (
            <>
              <Link to={`/categories/${product.category.slug}`} className="hover:text-foreground transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-16">

          {/* ── Media Column ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            {/* Main viewer */}
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted relative">
              {!current ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-20 w-20 text-muted-foreground/30" />
                </div>
              ) : current.type === "image" ? (
                <img
                  src={current.url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  key={current.url}
                  src={current.url}
                  controls
                  poster={current.thumbnailUrl ?? undefined}
                  className="h-full w-full object-cover"
                />
              )}

              {/* Badges on main image */}
              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  -{product.discountPercentage}% OFF
                </div>
              )}
              {!inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                  <span className="bg-black/80 text-white text-sm font-bold px-4 py-2 rounded-full">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {mediaItems.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {mediaItems.map((item, i) => (
                  <button
                    key={item.id ?? i}
                    onClick={() => setSelectedMedia({ type: item.type, index: i })}
                    className={`relative h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      i === selectedMedia.index
                        ? "border-primary shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {item.type === "image" ? (
                      <img src={item.url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <>
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt="video" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <Play className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-4 w-4 text-white fill-white" />
                        </div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Trust signals — below image on desktop */}
            <div className="hidden md:flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
                <span>Secure payment & buyer protection</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Truck className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Fast delivery across Ghana</span>
              </div>
            </div>
          </motion.div>

          {/* ── Info Column ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-5"
          >
            {/* Category pill */}
            {product.category && (
              <Link
                to={`/categories/${product.category.slug}`}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full hover:bg-orange-100 transition-colors"
              >
                <Tag className="h-3 w-3" />
                {product.category.name}
              </Link>
            )}

            {/* Product name */}
            <div>
              <h1
                className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight font-satoshi"
              >
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-sm text-muted-foreground mt-1 font-inter">
                  by <span className="font-semibold text-foreground">{product.brand}</span>
                </p>
              )}
            </div>

            {/* Price block */}
            <div className="rounded-xl bg-card border border-border/50 p-4">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-2xl md:text-3xl font-bold text-primary font-ui">
                  GHS {Number(displayPrice).toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-muted-foreground line-through">
                      GHS {Number(product.price).toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      Save GHS {(Number(product.price) - Number(product.discountPrice)).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`inline-block h-2 w-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`} />
                <span className="text-xs text-muted-foreground font-inter">
                  {inStock ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Description */}
            {product.productDescription && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5 font-satoshi">
                  About this product
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-inter">
                  {product.productDescription}
                </p>
              </div>
            )}

            {/* Quantity + Actions */}
            {!isSeller && inStock && (
              <div className="space-y-3">
                {/* Quantity selector */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground font-ui">
                    Qty:
                  </span>
                  <div className="flex items-center rounded-xl border border-border overflow-hidden">
                    <button
                      className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                    <button
                      className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 h-11 border-primary/30 text-primary hover:bg-orange-500/5 font-semibold font-ui"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {addingToCart ? "Adding…" : "Add to Cart"}
                  </Button>
                  <Button
                    className="flex-1 gap-2 h-11 bg-primary hover:bg-orange-700 text-white font-semibold shadow-md font-ui"
                    onClick={handleOrderNow}
                  >
                    <ArrowRight className="h-4 w-4" />
                    Order Now
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile trust signals */}
            <div className="flex md:hidden flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>Secure payment & buyer protection</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-4 w-4 text-blue-500" />
                <span>Fast delivery across Ghana</span>
              </div>
            </div>

            {/* Seller info */}
            {product.seller && (
              <div className="rounded-xl border border-border bg-card/50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 font-ui">
                  Sold by
                </p>
                <div className="flex items-center justify-between">
                  <Link
                    to={`/store/${product.seller.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      {product.seller.profilePic?.imageUrl ? (
                        <img
                          src={product.seller.profilePic.imageUrl}
                          alt={product.seller.storeName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Store className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors font-satoshi">
                        {product.seller.storeName}
                      </p>
                      <p className="text-xs text-muted-foreground font-inter">
                        {product.seller.location ?? "Visit store →"}
                      </p>
                    </div>
                  </Link>
                  {!isSeller && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs border-border hover:border-primary/40 hover:text-primary"
                      onClick={handleContactSeller}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Chat
                    </Button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Related Products ──────────────────────────────── */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 md:mt-16"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-foreground font-satoshi">
                You might also like
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {product.relatedProducts.map((rp: any) => {
                const rpHasDiscount = rp.isDiscounted && rp.discountPrice;
                const rpDisplayPrice = rpHasDiscount ? rp.discountPrice : rp.price;
                const rpImage = rp.primaryImageUrl || rp.images?.[0]?.imageUrl || null;
                return (
                  <Link
                    key={rp.id}
                    to={`/products/${rp.id}`}
                    className="rounded-xl border bg-card overflow-hidden transition-shadow duration-200 hover:shadow-md flex flex-col"
                  >
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      {rpImage ? (
                        <img
                          src={rpImage}
                          alt={rp.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                      {/* Discount badge on related products */}
                      {rpHasDiscount && (
                        <div className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                          -{rp.discountPercentage}%
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 flex flex-col flex-1">
                      <p className="text-xs font-medium line-clamp-2 leading-snug flex-1 font-satoshi">
                        {rp.name}
                      </p>
                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <p className="text-xs font-bold text-primary font-ui">
                          GHS {Number(rpDisplayPrice).toFixed(2)}
                        </p>
                        {rpHasDiscount && (
                          <p className="text-[10px] text-muted-foreground line-through">
                            GHS {Number(rp.price).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
