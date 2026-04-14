import { useEffect, useState } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { orderApi } from "@/lib/api";
import { Package, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const statusStyle: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED:   "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const SellerOrderCard = ({ o }: { o: any }) => {
  const [expanded, setExpanded] = useState(false);

  const orderId   = o.orderId    ?? o.id    ?? "";
  const status    = o.status     ?? "PENDING";
  const total     = o.totalAmount ?? o.total ?? o.orderTotal ?? 0;
  const address   = o.deliveryAddress ?? o.address ?? "";
  const createdAt = o.createdAt  ?? o.orderDate ?? "";
  const items: any[] = o.items   ?? o.orderItems ?? [];

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold font-mono">#{orderId.slice(0, 8).toUpperCase()}</p>
            {formattedDate && <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>}
            {o.customerName && <p className="text-xs text-muted-foreground">👤 {o.customerName}</p>}
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[status] ?? "bg-muted text-muted-foreground"}`}>
            {status}
          </span>
        </div>

        {address && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{address}</span>
          </div>
        )}

        {/* Thumbnail strip */}
        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {items.slice(0, 3).map((item: any, i: number) => {
                const img = item.primaryImageUrl ?? item.productImageUrl ?? item.imageUrl ?? item.product?.primaryImageUrl ?? null;
                return (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-lg border-2 border-background overflow-hidden bg-secondary/50 shrink-0"
                    style={{ zIndex: 3 - i }}
                  >
                    {img ? (
                      <img src={img} alt={item.productName ?? ""} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <span className="text-xs text-muted-foreground">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-bold">GHS {Number(total).toFixed(2)}</span>
          {items.length > 0 && (
            <button
              onClick={() => setExpanded(p => !p)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {expanded ? "Hide" : "View"} items
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded item list */}
      {expanded && items.length > 0 && (
        <div className="border-t border-border divide-y divide-border">
          {items.map((item: any, i: number) => {
            const img      = item.primaryImageUrl ?? item.productImageUrl ?? item.imageUrl ?? item.product?.primaryImageUrl ?? null;
            const name     = item.productName ?? item.name ?? item.product?.name ?? "Product";
            const brand    = item.brand ?? item.product?.brand ?? null;
            const qty      = item.quantity ?? 1;
            const price    = item.unitPrice ?? item.price ?? item.product?.price ?? 0;
            const subtotal = item.subTotal  ?? item.subtotal ?? (price * qty);
            const pid      = item.productId ?? item.product?.id ?? null;

            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-secondary/50 border border-border">
                  {img ? (
                    <img src={img} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {pid ? (
                    <Link to={`/products/${pid}`} className="text-sm font-medium hover:text-primary line-clamp-1">
                      {name}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium line-clamp-1">{name}</p>
                  )}
                  {brand && <p className="text-xs text-muted-foreground">{brand}</p>}
                  <p className="text-xs text-muted-foreground">
                    GHS {Number(price).toFixed(2)} × {qty}
                  </p>
                </div>
                <p className="text-sm font-bold shrink-0">GHS {Number(subtotal).toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SellerOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getSellerOrders()
      .then(data => setOrders(Array.isArray(data) ? data : data?.orders ?? data?.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SellerLayout
      title="Orders"
      subtitle={`${orders.length} order${orders.length !== 1 ? "s" : ""}`}
    >
      {loading ? null : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <SellerOrderCard key={o.orderId ?? o.id} o={o} />
          ))}
        </div>
      )}
    </SellerLayout>
  );
};

export default SellerOrdersPage;