import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView, useTransform } from "framer-motion";
import { productApi, cartApi } from "@/lib/api";
import { sampleCategories, sampleNewArrivals } from "@/lib/sampleData";
import LoadingSpinner from "@/components/LoadingSpinner";
import HomeSkeleton from "@/components/HomeSkeleton";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTilt, useMagnetic } from "@/hooks/useMotion";

// ─── SVG Icon Components (professional, clean) ────────────────────────────────
const IconArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IconSparkles = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z" />
    <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" />
  </svg>
);
const IconZap = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconShieldCheck = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const IconTruck = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
const IconMessageSquare = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconCamera = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IconBrain = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.83A3 3 0 0 1 4.5 9.5a3 3 0 0 1 1.5-2.6A2.5 2.5 0 0 1 9.5 2z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.83A3 3 0 0 0 19.5 9.5a3 3 0 0 0-1.5-2.6A2.5 2.5 0 0 0 14.5 2z" />
  </svg>
);
const IconSearch = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
const IconChevronRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
const IconChevronLeft = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IconClock = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
const IconPackage = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconCalendarClock = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5M16 2v4M8 2v4M3 10h5" />
    <circle cx="17" cy="17" r="4" />
    <path d="M17 15v2.2l1.4 1.4" />
  </svg>
);
const IconShoppingCart = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const IconFlame = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);
const IconTag = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const IconX = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconWhatsapp = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.103 1.508 5.836L.057 23.25a.75.75 0 00.916.943l5.638-1.479A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.73 9.73 0 01-4.962-1.355l-.356-.212-3.686.967.984-3.595-.232-.371A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
  </svg>
);
const IconStar = ({ size = 12, filled = true }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ─── Inline logo ──────────────────────────────────────────────────────────────
function OnettLogoMark({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.25,
      background: "linear-gradient(135deg,#E6640A,#cf5208)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", boxShadow: "0 2px 8px rgba(230,100,10,0.35)", flexShrink: 0,
    }}>
      <span style={{ color: "#fff", fontFamily: "'Satoshi', sans-serif", fontWeight: 800, fontSize: size * 0.3, lineHeight: 1, letterSpacing: "-0.5px" }}>ON</span>
      <span style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Satoshi', sans-serif", fontWeight: 700, fontSize: size * 0.22, lineHeight: 1, letterSpacing: "0.5px" }}>ETT</span>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface CarouselProduct {
  id: string; name: string; brand: string; price: number;
  primaryImageUrl?: string; categoryName?: string; stockStatus?: string;
  availableInDays?: number | null; isDiscounted?: boolean;
  discountPercentage?: number; discountPrice?: number;
}
interface ProductCardData {
  id: string; name: string; brand?: string; price: number;
  primaryImageUrl?: string; images?: { imageUrl: string }[];
  isDiscounted?: boolean; discountPercentage?: number;
  discountPrice?: number; stock?: number; categoryName?: string; category?: { name: string };
}

function dedupeById<T extends { id: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  return arr.filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
}

