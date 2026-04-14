import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cartApi, orderApi, paymentApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import CartSkeleton from "@/components/CartSkeleton";
import { toast } from "sonner";

// CartResponse fields (CartService.getCart):
//   items: CartItemResponse[], cartTotal, discountedTotal, totalItems
//
// CartItemResponse fields:
//   cartItemId, productId, productName, brand, primaryImageUrl,
//   unitPrice, isDiscounted, originalPrice, quantity, subTotal,
//   stock, stockStatus, addedAt
//
// Checkout flow:
//   1. orderApi.initiate()                 → OrderInitResponse { orderId, total, chargeAmount, isPreOrder }
//   2. paymentApi.initializeOrderPayment() → PaymentInitResponse { authorizationUrl, … }
//   3. window.location.href = authorizationUrl

// ── Normalise cart so all numeric/boolean fields are always correctly typed ───
function normaliseCart(data: any) {
  if (!data) return data;
  return {
    ...data,
    cartTotal:       data.cartTotal       != null ? Number(data.cartTotal)       : 0,
    discountedTotal: data.discountedTotal != null ? Number(data.discountedTotal) : 0,
    items: Array.isArray(data.items)
      ? data.items.map((item: any) => ({
          ...item,
          isDiscounted:  item.isDiscounted  ?? item.discounted ?? false,
          unitPrice:     item.unitPrice     != null ? Number(item.unitPrice)     : 0,
          originalPrice: item.originalPrice != null ? Number(item.originalPrice) : undefined,
          subTotal:      item.subTotal      != null ? Number(item.subTotal)      : 0,
          stockStatus:   item.stockStatus   ?? "IN_STOCK",
        }))
      : [],
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isPreOrderItem(item: any) {
  return item.stockStatus === "PRE_ORDER" || item.stockStatus === "COMING_SOON";
}
function cartHasPreOrder(items: any[]) {
  return items.some(isPreOrderItem);
}

const Cart = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart]                       = useState<any>(null);
  const [loading, setLoading]                 = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes]                     = useState("");
  const [showCheckout, setShowCheckout]       = useState(false);

  const fetchCart = async () => {
    try {
      const data = await cartApi.get();
      setCart(normaliseCart(data));
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { navigate("/login"); return; }
    fetchCart();
  }, [isAuthenticated, isLoading]);

  const updateQty = async (cartItemId: string, qty: number) => {
    try {
      const updated = await cartApi.updateQuantity(cartItemId, qty);
      setCart(normaliseCart(updated));
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      const updated = await cartApi.remove(cartItemId);
      setCart(normaliseCart(updated));
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }
    setCheckoutLoading(true);
    try {
      const order = await orderApi.initiate({
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim() || undefined,
      });

      if (!order?.orderId) {
        toast.error("Failed to create order. Please try again.");
        return;
      }

      const payment = await paymentApi.initializeOrderPayment(order.orderId);

      const url = payment?.authorizationUrl;
      if (!url) {
        toast.error("Could not retrieve payment link. Please try again.");
        return;
      }

      window.location.href = url;

    } catch (err: any) {
      toast.error(err?.message ?? "Checkout failed. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (isLoading || loading) return <CartSkeleton />;

  const items: any[]    = cart?.items ?? [];
  const cartTotal       = Number(cart?.cartTotal ?? 0);
  const discountedTotal = Number(cart?.discountedTotal ?? 0);
  const totalItems      = cart?.totalItems ?? 0;

  // Actual price the user will pay (after discounts)
  const displayTotal = discountedTotal > 0 && discountedTotal < cartTotal
    ? discountedTotal
    : cartTotal;

  const hasDiscounts = discountedTotal > 0 && discountedTotal < cartTotal;

  // Pre-order deposit — exactly 50% of displayTotal, rounded to 2dp
  const isPreOrder      = cartHasPreOrder(items);
  const depositAmount   = isPreOrder
    ? Math.round((displayTotal / 2) * 100) / 100
    : null;
  const remainingAmount = isPreOrder && depositAmount != null
    ? Math.round((displayTotal - depositAmount) * 100) / 100
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-3xl">

        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
        <h1 className="font-satoshi text-2xl font-bold mb-6">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Link to="/"><Button>Start Shopping</Button></Link>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Cart items ──────────────────────────────────────────────── */}
            <div className="space-y-3">
              {items.map((item: any) => {
                const itemIsPreOrder = isPreOrderItem(item);
                return (
                  <div
                    key={item.cartItemId}
                    className={`flex gap-4 rounded-xl bg-card border p-4 ${
                      itemIsPreOrder ? "border-purple-200" : "border-border"
                    }`}
                  >
                    {/* Product image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary/50 border border-border">
                      {item.primaryImageUrl ? (
                        <img
                          src={item.primaryImageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                          onError={e => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ShoppingBag className="h-7 w-7 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* PRE-ORDER badge on image */}
                      {itemIsPreOrder && (
                        <div className="absolute bottom-0 left-0 right-0 bg-purple-600/90 text-white text-[9px] font-bold text-center py-0.5 tracking-wide">
                          PRE-ORDER
                        </div>
                      )}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.productId}`}
                        className="text-sm font-semibold hover:text-primary line-clamp-1"
                      >
                        {item.productName}
                      </Link>

                      {item.brand && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.brand}</p>
                      )}

                      {/* Unit price */}
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <p className="text-xs font-medium text-primary">
                          GHS {Number(item.unitPrice).toFixed(2)} each
                        </p>
                        {item.isDiscounted && item.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            GHS {Number(item.originalPrice).toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Item subtotal */}
                      <p className="text-sm font-bold text-foreground mt-1">
                        GHS {Number(item.subTotal).toFixed(2)}
                      </p>

                      {/* Deposit hint per item */}
                      {itemIsPreOrder && (
                        <p className="text-xs text-purple-600 mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          Deposit due now: GHS {(Number(item.subTotal) / 2).toFixed(2)}
                        </p>
                      )}

                      {/* Qty controls + remove */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center rounded-md border border-border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQty(item.cartItemId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-7 text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQty(item.cartItemId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.cartItemId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Pre-order info banner ───────────────────────────────────── */}
            {isPreOrder && (
              <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 space-y-1">
                <div className="flex items-center gap-2 text-purple-800 font-semibold text-sm">
                  <Info className="h-4 w-4 shrink-0" />
                  Your cart contains a pre-order item
                </div>
                <p className="text-xs text-purple-700 leading-relaxed">
                  Pre-order and coming-soon products require a{" "}
                  <strong>50% deposit</strong> today. The remaining balance is
                  collected once your item is ready for delivery.
                </p>
              </div>
            )}

            {/* ── Order summary + checkout ────────────────────────────────── */}
            <div className="rounded-xl bg-card border border-border p-4 space-y-3">

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
              </div>

              {/* Discount rows */}
              {hasDiscounts && (
                <>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal (before discounts)</span>
                    <span className="line-through">GHS {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>You save</span>
                    <span>GHS {(cartTotal - discountedTotal).toFixed(2)}</span>
                  </div>
                </>
              )}

              {/* Order total (always shown) */}
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <span className="text-muted-foreground">Order total</span>
                <div className="text-right">
                  <span className="font-semibold">GHS {displayTotal.toFixed(2)}</span>
                  {hasDiscounts && (
                    <p className="text-xs text-green-600">Discounts applied ✓</p>
                  )}
                </div>
              </div>

              {/* ── PRE-ORDER: deposit breakdown ─────────────────────────── */}
              {isPreOrder && depositAmount != null && remainingAmount != null && (
                <>
                  <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 space-y-2">
                    <p className="text-[11px] font-semibold text-purple-800 uppercase tracking-wide">
                      Payment breakdown
                    </p>
                    <div className="flex justify-between text-sm text-purple-700">
                      <span>Deposit due now (50%)</span>
                      <span className="font-bold text-purple-900">
                        GHS {depositAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-purple-600">
                      <span>Remaining balance (paid later)</span>
                      <span>GHS {remainingAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* What they actually pay today */}
                  <div className="flex justify-between items-baseline text-lg font-bold pt-1">
                    <span>You pay today</span>
                    <span className="text-purple-700">GHS {depositAmount.toFixed(2)}</span>
                  </div>
                </>
              )}

              {/* ── NORMAL ORDER: single total ───────────────────────────── */}
              {!isPreOrder && (
                <div className="flex justify-between items-baseline text-lg font-bold border-t border-border pt-3">
                  <span>Total</span>
                  <span>GHS {displayTotal.toFixed(2)}</span>
                </div>
              )}

              {/* ── Checkout CTA / form ──────────────────────────────────── */}
              {!showCheckout ? (
                <Button
                  className="w-full bg-primary hover:bg-orange-700 text-white font-semibold"
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
                </Button>
              ) : (
                <div className="space-y-3 pt-2">
                  <Input
                    placeholder="Delivery address *"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                  />
                  <Textarea
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                  />

                  {/* Contextual payment reminder */}
                  <div
                    className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      isPreOrder
                        ? "bg-purple-50 border border-purple-200 text-purple-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isPreOrder
                      ? `You'll be charged a deposit of GHS ${depositAmount?.toFixed(2)} on Paystack now. The remaining GHS ${remainingAmount?.toFixed(2)} will be due when your item is available.`
                      : "You'll be redirected to Paystack to complete your payment securely."
                    }
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCheckout(false)}
                      disabled={checkoutLoading}
                    >
                      Back
                    </Button>
                    <Button
                      className={`flex-1 gap-2 text-white font-semibold ${
                        isPreOrder
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-primary hover:bg-orange-700"
                      }`}
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                    >
                      <CreditCard className="h-4 w-4" />
                      {checkoutLoading
                        ? "Processing…"
                        : isPreOrder
                          ? `Pay deposit · GHS ${depositAmount?.toFixed(2)}`
                          : `Pay · GHS ${displayTotal.toFixed(2)}`
                      }
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
