import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { productApi, cartApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import SkeletonGrid from "@/components/SkeletonGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  X,
  Package,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

const EMPTY_FILTERS = { brand: "", minPrice: "", maxPrice: "", categorySlug: "" };

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

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState(keyword);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");

  // ── Fetch ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const hasFilters =
          !!appliedFilters.brand ||
          !!appliedFilters.minPrice ||
          !!appliedFilters.maxPrice ||
          !!appliedFilters.categorySlug;

        let res;
        if (keyword && !hasFilters) {
          res = await productApi.globalSearch(keyword.trim());
        } else {
          const params: Record<string, string> = {};
          if (keyword) params.keyword = keyword;
          if (appliedFilters.brand) params.brand = appliedFilters.brand;
          if (appliedFilters.minPrice) params.minPrice = appliedFilters.minPrice;
          if (appliedFilters.maxPrice) params.maxPrice = appliedFilters.maxPrice;
          if (appliedFilters.categorySlug) params.categorySlug = appliedFilters.categorySlug;
          res = await productApi.searchWithFilters(params);
        }
        // ── FIX: normalise every product so isDiscounted / discountPrice are
        //         always correctly typed regardless of API field naming ──────
        setProducts((res?.products ?? []).map(normaliseProduct));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, appliedFilters]);

  // ── Sort ───────────────────────────────────────────────────
  const sortedProducts = [...products].sort((a, b) => {
    const pa = a.isDiscounted && a.discountPrice ? a.discountPrice : a.price;
    const pb = b.isDiscounted && b.discountPrice ? b.discountPrice : b.price;
    if (sortBy === "price_asc") return pa - pb;
    if (sortBy === "price_desc") return pb - pa;
    return 0;
  });

  // ── Handlers ───────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) { handleClear(); return; }
    setSearchParams({ keyword: query.trim() });
  };

  const handleClear = () => {
    setQuery("");
    setSearchParams({});
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setShowFilters(false);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  };

  const removeFilter = (key: keyof typeof EMPTY_FILTERS) => {
    setFilters(f => ({ ...f, [key]: "" }));
    setAppliedFilters(f => ({ ...f, [key]: "" }));
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error("Please sign in to add items to cart"); return; }
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

  const hasActiveSearch = !!keyword;
  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);
  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Sticky search bar ───────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-3 py-2.5">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, brands..."
              className="pl-9 pr-8 h-10 text-sm rounded-xl"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            className="bg-primary hover:bg-orange-700 text-white h-10 px-4 rounded-xl text-sm font-semibold shrink-0"
          >
            Search
          </Button>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`relative shrink-0 h-10 w-10 rounded-xl border flex items-center justify-center transition-colors
              ${showFilters || hasActiveFilters
                ? "bg-orange-50 border-primary/50 text-primary"
                : "border-border text-muted-foreground"
              }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>
        </form>
      </div>

      {/* ── Filter drawer ───────────────────────────────────── */}
      {showFilters && (
        <div className="bg-card border-b border-border px-3 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Brand</label>
              <Input
                placeholder="e.g. Nike, Samsung..."
                value={filters.brand}
                onChange={e => setFilters(f => ({ ...f, brand: e.target.value }))}
                className="h-10 text-sm rounded-xl"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Min (GHS)</label>
              <Input
                placeholder="0"
                type="number"
                inputMode="numeric"
                value={filters.minPrice}
                onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                className="h-10 text-sm rounded-xl"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Max (GHS)</label>
              <Input
                placeholder="Any"
                type="number"
                inputMode="numeric"
                value={filters.maxPrice}
                onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                className="h-10 text-sm rounded-xl"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Category</label>
              <Input
                placeholder="e.g. sneakers, phones..."
                value={filters.categorySlug}
                onChange={e => setFilters(f => ({ ...f, categorySlug: e.target.value }))}
                className="h-10 text-sm rounded-xl"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleApplyFilters}
              className="flex-1 bg-primary hover:bg-orange-700 text-white h-10 rounded-xl text-sm font-semibold"
            >
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="h-10 px-4 rounded-xl text-sm gap-1.5 shrink-0"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Page body ───────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-10 space-y-3">

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5">
            {appliedFilters.brand && (
              <span className="inline-flex items-center gap-1 bg-orange-50 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full">
                {appliedFilters.brand}
                <button onClick={() => removeFilter("brand")}><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
            {appliedFilters.minPrice && (
              <span className="inline-flex items-center gap-1 bg-orange-50 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full">
                Min GHS {appliedFilters.minPrice}
                <button onClick={() => removeFilter("minPrice")}><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
            {appliedFilters.maxPrice && (
              <span className="inline-flex items-center gap-1 bg-orange-50 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full">
                Max GHS {appliedFilters.maxPrice}
                <button onClick={() => removeFilter("maxPrice")}><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
            {appliedFilters.categorySlug && (
              <span className="inline-flex items-center gap-1 bg-orange-50 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full">
                {appliedFilters.categorySlug}
                <button onClick={() => removeFilter("categorySlug")}><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
          </div>
        )}

        {/* Result count + sort */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-sm font-bold truncate">
              {hasActiveSearch ? `"${keyword}"` : "All Products"}
            </h1>
            {!loading && (
              <p className="text-xs text-muted-foreground">
                {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""}
                {hasActiveSearch ? " found" : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="h-8 rounded-lg border border-border bg-card text-xs px-2 pr-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="default">Default</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
            {(hasActiveSearch || hasActiveFilters) && (
              <button
                onClick={handleClear}
                className="h-8 px-2.5 rounded-lg border border-border text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* ── Product list ──────────────────────────────────── */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="h-14 w-14 mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-base font-semibold">No products found</p>
            {(hasActiveSearch || hasActiveFilters) && (
              <p className="text-sm mt-1.5">
                Try different filters or{" "}
                <button onClick={handleClear} className="underline text-primary font-medium">
                  browse all
                </button>
              </p>
            )}
          </div>
        ) : (
          // Mobile: 1 col (horizontal card) | sm+: 2 col | md+: 3 col | lg+: 4 col
          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-3">
            {sortedProducts.map((p: any) => {
              const hasDiscount = p.isDiscounted && p.discountPrice;
              const displayPrice = hasDiscount ? p.discountPrice : p.price;
              const imageUrl = p.primaryImageUrl || p.images?.[0]?.imageUrl || null;

              return (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="group flex sm:flex-col rounded-2xl bg-card border border-border overflow-hidden active:scale-[0.98] transition-transform duration-100"
                >
                  {/* Image */}
                  <div className="relative w-28 h-28 shrink-0 sm:w-full sm:h-auto sm:aspect-square bg-muted overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={e => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.display = "none";
                          const parent = el.parentElement;
                          if (parent) {
                            const div = document.createElement("div");
                            div.className = "h-full w-full flex items-center justify-center";
                            div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>`;
                            parent.appendChild(div);
                          }
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Discount badge */}
                    {hasDiscount && (
                      <div className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        -{p.discountPercentage}%
                      </div>
                    )}

                    {/* Video badge */}
                    {p.hasVideo && (
                      <span className="absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                        VIDEO
                      </span>
                    )}

                    {/* Out of stock */}
                    {p.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-black/70 text-white text-[9px] font-bold px-2 py-1 rounded-full">
                          Out of stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 p-3 flex flex-col justify-between gap-1">
                    <div className="space-y-0.5">
                      {p.brand && (
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                          {p.brand}
                        </p>
                      )}
                      <p className="text-sm font-semibold line-clamp-2 leading-snug">
                        {p.name}
                      </p>
                      {p.categoryName && (
                        <p className="text-[10px] text-muted-foreground/60 truncate">
                          {p.categoryName}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-sm font-bold text-primary">
                          GHS {Number(displayPrice).toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            GHS {Number(p.price).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      {p.stock !== 0 && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => handleAddToCart(e, p.id)}
                            disabled={addingToCart === p.id}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 text-[11px] font-semibold border border-orange-500/20 active:bg-orange-500/30 disabled:opacity-60 transition-colors"
                          >
                            <ShoppingCart className="h-3 w-3" />
                            {addingToCart === p.id ? "…" : "Cart"}
                          </button>
                          <button
                            onClick={(e) => handleOrder(e, p.id)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary text-white text-[11px] font-semibold active:bg-orange-700 transition-colors"
                          >
                            <ArrowRight className="h-3 w-3" />
                            Order
                          </button>
                        </div>
                      )}
                    </div>
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

export default Search;