// ─── Sample fallback data ─────────────────────────────────────────────────────
const sampleUpcoming: CarouselProduct[] = [
  { id: "u1", name: "Sony WH-1000XM6", brand: "Sony", price: 1299, stockStatus: "PRE_ORDER", availableInDays: 5, primaryImageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" },
  { id: "u2", name: "Nike Air Max 2026", brand: "Nike", price: 680, stockStatus: "COMING_SOON", availableInDays: 14, primaryImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
  { id: "u3", name: "MacBook Air M4", brand: "Apple", price: 8499, stockStatus: "PRE_ORDER", availableInDays: 3, primaryImageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80" },
  { id: "u4", name: "Samsung Galaxy S25 Ultra", brand: "Samsung", price: 6499, stockStatus: "COMING_SOON", availableInDays: 21, primaryImageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80" },
  { id: "u5", name: "Dyson V16 Slim", brand: "Dyson", price: 2199, stockStatus: "PRE_ORDER", availableInDays: 7, primaryImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
];
const sampleFlashSale: CarouselProduct[] = [
  { id: "f1", name: "Samsung Galaxy S24 FE", brand: "Samsung", price: 5399, isDiscounted: true, discountPercentage: 35, discountPrice: 3499, primaryImageUrl: "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=400&q=80" },
  { id: "f2", name: "Sony WH-1000XM5", brand: "Sony", price: 1499, isDiscounted: true, discountPercentage: 40, discountPrice: 899, primaryImageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" },
  { id: "f3", name: "Nike Air Max 270", brand: "Nike", price: 720, isDiscounted: true, discountPercentage: 25, discountPrice: 540, primaryImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
  { id: "f4", name: "MacBook Air M3", brand: "Apple", price: 8499, isDiscounted: true, discountPercentage: 20, discountPrice: 6799, primaryImageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80" },
  { id: "f5", name: "Kindle Paperwhite 7", brand: "Amazon", price: 499, isDiscounted: true, discountPercentage: 30, discountPrice: 349, primaryImageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80" },
];
const sampleNewArrivalsCarousel: CarouselProduct[] = [
  { id: "n1", name: "AirPods Pro 3rd Gen", brand: "Apple", price: 1799, isDiscounted: true, discountPercentage: 10, discountPrice: 1619, primaryImageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&q=80" },
  { id: "n2", name: "Adidas Ultraboost 25", brand: "Adidas", price: 720, primaryImageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80" },
  { id: "n3", name: "Levi's 501 Original", brand: "Levi's", price: 380, primaryImageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80" },
  { id: "n4", name: "Instant Pot Duo 7-in-1", brand: "Instant Pot", price: 550, primaryImageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80" },
  { id: "n5", name: "GoPro Hero 13 Black", brand: "GoPro", price: 1899, primaryImageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80" },
  { id: "n6", name: "PS5 Slim Digital", brand: "Sony", price: 3899, primaryImageUrl: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&q=80" },
];

const adBanners = [
  { id: "a1", bg: "linear-gradient(135deg,#0f2044,#1a3a6e)", icon: "💳", title: "MTN MoMo — Pay & save 5%", sub: "Use MoMo at checkout for instant cashback on every order", cta: "Try it" },
  { id: "a2", bg: "linear-gradient(135deg,#064e3b,#065f46)", icon: "🚚", title: "Free Delivery over GHS 200", sub: "DHL Express · Accra & Kumasi same-day available", cta: "Learn more" },
  { id: "a3", bg: "linear-gradient(135deg,#1e1b4b,#312e81)", icon: "🔐", title: "Sell on ONETT — It's free", sub: "Reach thousands of buyers across Ghana instantly", cta: "Start selling" },
];

const aiFeatures = [
  { icon: IconBrain, title: "Smart Picks", desc: "AI learns your taste and curates products you'll love", color: "#E6640A", bg: "rgba(230,100,10,0.1)" },
  { icon: IconCamera, title: "Image Search", desc: "Snap a photo and find matching products instantly", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  { icon: IconMessageSquare, title: "AI Advisor", desc: "Chat for style advice, comparisons & budget tips", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  { icon: IconSearch, title: "Smart Search", desc: "Natural language that understands what you mean", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
];

// Hero background image — premium lifestyle/tech shopping aesthetic
const HERO_BG = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80";

function normaliseToCarousel(p: any): CarouselProduct {
  return {
    id: String(p.id), name: p.name ?? "", brand: p.brand ?? "",
    price: Number(p.price),
    primaryImageUrl: p.primaryImageUrl ?? p.images?.[0]?.imageUrl ?? undefined,
    categoryName: p.categoryName ?? p.category?.name ?? undefined,
    stockStatus: p.stockStatus ?? undefined,
    availableInDays: p.availableInDays ?? null,
    isDiscounted: p.isDiscounted ?? p.discounted ?? false,
    discountPercentage: p.discountPercentage != null ? Number(p.discountPercentage) : undefined,
    discountPrice: p.discountPrice != null ? Number(p.discountPrice) : undefined,
  };
}

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(productId: string, days: number | null | undefined) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!days || !productId) return;
    const key = `onett_cd_${productId}`;
    let target: number;
    const saved = localStorage.getItem(key);
    if (saved) {
      target = Number(saved);
      if (target < Date.now()) { target = Date.now() + days * 86_400_000; localStorage.setItem(key, String(target)); }
    } else { target = Date.now() + days * 86_400_000; localStorage.setItem(key, String(target)); }
    const tick = () => {
      const d = Math.max(0, target - Date.now());
      setT({ days: Math.floor(d / 86_400_000), hours: Math.floor((d / 3_600_000) % 24), minutes: Math.floor((d / 60_000) % 60), seconds: Math.floor((d / 1_000) % 60) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [days, productId]);
  return t;
}

// ─── Cart button ──────────────────────────────────────────────────────────────
function CartBtn({ productId }: { productId: string }) {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const handle = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { toast.error("Please sign in to add to cart"); return; }
    setLoading(true);
    try { await cartApi.add(productId, 1); toast.success("Added to cart!"); }
    catch { toast.error("Failed to add to cart"); }
    finally { setLoading(false); }
  };
  return (
    <button onClick={handle} disabled={loading} className="p-btn-cart">
      <IconShoppingCart size={11} />{loading ? "…" : "Cart"}
    </button>
  );
}

// ─── HScroll Card ─────────────────────────────────────────────────────────────
function HScrollCard({ product, showTimer }: { product: CarouselProduct; showTimer?: boolean }) {
  const navigate = useNavigate();
  const { days, hours, minutes, seconds } = useCountdown(product.id, product.availableInDays);
  const hasDiscount = product.isDiscounted && product.discountPrice;
  const isPreOrder = product.stockStatus === "PRE_ORDER";
  const isComingSoon = product.stockStatus === "COMING_SOON";
  const hasStatus = isPreOrder || isComingSoon;

  const { rotateX, rotateY, glowX, glowY, tiltProps } = useTilt({
    maxRotateX: 5,
    maxRotateY: 5,
    maxGlow: 30,
    springStiffness: 120,
    springDamping: 25,
    perspective: 1200,
  });

  const cardGlow = useTransform(
    [glowX, glowY],
    ([gx, gy]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(230,100,10,0.2) 0%, transparent 70%)`
  );

  return (
    <Link to={`/products/${product.id}`} className="hs-card cursor-pointer">
      <motion.div
        {...tiltProps}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        transition={{ type: "spring", stiffness: 120, damping: 25 }}
        className="relative overflow-hidden"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300"
          style={{ background: cardGlow }}
        />
        <div className="hs-img">
          {product.primaryImageUrl
            ? <img src={product.primaryImageUrl} alt={product.name} className="hs-img-el" loading="lazy" />
            : <div className="hs-img-ph"><IconPackage size={32} /></div>}
          {hasDiscount && !showTimer && (
            <div className="hs-disc-badge">-{product.discountPercentage}%</div>
          )}
          {showTimer && hasStatus && (
            <div className={`hs-timer-badge${isPreOrder ? " tb-orange" : " tb-blue"}`}>
              <IconClock size={9} />
              {String(days).padStart(2,"0")}d:{String(hours).padStart(2,"0")}h:{String(minutes).padStart(2,"0")}m:{String(seconds).padStart(2,"0")}s
            </div>
          )}
        </div>
        <div className="hs-body">
          {hasStatus && (
            <div className={`hs-status${isPreOrder ? " st-orange" : " st-blue"}`}>
              <IconCalendarClock size={9} />
              {isPreOrder ? "Pre-order" : "Coming Soon"}
            </div>
          )}
          <div className="hs-brand">{product.brand}</div>
          <div className="hs-name">{product.name}</div>
          <div className="hs-price-row">
            {hasDiscount
              ? <>
                  <span className="hs-price">GHS {product.discountPrice?.toLocaleString()}</span>
                  <span className="hs-price-old">GHS {product.price?.toLocaleString()}</span>
                </>
              : <span className="hs-price-plain">GHS {product.price?.toLocaleString()}</span>}
          </div>
          <div className="p-actions">
            <CartBtn productId={product.id} />
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/products/${product.id}`); }}
              className="p-btn-order"
            >
              <IconArrowRight size={10} />Order
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function GridCard({ product }: { product: ProductCardData }) {
  const navigate = useNavigate();
  const imageUrl = product.primaryImageUrl || product.images?.[0]?.imageUrl || null;
  const hasDiscount = product.isDiscounted && product.discountPrice;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const inStock = (product.stock ?? 1) > 0;
  const { containerRef, rotateX, rotateY, glowX, glowY, tiltProps } = useTilt();

  const cardGlow = useTransform(
    [glowX, glowY],
    ([gx, gy]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(230,100,10,0.18) 0%, transparent 70%)`
  );

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        {...tiltProps}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        transition={{ type: "spring", stiffness: 120, damping: 25 }}
        className="gc cursor-pointer"
      >
        <Link to={`/products/${product.id}`} className="gc">
        <div className="gc-img-wrap">
          {imageUrl
            ? <img src={imageUrl} alt={product.name} className="gc-img-el" loading="lazy" />
            : <div className="gc-img-ph"><IconPackage size={28} /></div>}
          {hasDiscount && <div className="gc-disc">-{product.discountPercentage}%</div>}
          {!inStock && (
            <div className="gc-oos"><span>Out of stock</span></div>
          )}
        </div>
        <div className="gc-body">
          {product.brand && <div className="gc-brand">{product.brand}</div>}
          <div className="gc-name">{product.name}</div>
          <div className="gc-stars">
            {[1,2,3,4,5].map(s => (
              <span key={s} style={{ color: "#f59e0b" }}>
                <IconStar size={10} filled={s <= 4} />
              </span>
            ))}
            <span className="gc-rating-count">(42)</span>
          </div>
          <div className="gc-price-row">
            <span className="gc-price">GHS {Number(displayPrice).toLocaleString()}</span>
            {hasDiscount && <span className="gc-price-old">GHS {Number(product.price).toLocaleString()}</span>}
          </div>
          {inStock && (
            <div className="p-actions">
              <CartBtn productId={product.id} />
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/products/${product.id}`); }}
                className="p-btn-order"
              >
                <IconArrowRight size={10} />Order
              </button>
            </div>
          )}
        </div>
      </Link>
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: cardGlow }}
      />
    </motion.div>
    </div>
  );
}

// ─── HScroll Section ──────────────────────────────────────────────────────────
function HScrollSection({ title, subtitle, accent, icon: Icon, items, showTimer, badge }: {
  title: string; subtitle: string; accent: string; icon: React.ElementType;
  items: CarouselProduct[]; showTimer?: boolean; badge?: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const scroll = (dir: number) => trackRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });

  return (
    <div className="hs-section-inner" ref={sectionRef}>
      <div className="hs-header">
        <div className="hs-header-left">
          <motion.div
            className="hs-icon"
            style={{ background: `${accent}18` }}
            initial={{ scale: 0, rotate: -10 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Icon size={16} style={{ color: accent }} />
          </motion.div>
          <div>
            <motion.div
              style={{ display: "flex", alignItems: "center", gap: 8 }}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <span className="hs-title">{title}</span>
              {badge}
            </motion.div>
            <motion.div
              className="hs-sub"
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {subtitle}
            </motion.div>
          </div>
        </div>
        <div className="hs-nav-btns">
          <button className="hs-nav-btn" onClick={() => scroll(-1)}><IconChevronLeft size={14} /></button>
          <button className="hs-nav-btn" onClick={() => scroll(1)}><IconChevronRight size={14} /></button>
        </div>
      </div>
      <div ref={trackRef} className="hs-track">
        {items.map((item, i) => {
          const fromTop = i % 2 === 0;
          const initialY = fromTop ? -50 : 50;
          const initialOpacity = 0;
          const initialScale = 0.88;
          const initialRotate = fromTop ? -3 : 3;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: initialOpacity, y: initialY, scale: initialScale, rotate: initialRotate }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1, rotate: 0 } : {}}
              transition={{
                duration: 0.55,
                delay: Math.min(i * 0.07, 0.5),
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{
                y: -8,
                scale: 1.04,
                rotate: 0,
                transition: { type: "spring", stiffness: 400, damping: 20 },
              }}
            >
              <HScrollCard product={item} showTimer={showTimer} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Ad Banner ────────────────────────────────────────────────────────────────
function AdBanner({ ad }: { ad: typeof adBanners[0] }) {
  return (
    <div className="ad-banner" style={{ background: ad.bg }}>
      <span className="ad-label">Ad</span>
      <div className="ad-icon">{ad.icon}</div>
      <div className="ad-body">
        <div className="ad-title">{ad.title}</div>
        <div className="ad-sub">{ad.sub}</div>
      </div>
      <button className="ad-cta">{ad.cta}</button>
    </div>
  );
}

// ─── Welcome Popup (redesigned) ───────────────────────────────────────────────
const WELCOME_KEY = "onett_welcome_v4";

function WelcomePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(WELCOME_KEY)) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem(WELCOME_KEY, "1");
  }, []);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  if (!visible) return null;

  const perks = [
    { icon: IconBrain, label: "AI-Powered Picks", desc: "Curated just for you" },
    { icon: IconShieldCheck, label: "Secure Checkout", desc: "Encrypted & trusted" },
    { icon: IconTruck, label: "Fast Delivery", desc: "Across all of Ghana" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(5,8,18,0.82)",
          backdropFilter: "blur(8px) saturate(0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 380,
            borderRadius: 28,
            overflow: "hidden",
            background: "#0d0d0d",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(230,100,10,0.15)",
          }}
        >
          {/* Top image strip */}
          <div style={{
            width: "100%", height: 180,
            background: `url(${HERO_BG}) center/cover no-repeat`,
            position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(13,13,13,1) 100%)",
            }} />
            {/* Logo centered on image */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -60%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: "linear-gradient(135deg,#E6640A,#cf5208)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                boxShadow: "0 12px 40px rgba(230,100,10,0.5)",
              }}>
                <span style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 900, fontSize: 22, color: "#fff", lineHeight: 1, letterSpacing: "-1px" }}>ON</span>
                <span style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1, letterSpacing: "2px" }}>ETT</span>
              </div>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={close}
            style={{
              position: "absolute", top: 14, right: 14, zIndex: 10,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <IconX size={14} />
          </button>

          {/* Content */}
          <div style={{ padding: "0 24px 26px" }}>
            {/* Badge */}
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "rgba(230,100,10,0.12)", border: "1px solid rgba(230,100,10,0.2)",
                color: "#fb923c", fontSize: 11, fontWeight: 700,
                padding: "4px 12px", borderRadius: 99,
              }}>
                <IconSparkles size={10} />
                Welcome to ONETT
              </span>
            </div>

            <h2 style={{
              textAlign: "center",
              fontFamily: "'Satoshi', sans-serif",
              fontSize: 26, fontWeight: 800,
              color: "#fff", lineHeight: 1.15,
              margin: "0 0 8px",
              letterSpacing: "-0.5px",
            }}>
              Shop Smarter,<br />
              <span style={{ color: "#E6640A" }}>Every Day.</span>
            </h2>
            <p style={{
              textAlign: "center", fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.65, margin: "0 0 20px",
            }}>
              Ghana's AI-powered marketplace.<br />
              Personalized picks & unbeatable deals.
            </p>

            {/* Perks */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {perks.map(({ icon: Icon, label, desc }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14, padding: "11px 14px",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(230,100,10,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon size={16} style={{ color: "#E6640A" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Manrope', sans-serif" }}>{label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 1 }}>{desc}</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(230,100,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <IconChevronRight size={10} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              to="/search?keyword="
              onClick={close}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "linear-gradient(135deg, #E6640A, #d45a09)",
                color: "#fff", borderRadius: 14, padding: "14px 0",
                fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(230,100,10,0.4)",
                marginBottom: 10,
              }}
            >
              Start Shopping <IconArrowRight size={16} />
            </Link>

            <button
              onClick={close}
              style={{
                display: "block", width: "100%", textAlign: "center",
                fontSize: 12, color: "rgba(255,255,255,0.22)",
                background: "transparent", border: "none", cursor: "pointer",
                padding: "4px 0",
              }}
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const Index = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductCardData[]>([]);
  const [newArrivalsCarousel, setNewArrivalsCarousel] = useState<CarouselProduct[]>([]);
  const [upcomingCarousel, setUpcomingCarousel] = useState<CarouselProduct[]>([]);
  const [flashSale, setFlashSale] = useState<CarouselProduct[]>([]);
  const [adIdx, setAdIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const magnet1 = useMagnetic({ strength: 0.3 });
  const magnet2 = useMagnetic({ strength: 0.3 });

  useEffect(() => {
    const fetchAll = async () => {
      const [homeResult, upcomingResult] = await Promise.allSettled([
        productApi.getHome(),
        productApi.getUpcoming(),
      ]);

      if (homeResult.status === "fulfilled" && homeResult.value) {
        const home = homeResult.value;
        const rawArrivals = Array.isArray(home.newArrivals) ? home.newArrivals : [];
        const arrivals: ProductCardData[] = rawArrivals.map((p: any) => ({
          ...p, id: String(p.id),
          isDiscounted: p.isDiscounted ?? p.discounted ?? false,
          discountPrice: p.discountPrice != null ? Number(p.discountPrice) : undefined,
          discountPercentage: p.discountPercentage != null ? Number(p.discountPercentage) : undefined,
        }));
        const dedupedArrivals = dedupeById(arrivals);
        setCategories(Array.isArray(home.categories) ? home.categories : []);
        setNewArrivals(dedupedArrivals);
        const carouselArrivals = dedupeById(dedupedArrivals.map(normaliseToCarousel));
        setNewArrivalsCarousel(carouselArrivals.length > 0 ? carouselArrivals : sampleNewArrivalsCarousel);
        const discounted = dedupeById(dedupedArrivals.filter(p => p.isDiscounted && p.discountPrice).map(normaliseToCarousel));
        setFlashSale(discounted.length > 0 ? discounted : sampleFlashSale);
      } else {
        setCategories(sampleCategories);
        setNewArrivals(sampleNewArrivals.map((p: any) => ({ ...p, id: String(p.id) })));
        setNewArrivalsCarousel(sampleNewArrivalsCarousel);
        setFlashSale(sampleFlashSale);
      }

      if (upcomingResult.status === "fulfilled" && upcomingResult.value) {
        const upcoming = upcomingResult.value;
        const pre = Array.isArray(upcoming.preOrder) ? upcoming.preOrder.map(normaliseToCarousel) : [];
        const soon = Array.isArray(upcoming.comingSoon) ? upcoming.comingSoon.map(normaliseToCarousel) : [];
        const merged = dedupeById([...pre, ...soon]);
        setUpcomingCarousel(merged.length > 0 ? merged : sampleUpcoming);
      } else { setUpcomingCarousel(sampleUpcoming); }

      setLoading(false);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setAdIdx(i => (i + 1) % adBanners.length), 5000);
    return () => clearInterval(id);
  }, []);

  if (loading) return <HomeSkeleton />;

  return (
    <>
      <div className="onett-page">
        <WelcomePopup />
        <Navbar />

        {/* ── HERO — full bleed image ── */}
        <section className="hero">
          <img
            className="hero-bg-img"
            src={HERO_BG}
            alt="Shopping"
            loading="eager"
          />
          <div className="hero-overlay" />
          <div className="hero-glow" />
          <div className="hero-inner">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hero-badge">
                <IconSparkles size={11} />
                AI-Powered · Ghana's Smartest Shop
              </div>
              <h1 className="hero-h1">
                Shop Smarter<br />with <em>ONETT.</em>
              </h1>
              <p className="hero-p">
                Personalized picks, snap-to-search, budget advice, and unbeatable deals — all in one place.
              </p>
              <div className="hero-btns">
                <motion.div style={{ x: magnet1.x, y: magnet1.y }}>
                  <Link to="/search?keyword=" className="h-btn-primary" {...magnet1.magneticProps}>
                    Start Shopping <IconArrowRight size={15} />
                  </Link>
                </motion.div>
                <motion.div style={{ x: magnet2.x, y: magnet2.y }}>
                  <Link to="/ai-assistant" className="h-btn-ghost" {...magnet2.magneticProps}>
                    <IconSparkles size={13} />
                    Try AI Assistant
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <div className="cats-wrap">
          <div className="pg">
            <div className="sh">
              <div className="sh-left">
                <div className="sh-icon" style={{ background: "rgba(230,100,10,0.1)" }}>
                  <IconTag size={16} style={{ color: "#E6640A" }} />
                </div>
                <div>
                  <div className="sh-title">Browse Categories</div>
                  <div className="sh-sub">Find exactly what you're looking for</div>
                </div>
              </div>
              <Link to="/categories" className="sh-link">
                View all <IconChevronRight size={13} />
              </Link>
            </div>
            <div className="cats-scroll">
              {(categories.length > 0 ? categories : sampleCategories).slice(0, 12).map((cat: any) => (
                <Link key={cat.id} to={`/categories/${cat.slug}`} className="cat-item">
                  <div className="cat-icon-box">
                    {cat.icon?.imageUrl
                      ? <img src={cat.icon.imageUrl} alt={cat.name} className="cat-icon-img" loading="lazy" />
                      : <IconPackage size={24} />}
                  </div>
                  <span className="cat-lbl">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="sdiv" />

        {/* ── FLASH SALE ── */}
        {flashSale.length > 0 && (
          <div className="hs-section">
            <div className="pg">
              <div className="flash-section-header">
                <div className="flash-section-left">
                  <div className="hs-icon" style={{ background: "rgba(239,68,68,0.1)" }}>
                    <IconFlame size={16} style={{ color: "#ef4444" }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="hs-title">Flash Sale</span>
                      <div className="live-badge"><div className="live-dot" />LIVE</div>
                    </div>
                    <div className="hs-sub">Limited time — grab it before it's gone</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="hs-nav-btns" style={{ display: "flex" }}>
                    <button className="hs-nav-btn" onClick={() => document.getElementById("flash-track")?.scrollBy({ left: -260, behavior: "smooth" })}>
                      <IconChevronLeft size={14} />
                    </button>
                    <button className="hs-nav-btn" onClick={() => document.getElementById("flash-track")?.scrollBy({ left: 260, behavior: "smooth" })}>
                      <IconChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div id="flash-track" className="hs-track">
                {flashSale.map(item => <HScrollCard key={item.id} product={item} />)}
              </div>
            </div>
          </div>
        )}

        <div className="sdiv" />

        {/* ── AD BANNER (rotating) ── */}
        <div className="pg" style={{ paddingTop: 16 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={adBanners[adIdx].id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28 }}
            >
              <AdBanner ad={adBanners[adIdx]} />
            </motion.div>
          </AnimatePresence>
          <div className="ad-dots">
            {adBanners.map((_, i) => (
              <div key={i} className={`ad-dot${i === adIdx ? " active" : ""}`} onClick={() => setAdIdx(i)} />
            ))}
          </div>
        </div>

        <div className="sdiv" />

        {/* ── NEW ARRIVALS SCROLL ── */}
        {newArrivalsCarousel.length > 0 && (
          <div className="hs-section hs-alt">
            <div className="pg">
              <HScrollSection
                title="New Arrivals"
                subtitle="Fresh products added this week"
                accent="#f59e0b"
                icon={IconZap}
                items={newArrivalsCarousel}
              />
            </div>
          </div>
        )}

        <div className="sdiv" />

        {/* ── UPCOMING DROPS ── */}
        {upcomingCarousel.length > 0 && (
          <div className="hs-section">
            <div className="pg">
              <HScrollSection
                title="Upcoming Drops"
                subtitle="Pre-order & coming soon — with live countdowns"
                accent="#8b5cf6"
                icon={IconCalendarClock}
                items={upcomingCarousel}
                showTimer
                badge={
                  <span className="shimmer-badge">
                    <IconClock size={9} />Live timer
                  </span>
                }
              />
            </div>
          </div>
        )}

        <div className="sdiv" />

        {/* ── JUST DROPPED (deduplicated scroll) ── */}
        {newArrivals.length > 0 && (() => {
          const dedupedForScroll = dedupeById(newArrivals.map(p => ({
            id: String(p.id), name: p.name ?? "", brand: p.brand ?? "",
            price: Number(p.price),
            primaryImageUrl: p.primaryImageUrl ?? p.images?.[0]?.imageUrl ?? undefined,
            isDiscounted: p.isDiscounted, discountPercentage: p.discountPercentage,
            discountPrice: p.discountPrice,
          } as CarouselProduct)));

          return (
            <div className="hs-section hs-alt">
              <div className="pg">
                <HScrollSection
                  title="Just Dropped"
                  subtitle="Browse all new products"
                  accent="#f59e0b"
                  icon={IconZap}
                  items={dedupedForScroll}
                  badge={
                    <Link to="/search?keyword=new" style={{ fontSize: 11, color: "#E6640A", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}>
                      See all →
                    </Link>
                  }
                />
              </div>
            </div>
          );
        })()}

        <div className="sdiv" />

        {/* ── AI FEATURES ── */}
        <div className="hs-section">
          <div className="pg">
            <div className="sh">
              <div className="sh-left">
                <div className="sh-icon" style={{ background: "rgba(230,100,10,0.1)" }}>
                  <IconSparkles size={16} style={{ color: "#E6640A" }} />
                </div>
                <div>
                  <div className="sh-title">Shopping, Reimagined</div>
                  <div className="sh-sub">Powered by AI</div>
                </div>
              </div>
            </div>
            <div className="ai-grid">
              {aiFeatures.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="ai-card cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{
                    y: -6,
                    scale: 1.04,
                    boxShadow: "0 16px 40px rgba(230,100,10,0.12)",
                    borderColor: "rgba(230,100,10,0.3)",
                    transition: { type: "spring", stiffness: 400, damping: 18 },
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="ai-card-icon" style={{ background: f.bg }}>
                    <f.icon size={18} style={{ color: f.color }} />
                  </div>
                  <div className="ai-card-title">{f.title}</div>
                  <div className="ai-card-desc">{f.desc}</div>
                </motion.div>
              ))}
            </div>
            <div style={{ textAlign: "center", padding: "14px 0 26px" }}>
              <Link to="/ai-assistant" style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(230,100,10,0.08)", border: "1px solid rgba(230,100,10,0.2)",
                color: "#E6640A", fontFamily: "'Manrope', sans-serif",
                fontSize: 13.5, fontWeight: 700,
                padding: "11px 24px", borderRadius: 12, textDecoration: "none",
                transition: "background 0.15s",
              }}>
                <IconSparkles size={14} />Try AI Assistant Now
              </Link>
            </div>
          </div>
        </div>

        <div className="sdiv" />

        {/* ── AD BANNER 2 ── */}
        <div className="pg" style={{ paddingTop: 16, paddingBottom: 4 }}>
          <AdBanner ad={adBanners[(adIdx + 1) % adBanners.length]} />
        </div>

        <div className="sdiv" />

        {/* ── CTA BANNER ── */}
        <div className="pg" style={{ paddingTop: 22, paddingBottom: 10 }}>
          <motion.div
            className="cta-banner"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="cta-glow" />
            <div className="cta-content">
              <h2 className="cta-h2">Not sure what to buy?<br />Let AI decide.</h2>
              <p className="cta-p">Describe what you need, set your budget, and our AI will curate the perfect selection just for you.</p>
              <div className="cta-btns">
                <Link to="/ai-assistant" className="cta-btn-w">
                  <IconSparkles size={14} />Chat with AI
                </Link>
                <Link to="/register" className="cta-btn-g">Create Free Account</Link>
              </div>
            </div>
            <div className="cta-logo">
              <div className="cta-logo-box">
                <div className="cta-logo-on">ON</div>
                <div className="cta-logo-ett">ETT</div>
              </div>
              <span className="cta-logo-name">ONETT<span style={{ opacity: 0.55 }}>.</span></span>
            </div>
          </motion.div>
        </div>

        {/* ── TRUST GRID ── */}
        <div className="pg" style={{ paddingTop: 10, paddingBottom: 26 }}>
          <div className="trust-grid">
            {[
              { icon: IconShieldCheck, title: "Secure Payments", desc: "Every transaction is encrypted and protected" },
              { icon: IconTruck, title: "Fast Delivery", desc: "Real-time tracking from purchase to doorstep" },
              { icon: IconSparkles, title: "AI-Powered", desc: "Smart recommendations tailored just for you" },
              { icon: IconMessageSquare, title: "24/7 Support", desc: "Connect with sellers and get instant help" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                className="trust-card cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{
                  y: -6,
                  scale: 1.04,
                  boxShadow: "0 16px 40px rgba(0,0,0,0.1)",
                  borderColor: "rgba(230,100,10,0.25)",
                  transition: { type: "spring", stiffness: 400, damping: 20 },
                }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="trust-icon"><f.icon size={20} style={{ color: "#E6640A" }} /></div>
                <div>
                  <div className="trust-title">{f.title}</div>
                  <div className="trust-desc">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <motion.footer
          className="footer"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="footer-inner">
            <motion.div
              className="footer-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08 } },
              }}
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4 }}
              >
                <div className="footer-brand-row">
                  <OnettLogoMark size={34} />
                  <span className="footer-brand-name">ONETT<em>.</em></span>
                </div>
                <p className="footer-tagline">Ghana's AI-powered marketplace. Shop smarter, not harder.</p>
                <a
                  href="https://wa.me/233257765011?text=Hi%2C%20I%20found%20you%20on%20ONETT"
                  target="_blank" rel="noopener noreferrer" className="footer-wa"
                >
                  <IconWhatsapp size={15} /> Chat with a Seller
                </a>
              </motion.div>
              {[
                { title: "Shop", links: [
                    { label: "Categories", to: "/categories" },
                    { label: "All Products", to: "/search?keyword=" },
                    { label: "Flash Sales", to: "/search?discount=true" },
                ]},
                { title: "Account", links: [
                    { label: "Sign In", to: "/login" },
                    { label: "Create Account", to: "/register" },
                    { label: "My Orders", to: "/orders" },
                ]},
                { title: "Features", links: [
                    { label: "AI Assistant", to: "/ai-assistant" },
                    { label: "Messages", to: "/messages" },
                ]},
              ].map(col => (
                <motion.div
                  key={col.title}
                  className="footer-col"
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="footer-col-title">{col.title}</div>
                  <div className="footer-links">
                    {col.links.map(link => (
                      <Link key={link.label} to={link.to} className="footer-link">{link.label}</Link>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              className="footer-bottom"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="footer-copy">© 2026 ONETT. All rights reserved.</p>
              <p className="footer-copy">Smart Buying · Affordable Access</p>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </>
  );
};

export default Index;
