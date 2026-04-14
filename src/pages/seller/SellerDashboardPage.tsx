import { useEffect, useState } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { sellerProductApi, orderApi } from "@/lib/api";
import { Package, ShoppingCart, TrendingUp, AlertTriangle, DollarSign, Eye, ArrowUpRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ── Field resolvers ───────────────────────────────────────────────────────────
const getProductStatus = (p: any): string => p.productStatus ?? p.status ?? "UNKNOWN";
const getOrderStatus   = (o: any): string => o.status ?? o.orderStatus ?? "UNKNOWN";
const getOrderTotal    = (o: any): number => o.totalAmount ?? o.total ?? o.orderTotal ?? 0;

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    "#10b981",
  INACTIVE:  "#94a3b8",
  DRAFT:     "#f59e0b",
  PENDING:   "#f59e0b",
  CONFIRMED: "#3b82f6",
  SHIPPED:   "#8b5cf6",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
  UNKNOWN:   "#94a3b8",
};
const CHART_COLORS = ["#E6640A", "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"];

// ── Build last-7-day revenue buckets ─────────────────────────────────────────
const buildDailyRevenue = (orders: any[]) => {
  const days: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    days[key] = 0;
  }
  orders.forEach(o => {
    const date = o.createdAt ?? o.orderDate;
    if (!date) return;
    const key = new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    if (key in days) days[key] += getOrderTotal(o);
  });
  return Object.entries(days).map(([day, revenue]) => ({ day, revenue }));
};

// ── Custom tooltips ───────────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-bold">GHS {Number(payload[0].value).toFixed(2)}</p>
    </div>
  );
};

const OrderTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold capitalize">{String(label).toLowerCase()}</p>
      <p className="text-muted-foreground">{payload[0].value} order{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, bg, sub }: {
  label: string; value: any; icon: any; bg: string; sub?: string;
}) => (
  <div className="rounded-2xl bg-card border border-border p-4 flex flex-col gap-3">
    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${bg}`}>
      <Icon className="h-4 w-4 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground opacity-70 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const SellerDashboardPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [orders,   setOrders]   = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [prods, ords, low] = await Promise.all([
          sellerProductApi.getMyProducts().catch(() => []),
          orderApi.getSellerOrders().catch(() => []),
          sellerProductApi.getLowStock(5).catch(() => []),
        ]);
        setProducts(Array.isArray(prods) ? prods : prods?.products ?? prods?.content ?? []);
        setOrders(Array.isArray(ords)   ? ords  : ords?.orders   ?? ords?.content  ?? []);
        setLowStock(Array.isArray(low)  ? low   : low?.products  ?? low?.content   ?? []);
      } finally { setLoading(false); }
    })();
  }, []);

  // ── Analytics ─────────────────────────────────────────────────────────────
  const totalProducts  = products.length;
  const activeProducts = products.filter(p => getProductStatus(p) === "ACTIVE").length;
  const totalOrders    = orders.length;
  const totalRevenue   = orders.reduce((s, o) => s + getOrderTotal(o), 0);
  const totalViews     = products.reduce((s, p) => s + (p.viewsCount ?? p.views ?? 0), 0);

  const dailyRevenue = buildDailyRevenue(orders);
  const hasRevenue   = dailyRevenue.some(d => d.revenue > 0);

  const orderStatusCounts: Record<string, number> = {};
  orders.forEach(o => {
    const s = getOrderStatus(o);
    orderStatusCounts[s] = (orderStatusCounts[s] || 0) + 1;
  });
  const barData = Object.entries(orderStatusCounts).map(([name, count]) => ({ name, count }));

  const productStatusCounts: Record<string, number> = {};
  products.forEach(p => {
    const s = getProductStatus(p);
    productStatusCounts[s] = (productStatusCounts[s] || 0) + 1;
  });
  const pieData = Object.entries(productStatusCounts).map(([name, value], i) => ({
    name, value, fill: STATUS_COLORS[name] ?? CHART_COLORS[i % CHART_COLORS.length],
  }));

  const topProducts = [...products]
    .sort((a, b) => (b.viewsCount ?? 0) - (a.viewsCount ?? 0))
    .slice(0, 5);
  const maxViews = Math.max(...topProducts.map(p => p.viewsCount ?? 0), 1);

  return (
    <SellerLayout title="Dashboard" subtitle="Overview of your store performance">

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Products" value={loading ? "—" : totalProducts}
          icon={Package} bg="bg-orange-500"
          sub={`${activeProducts} active`}
        />
        <StatCard
          label="Active Products" value={loading ? "—" : activeProducts}
          icon={TrendingUp} bg="bg-emerald-500"
          sub={totalProducts > 0 ? `${Math.round((activeProducts / totalProducts) * 100)}% of total` : undefined}
        />
        <StatCard
          label="Total Orders" value={loading ? "—" : totalOrders}
          icon={ShoppingCart} bg="bg-blue-500"
        />
        <StatCard
          label="Product Views" value={loading ? "—" : totalViews}
          icon={Eye} bg="bg-violet-500"
        />
      </div>

      {/* ── Revenue hero with area chart ── */}
      <div className="rounded-2xl bg-card border border-border p-5 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Estimated Revenue</p>
            <p className="text-4xl font-bold tracking-tight">
              {loading ? "—" : `GHS ${totalRevenue.toFixed(2)}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="h-[150px]">
          {hasRevenue ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyRevenue} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#E6640A" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#E6640A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone" dataKey="revenue"
                  stroke="#E6640A" strokeWidth={2.5}
                  fill="url(#revGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#E6640A", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Revenue chart will populate as orders come in
            </div>
          )}
        </div>
      </div>

      {/* ── Orders + Products charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Orders by status — coloured bar chart */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Orders by Status</h3>
            <span className="text-xs text-muted-foreground">{totalOrders} total</span>
          </div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -28, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" vertical={false} />
                <XAxis
                  dataKey="name" tick={{ fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => v.charAt(0) + v.slice(1).toLowerCase()}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<OrderTooltip />} cursor={{ fill: "hsl(220,13%,96%)" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={52}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] ?? CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">No orders yet</div>
          )}
        </div>

        {/* Products by status — donut + legend */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Products by Status</h3>
            <span className="text-xs text-muted-foreground">{totalProducts} total</span>
          </div>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-2">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%"
                    innerRadius={58} outerRadius={88}
                    dataKey="value" paddingAngle={3} strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [v, String(n).charAt(0) + String(n).slice(1).toLowerCase()]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5">
                {pieData.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: entry.fill }} />
                      <span className="text-xs capitalize text-foreground">
                        {entry.name.charAt(0) + entry.name.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <span className="text-xs font-bold tabular-nums">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">No products yet</div>
          )}
        </div>
      </div>

      {/* ── Top products by views ── */}
      {topProducts.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Top Products by Views</h3>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {topProducts.map((p: any, i: number) => {
              const views = p.viewsCount ?? p.views ?? 0;
              const pct   = Math.round((views / maxViews) * 100);
              const img   = p.primaryImageUrl ?? p.imageUrl ?? null;
              return (
                <div key={p.id ?? i} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4 shrink-0 tabular-nums text-right">{i + 1}</span>
                  <div className="h-8 w-8 rounded-lg overflow-hidden bg-secondary/50 border border-border shrink-0">
                    {img
                      ? <img src={img} alt={p.name} className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-3.5 w-3.5 text-muted-foreground/40" />
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium truncate">{p.name ?? p.productName}</p>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">{views}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Low stock ── */}
      {!loading && lowStock.length > 0 && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-5">
          <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Low Stock Alert
          </h3>
          <div className="space-y-2">
            {lowStock.slice(0, 5).map((p: any) => (
              <div key={p.id ?? p.productId} className="flex items-center justify-between text-sm">
                <span className="text-red-800">{p.name ?? p.productName ?? "Product"}</span>
                <span className="font-semibold text-red-600 tabular-nums">
                  {p.stock ?? p.stockQuantity ?? 0} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </SellerLayout>
  );
};

export default SellerDashboardPage;