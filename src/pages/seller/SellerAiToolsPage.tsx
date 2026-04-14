import { useState, useEffect } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { aiApi, sellerProductApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sparkles, DollarSign, BarChart3, Eye, TrendingUp,
  Loader2, Copy, Check, Package, AlertTriangle,
  ShoppingBag, Star, RefreshCw, Lightbulb
} from "lucide-react";
import { toast } from "sonner";

// ── Markdown renderer ────────────────────────────────────────────────────────
const renderMarkdown = (text: string) => {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let key = 0;
  for (const line of lines) {
    const k = key++;
    if (line.startsWith("### ")) {
      elements.push(<h3 key={k} className="text-sm font-bold mt-4 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={k} className="text-base font-bold mt-4 mb-1">{line.slice(3)}</h2>);
    } else if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, "");
      elements.push(
        <div key={k} className="flex gap-2 my-0.5">
          <span className="text-primary font-semibold shrink-0">{line.match(/^\d+/)![0]}.</span>
          <span className="text-sm">{renderInline(content)}</span>
        </div>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={k} className="flex gap-2 my-0.5">
          <span className="text-primary mt-1.5 shrink-0">•</span>
          <span className="text-sm">{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={k} className="text-sm font-bold mt-2">{line.slice(2, -2)}</p>);
    } else if (line.trim() === "") {
      elements.push(<div key={k} className="h-2" />);
    } else {
      elements.push(<p key={k} className="text-sm leading-relaxed">{renderInline(line)}</p>);
    }
  }
  return elements;
};

const renderInline = (text: string): React.ReactNode =>
  text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });

// ── Smart response extractor ─────────────────────────────────────────────────
// Returns { text, json } — json is set if the response is structured data
const extractResult = (res: any): { text: string; json: any | null } => {
  if (!res) return { text: "", json: null };

  // If top-level IS the structured inventory object
  if (res.lowStockAlerts || res.overallHealthScore || res.topPerformers) {
    return { text: "", json: res };
  }

  const raw =
    res.reply ?? res.response ?? res.message ?? res.content ??
    res.result ?? res.text ?? null;

  if (raw && typeof raw === "string") {
    // Try to parse embedded JSON
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === "object") return { text: "", json: parsed };
    } catch {
      // not JSON — return as plain text
    }
    return { text: raw, json: null };
  }

  // Fallback: stringify the whole response but try JSON parse first
  const stringified = JSON.stringify(res, null, 2);
  try {
    return { text: "", json: res };
  } catch {
    return { text: stringified, json: null };
  }
};

