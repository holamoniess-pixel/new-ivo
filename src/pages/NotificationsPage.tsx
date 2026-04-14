import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CheckCheck, Package, CreditCard, MessageCircle,
  ShoppingCart, AlertCircle, Star, Clock, ChevronLeft,
  Loader2, ShoppingBag, Truck, XCircle, CheckCircle2,
  RefreshCw, Inbox,
} from "lucide-react";
import { notificationApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { formatDistanceToNow } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  ORDER_CONFIRMED:           { icon: CheckCircle2,  bg: "#F0FDF4", color: "#16A34A" },
  ORDER_CANCELLED:           { icon: XCircle,       bg: "#FEF2F2", color: "#DC2626" },
  ORDER_STATUS_CHANGED:      { icon: RefreshCw,     bg: "#EFF6FF", color: "#2563EB" },
  ORDER_UPDATE:              { icon: Package,       bg: "#FFF7ED", color: "#EA580C" },
  PAYMENT_FAILED:            { icon: CreditCard,    bg: "#FEF2F2", color: "#DC2626" },
  NEW_MESSAGE:               { icon: MessageCircle, bg: "#EFF6FF", color: "#2563EB" },
  CART_UPDATED:              { icon: ShoppingCart,  bg: "#FFF7ED", color: "#E6640A" },
  PRODUCT_REQUEST_SUBMITTED: { icon: Star,          bg: "#FDF4FF", color: "#9333EA" },
  PRODUCT_REQUEST_VIEWED:    { icon: Clock,         bg: "#F0F9FF", color: "#0284C7" },
  PRODUCT_REQUEST_APPROVED:  { icon: CheckCircle2,  bg: "#F0FDF4", color: "#16A34A" },
  PRODUCT_REQUEST_REJECTED:  { icon: AlertCircle,   bg: "#FEF2F2", color: "#DC2626" },
  NEW_PRODUCT_ADDED:         { icon: ShoppingBag,   bg: "#FFF7ED", color: "#E6640A" },
  DELIVERY_UPDATE:           { icon: Truck,         bg: "#EFF6FF", color: "#2563EB" },
  DEFAULT:                   { icon: Bell,          bg: "#FFF7ED", color: "#E6640A" },
};

function getMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META.DEFAULT;
}

function timeAgo(dateStr: string) {
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); }
  catch { return ""; }
}

// ─── Notification Item ────────────────────────────────────────────────────────

function NotifItem({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const meta = getMeta(notif.type);
  const Icon = meta.icon;

  return (
    <div
      onClick={() => !notif.isRead && onRead(notif.id)}
      className={`group relative flex gap-3.5 p-4 rounded-2xl cursor-pointer border transition-all duration-200 ${
        notif.isRead
          ? "bg-card border-border/50 hover:border-border hover:shadow-sm"
          : "bg-orange-50/60 border-orange-200/60 hover:border-orange-300 hover:shadow-md"
      }`}
    >
      {/* Unread indicator */}
      {!notif.isRead && (
        <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary shadow-sm shadow-orange-400/40" />
      )}

      {/* Icon */}
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: meta.bg }}
      >
        <Icon className="h-4.5 w-4.5" style={{ color: meta.color, height: "1.1rem", width: "1.1rem" }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <p
          className={`text-sm leading-snug mb-0.5 ${notif.isRead ? "font-medium text-foreground" : "font-semibold text-foreground"} font-ui`}
        >
          {notif.title}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-inter">
          {notif.message}
        </p>
        <p className="text-[10px] mt-1.5 font-medium text-primary" style={{ opacity: notif.isRead ? 0.6 : 0.9 }}>
          {timeAgo(notif.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const NotificationsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await notificationApi.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[Notifications] fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    return () => { (window as any).__refreshNotifBadge?.(); };
  }, []);

  const markOneRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try { await notificationApi.markAsRead(id); } catch { /* optimistic */ }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      (window as any).__refreshNotifBadge?.();
    } catch (err) {
      console.error("[Notifications] markAll failed:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const displayed = filter === "unread" ? notifications.filter(n => !n.isRead) : notifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isAuthenticated) { navigate("/login"); return null; }

  return (
    <div className="min-h-screen bg-background">
      {/* Standard app Navbar */}
      <Navbar />

      {/* Page header — sticky below Navbar */}
      <div className="sticky top-[57px] z-10 bg-background/95 backdrop-blur-md border-b border-border/60">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="h-8 w-8 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-foreground/70" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-foreground leading-none font-satoshi">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-xs mt-0.5 text-primary font-medium">{unreadCount} unread</p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-50 text-primary hover:bg-orange-100 transition-colors disabled:opacity-60 font-ui"
              >
                {markingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
                Mark all read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(["all", "unread"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all font-ui ${
                  filter === tab
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {tab === "all" ? `All (${notifications.length})` : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-24">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-orange-50 animate-pulse">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground font-inter">Loading notifications…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="h-20 w-20 rounded-3xl flex items-center justify-center bg-orange-50">
              <Inbox className="h-9 w-9 text-primary/50" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-foreground font-satoshi">
                {filter === "unread" ? "All caught up!" : "No notifications yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs font-inter">
                {filter === "unread"
                  ? "You've read everything — nice work."
                  : "We'll notify you about orders, messages, and updates."}
              </p>
            </div>
            {filter === "unread" && (
              <button
                onClick={() => setFilter("all")}
                className="text-xs font-semibold px-4 py-2 rounded-full bg-orange-50 text-primary hover:bg-orange-100 transition-colors font-ui"
              >
                View all notifications
              </button>
            )}
          </div>
        )}

        {/* Notification list */}
        {!loading && displayed.length > 0 && (
          <div className="flex flex-col gap-2">
            {/* Unread group label */}
            {filter === "all" && unreadCount > 0 && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1 pb-0.5 font-ui">
                New
              </p>
            )}
            {displayed
              .filter(n => filter === "unread" || !n.isRead)
              .map(notif => (
                <NotifItem key={notif.id} notif={notif} onRead={markOneRead} />
              ))}

            {/* Read group label */}
            {filter === "all" && notifications.some(n => n.isRead) && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 pt-3 pb-0.5 font-ui">
                Earlier
              </p>
            )}
            {filter === "all" && displayed
              .filter(n => n.isRead)
              .map(notif => (
                <NotifItem key={notif.id} notif={notif} onRead={markOneRead} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;