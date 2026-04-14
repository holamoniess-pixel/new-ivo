import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productApi } from "@/lib/api";
import { sampleTrending } from "@/lib/sampleData";

const AD_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const AD_STORAGE_KEY = "savvy_last_ad_time";
const AD_FIRST_SHOWN_KEY = "savvy_first_ad_shown";

interface AdProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  discount?: number;
}

const ProductAdModal = () => {
  const [ads, setAds] = useState<AdProduct[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const fetchAds = useCallback(async (): Promise<AdProduct[]> => {
    try {
      const trending = await productApi.getTrending();
      if (Array.isArray(trending) && trending.length > 0) {
        return trending.slice(0, 3);
      }
    } catch {
      // fallback
    }
    return sampleTrending.slice(0, 3);
  }, []);

  const showAds = useCallback(async () => {
    const products = await fetchAds();
    if (products.length === 0) return;
    setAds(products);
    setCurrentIndex(0);
    setVisible(true);
    localStorage.setItem(AD_STORAGE_KEY, Date.now().toString());
  }, [fetchAds]);

  useEffect(() => {
    const isAuthenticated = !!localStorage.getItem("accessToken");
    const firstShown = localStorage.getItem(AD_FIRST_SHOWN_KEY);
    const lastAdTime = localStorage.getItem(AD_STORAGE_KEY);

    // First ad on signup/first login
    if (isAuthenticated && !firstShown) {
      localStorage.setItem(AD_FIRST_SHOWN_KEY, "true");
      const timer = setTimeout(() => showAds(), 2000);
      return () => clearTimeout(timer);
    }

    // Recurring ads every 1 hour
    if (isAuthenticated) {
      const elapsed = lastAdTime ? Date.now() - parseInt(lastAdTime) : AD_INTERVAL_MS + 1;
      const delay = Math.max(0, AD_INTERVAL_MS - elapsed);
      const timer = setTimeout(() => showAds(), delay);
      const interval = setInterval(() => showAds(), AD_INTERVAL_MS);
      return () => { clearTimeout(timer); clearInterval(interval); };
    }
  }, [showAds]);

  const handleClose = () => setVisible(false);

  const handleNext = () => {
    if (currentIndex < ads.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setVisible(false);
    }
  };

  const ad = ads[currentIndex];
  const discountedPrice = ad?.discount && ad.discount > 0 ? ad.price * (1 - ad.discount / 100) : null;

  return (
    <AnimatePresence>
      {visible && ad && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-3xl bg-card shadow-elevated overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full gradient-hero px-3 py-1 text-[11px] font-bold text-primary-foreground">
              <Sparkles className="h-3 w-3" />
              Featured Product
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Product image */}
            <div className="aspect-[4/3] bg-secondary/30 overflow-hidden">
              {ad.imageUrl ? (
                <img src={ad.imageUrl} alt={ad.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                  <ShoppingBag className="h-16 w-16" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-satoshi text-lg font-bold text-foreground leading-snug line-clamp-2">
                  {ad.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-satoshi text-2xl font-bold text-foreground">
                    GHS {discountedPrice ? discountedPrice.toFixed(2) : ad.price?.toFixed(2)}
                  </span>
                  {discountedPrice && (
                    <span className="text-sm text-muted-foreground line-through">GHS {ad.price?.toFixed(2)}</span>
                  )}
                  {ad.discount && ad.discount > 0 && (
                    <span className="text-xs font-bold text-primary">-{ad.discount}% OFF</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/products/${ad.id}`} className="flex-1" onClick={handleClose}>
                  <Button className="w-full rounded-xl gap-2 h-11 font-semibold">
                    <ExternalLink className="h-4 w-4" /> View Product
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="rounded-xl h-11 px-4 font-semibold border-border"
                  onClick={handleNext}
                >
                  {currentIndex < ads.length - 1 ? "Next" : "Close"}
                </Button>
              </div>

              {/* Dots indicator */}
              <div className="flex justify-center gap-1.5">
                {ads.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentIndex ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductAdModal;
