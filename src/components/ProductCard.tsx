import { Link } from "react-router-dom";
import { motion, useTransform } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cartApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTilt } from "@/hooks/useMotion";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  stock?: number;
  status?: string;
  discount?: number;
}

const ProductCard = ({ id, name, price, imageUrl, stock, discount }: ProductCardProps) => {
  const { isAuthenticated, isSeller } = useAuth();
  const { rotateX, rotateY, glowX, glowY, tiltProps } = useTilt({
    maxRotateX: 8,
    maxRotateY: 8,
    maxGlow: 30,
    springStiffness: 120,
    springDamping: 25,
    perspective: 1200,
  });

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error("Please sign in to add items to cart"); return; }
    try { await cartApi.add(id, 1); toast.success("Added to cart!"); }
    catch { toast.error("Failed to add to cart"); }
  };

  const discountedPrice = discount && discount > 0 ? price * (1 - discount / 100) : null;

  const cardGlow = useTransform(
    [glowX, glowY],
    ([gx, gy]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(230,100,10,0.18) 0%, transparent 65%)`
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1200 }}
    >
      <Link to={`/products/${id}`} className="group block">
        <motion.div
          {...tiltProps}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          transition={{ type: "spring", stiffness: 120, damping: 25 }}
          className="relative overflow-hidden rounded-2xl bg-card gradient-card shadow-soft"
        >
          {/* Ambient glow layer */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: cardGlow }}
          />

          <div className="relative z-0 aspect-[4/5] overflow-hidden bg-secondary/30">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                <ShoppingCart className="h-10 w-10" />
              </div>
            )}
            {discount && discount > 0 && (
              <div className="absolute top-3 left-3 z-20 rounded-full gradient-hero px-2.5 py-1 text-[11px] font-bold text-primary-foreground tracking-wide">
                -{discount}%
              </div>
            )}
            {!isSeller && (
              <div className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <Button
                  size="icon"
                  className="h-9 w-9 rounded-full shadow-elevated"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="relative z-20 p-4">
            <h3 className="font-inter text-[13px] font-medium leading-snug line-clamp-2 text-foreground/80 group-hover:text-foreground transition-colors">
              {name}
            </h3>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-satoshi text-lg font-bold text-foreground">
                GHS {discountedPrice ? discountedPrice.toFixed(2) : price?.toFixed(2)}
              </span>
              {discountedPrice && (
                <span className="text-xs text-muted-foreground line-through">GHS {price?.toFixed(2)}</span>
              )}
            </div>
            {stock !== undefined && stock <= 5 && stock > 0 && (
              <p className="mt-1.5 text-[11px] font-medium text-warning">Only {stock} left in stock</p>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
