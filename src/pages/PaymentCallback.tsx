import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { paymentApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { CheckCircle, XCircle, Clock, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

type State = "verifying" | "success" | "preorder-success" | "failed";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  const [state, setState]   = useState<State>("verifying");
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!reference) { setState("failed"); return; }

    let cancelled = false;

    const verify = async () => {
      try {
        const res = await paymentApi.verifyOrderPayment(reference);

        if (cancelled) return;

        if (res?.success) {
          // PaymentVerifyResponse has no isPreOrder field directly,
          // so we infer from the order status returned —
          // PreOrderService sets order to DEPOSIT_PAID on deposit success.
          const isDeposit =
            res?.orderStatus === "DEPOSIT_PAID" ||
            res?.isDeposit === true;

          if (res?.amount) setAmount(Number(res.amount));
          setState(isDeposit ? "preorder-success" : "success");
        } else {
          setState("failed");
        }
      } catch {
        if (!cancelled) setState("failed");
      }
    };

    verify();
    return () => { cancelled = true; };
  }, [reference]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-md text-center space-y-6">

        {/* ── Verifying ── */}
        {state === "verifying" && (
          <>
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full border-4 border-orange-200 border-t-primary animate-spin" />
            </div>
            <h1 className="text-xl font-bold">Verifying your payment…</h1>
            <p className="text-sm text-muted-foreground">Please wait, do not close this page.</p>
          </>
        )}

        {/* ── Normal order success ── */}
        {state === "success" && (
          <>
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Payment successful!</h1>
              {amount != null && (
                <p className="text-muted-foreground text-sm">
                  GHS {amount.toFixed(2)} received
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Your order has been confirmed. You'll receive a notification shortly.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/orders">
                <Button className="w-full gap-2 bg-primary hover:bg-orange-700 text-white font-semibold">
                  <Package className="h-4 w-4" />
                  View my orders
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">Continue shopping</Button>
              </Link>
            </div>
          </>
        )}

        {/* ── Pre-order deposit success ── */}
        {state === "preorder-success" && (
          <>
            <div className="flex justify-center">
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-purple-500" strokeWidth={1.5} />
                <Clock className="h-6 w-6 text-purple-300 absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Deposit confirmed!</h1>
              {amount != null && (
                <p className="text-muted-foreground text-sm">
                  GHS {amount.toFixed(2)} deposit received
                </p>
              )}
            </div>

            <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 text-left space-y-2">
              <p className="text-sm font-semibold text-purple-800">What happens next?</p>
              <ol className="space-y-1.5 text-xs text-purple-700 list-none">
                <li className="flex items-start gap-2">
                  <span className="shrink-0 h-4 w-4 rounded-full bg-purple-200 text-purple-800 font-bold text-[10px] flex items-center justify-center mt-0.5">1</span>
                  We'll notify you when your item is in stock and ready.
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 h-4 w-4 rounded-full bg-purple-200 text-purple-800 font-bold text-[10px] flex items-center justify-center mt-0.5">2</span>
                  You'll request delivery from your Orders page.
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 h-4 w-4 rounded-full bg-purple-200 text-purple-800 font-bold text-[10px] flex items-center justify-center mt-0.5">3</span>
                  Pay the remaining balance to complete your order.
                </li>
              </ol>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link to="/orders?tab=pre-orders">
                <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                  <Package className="h-4 w-4" />
                  Track my pre-order
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">Continue shopping</Button>
              </Link>
            </div>
          </>
        )}

        {/* ── Failed ── */}
        {state === "failed" && (
          <>
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-red-400" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Payment failed</h1>
              <p className="text-muted-foreground text-sm">
                Your payment could not be verified.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Don't worry — your order is saved. You can retry payment from your Orders page.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/orders">
                <Button className="w-full gap-2 bg-primary hover:bg-orange-700 text-white font-semibold">
                  <Package className="h-4 w-4" />
                  Go to my orders
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">Back to home</Button>
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default PaymentCallback;