// ── Inventory Dashboard renderer ─────────────────────────────────────────────
const InventoryDashboard = ({ data }: { data: any }) => {
  const healthColor: Record<string, string> = {
    excellent: "text-green-600 bg-green-50 border-green-200",
    good:      "text-blue-600 bg-blue-50 border-blue-200",
    fair:      "text-yellow-600 bg-yellow-50 border-yellow-200",
    poor:      "text-red-600 bg-red-50 border-red-200",
  };
  const score = (data.overallHealthScore ?? "").toLowerCase();
  const scoreClass = healthColor[score] || "text-muted-foreground bg-muted border-border";

  return (
    <div className="space-y-4">
      {/* Health score */}
      {data.overallHealthScore && (
        <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${scoreClass}`}>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-semibold">Overall Inventory Health</span>
          </div>
          <span className="text-sm font-bold capitalize">{data.overallHealthScore}</span>
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed">{data.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Low stock alerts */}
        {data.lowStockAlerts?.length > 0 && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Low Stock</span>
            </div>
            <ul className="space-y-1">
              {data.lowStockAlerts.map((item: string, i: number) => (
                <li key={i} className="text-sm text-yellow-800 flex items-start gap-1.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Out of stock */}
        {data.outOfStock?.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-700">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Out of Stock</span>
            </div>
            <ul className="space-y-1">
              {data.outOfStock.map((item: string, i: number) => (
                <li key={i} className="text-sm text-red-800 flex items-start gap-1.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top performers */}
        {data.topPerformers?.length > 0 && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-700">
              <Star className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Top Performers</span>
            </div>
            <ul className="space-y-1">
              {data.topPerformers.map((item: string, i: number) => (
                <li key={i} className="text-sm text-green-800 flex items-start gap-1.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Restock suggestions */}
        {data.restockSuggestions?.length > 0 && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-700">
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Restock Suggestions</span>
            </div>
            <ul className="space-y-1">
              {data.restockSuggestions.map((item: string, i: number) => (
                <li key={i} className="text-sm text-blue-800 flex items-start gap-1.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Trending opportunities */}
      {data.trendingOpportunities?.length > 0 && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-700">
            <Lightbulb className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Trending Opportunities</span>
          </div>
          <ul className="space-y-1.5">
            {data.trendingOpportunities.map((item: string, i: number) => (
              <li key={i} className="text-sm text-purple-800 flex items-start gap-1.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ── Generic JSON renderer for other structured responses ─────────────────────
const JsonResult = ({ data }: { data: any }) => (
  <div className="space-y-3">
    {Object.entries(data).map(([key, value]) => (
      <div key={key} className="rounded-lg border border-border bg-muted/20 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
          {key.replace(/([A-Z])/g, " $1").trim()}
        </p>
        {Array.isArray(value) ? (
          value.length === 0
            ? <p className="text-sm text-muted-foreground italic">None</p>
            : <ul className="space-y-0.5">
                {(value as string[]).map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-1.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
        ) : (
          <p className="text-sm">{String(value)}</p>
        )}
      </div>
    ))}
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
const SellerAiToolsPage = () => {
  const [activeTab, setActiveTab] = useState("listing");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<{ text: string; json: any | null } | null>(null);
  const [copied, setCopied]       = useState(false);

  const [listingName, setListingName]       = useState("");
  const [listingDetails, setListingDetails] = useState("");
  const [priceName, setPriceName]           = useState("");
  const [priceDetails, setPriceDetails]     = useState("");
  const [priceCondition, setPriceCondition] = useState("");

  const [products, setProducts]               = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    if (activeTab !== "visibility" || products.length > 0) return;
    const load = async () => {
      setLoadingProducts(true);
      try {
        const res = await sellerProductApi.getMyProducts();
        setProducts(Array.isArray(res) ? res : res?.products ?? res?.content ?? []);
      } catch {
        toast.error("Failed to load your products");
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, [activeTab]);

  const tools = [
    { id: "listing",    label: "Listing Generator",  icon: Sparkles,   desc: "AI-generated product descriptions" },
    { id: "price",      label: "Price Suggestion",   icon: DollarSign, desc: "Get AI-recommended pricing" },
    { id: "inventory",  label: "Inventory Analysis", icon: BarChart3,  desc: "Smart inventory insights" },
    { id: "visibility", label: "Improve Visibility", icon: Eye,        desc: "SEO & visibility tips for a product" },
    { id: "trends",     label: "Market Trends",      icon: TrendingUp, desc: "Current marketplace trends" },
  ];

  const run = async (fn: () => Promise<any>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fn();
      setResult(extractResult(res));
    } catch (err: any) {
      toast.error(err.message || "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = result?.text || (result?.json ? JSON.stringify(result.json, null, 2) : "");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SellerLayout title="AI Tools" subtitle="AI-powered tools to grow your business">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <div className="space-y-2">
          {tools.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setResult(null); }}
              className={`w-full text-left p-3 rounded-xl border transition flex items-center gap-3 ${
                activeTab === t.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <t.icon className={`h-5 w-5 shrink-0 ${activeTab === t.id ? "text-primary" : "text-muted-foreground"}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground truncate">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Main panel ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl bg-card border border-border p-5">

            {/* Listing */}
            {activeTab === "listing" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI Listing Generator</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Generate a professional product listing with AI.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Product Name</Label>
                  <Input value={listingName} onChange={e => setListingName(e.target.value)} placeholder="e.g. Wireless Bluetooth Headphones" />
                </div>
                <div className="space-y-1.5">
                  <Label>Basic Details</Label>
                  <Textarea value={listingDetails} onChange={e => setListingDetails(e.target.value)} placeholder="Key features, materials, specs..." rows={3} />
                </div>
                <Button onClick={() => run(() => aiApi.generateListing(listingName, listingDetails))} disabled={loading || !listingName}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />} Generate Listing
                </Button>
              </div>
            )}

            {/* Price */}
            {activeTab === "price" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Price Suggestion AI</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Get a recommended price based on market analysis.</p>
                </div>
                <div className="space-y-1.5"><Label>Product Name</Label><Input value={priceName} onChange={e => setPriceName(e.target.value)} placeholder="e.g. Nike Air Max 90" /></div>
                <div className="space-y-1.5"><Label>Product Details</Label><Textarea value={priceDetails} onChange={e => setPriceDetails(e.target.value)} placeholder="Size, condition, features..." rows={2} /></div>
                <div className="space-y-1.5">
                  <Label>Condition <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input value={priceCondition} onChange={e => setPriceCondition(e.target.value)} placeholder="New, Used, Refurbished" />
                </div>
                <Button onClick={() => run(() => aiApi.suggestPrice(priceName, priceDetails, priceCondition || undefined))} disabled={loading || !priceName}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <DollarSign className="h-4 w-4 mr-2" />} Get Price Suggestion
                </Button>
              </div>
            )}

            {/* Inventory */}
            {activeTab === "inventory" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Smart Inventory Analysis</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Get AI insights about your inventory performance and restocking recommendations.</p>
                </div>
                <Button onClick={() => run(() => aiApi.inventoryAnalysis())} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />} Analyze My Inventory
                </Button>
              </div>
            )}

            {/* Visibility */}
            {activeTab === "visibility" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /> Improve Product Visibility</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Select one of your products to get AI-powered SEO and visibility tips.</p>
                </div>

                {loadingProducts ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading your products...
                  </div>
                ) : products.length === 0 ? (
                  <div className="rounded-lg bg-muted/40 border border-border p-4 text-sm text-muted-foreground text-center">
                    No products found. Add some products first.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {products.map((p: any) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedProduct(p)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition text-left ${
                          selectedProduct?.id === p.id ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/40"
                        }`}
                      >
                        <div className="h-11 w-11 rounded-lg bg-secondary/50 overflow-hidden shrink-0 border border-border">
                          {p.primaryImageUrl ? (
                            <img src={p.primaryImageUrl} alt={p.name} className="h-full w-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                          <p className="text-xs text-muted-foreground">GHS {Number(p.price).toFixed(2)}{p.brand && ` · ${p.brand}`}</p>
                        </div>
                        <div className={`h-2.5 w-2.5 rounded-full shrink-0 border-2 transition-colors ${selectedProduct?.id === p.id ? "bg-primary border-primary" : "border-muted-foreground/30"}`} />
                      </button>
                    ))}
                  </div>
                )}

                {selectedProduct && (
                  <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-sm">Selected: <span className="font-medium">{selectedProduct.name}</span></span>
                  </div>
                )}

                <Button onClick={() => run(() => aiApi.improveVisibility(selectedProduct.id))} disabled={loading || !selectedProduct} className="w-full">
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analysing...</>
                    : <><Eye className="h-4 w-4 mr-2" /> Get Tips{selectedProduct ? ` for "${selectedProduct.name}"` : ""}</>
                  }
                </Button>
              </div>
            )}

            {/* Trends */}
            {activeTab === "trends" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Market Trends</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">See what's trending in the marketplace right now.</p>
                </div>
                <Button onClick={() => run(() => aiApi.getTrends())} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />} View Market Trends
                </Button>
              </div>
            )}
          </div>

          {/* Thinking indicator */}
          {loading && (
            <div className="rounded-xl bg-card border border-border p-6 flex items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}

          {/* Response */}
          {result && !loading && (
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI Response</span>
                </div>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="p-4">
                {result.json ? (
                  // Inventory gets its own dashboard; other JSON gets generic renderer
                  (result.json.lowStockAlerts || result.json.overallHealthScore)
                    ? <InventoryDashboard data={result.json} />
                    : <JsonResult data={result.json} />
                ) : (
                  <div className="space-y-0.5">{renderMarkdown(result.text)}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerAiToolsPage;