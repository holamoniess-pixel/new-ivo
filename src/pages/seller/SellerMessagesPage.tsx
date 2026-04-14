import { useEffect, useRef, useState } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { chatApi } from "@/lib/api";
import { MessageSquare, Send, ShoppingBag, Tag, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Parse PRODUCT_CARD:: prefix into structured data ─────────────────────────
// Format: PRODUCT_CARD::name::price::description::imageUrl
function parseProductCard(content: string) {
  if (!content?.startsWith("PRODUCT_CARD::")) return null;
  const parts = content.replace("PRODUCT_CARD::", "").split("::");
  return {
    name:        parts[0] || "",
    price:       parts[1] || "",
    description: parts[2] || "",
    imageUrl:    parts[3] || "",
  };
}

// ─── Product Card bubble ──────────────────────────────────────────────────────
const ProductCard = ({ content }: { content: string }) => {
  const card = parseProductCard(content);
  if (!card) return null;

  return (
    <div className="flex justify-start my-2">
      <div className="w-64 rounded-2xl overflow-hidden border border-border bg-background shadow-sm">
        {card.imageUrl && (
          <div className="aspect-[4/3] w-full overflow-hidden bg-muted/30">
            <img
              src={card.imageUrl}
              alt={card.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-3 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-foreground leading-tight">{card.name}</p>
            <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">
              <Tag className="h-3 w-3" />
              {card.price}
            </span>
          </div>
          {card.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
          )}
          <div className="flex items-center gap-1 pt-0.5">
            <ShoppingBag className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Product enquiry</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Conversation list item ───────────────────────────────────────────────────
const ConversationItem = ({
  conv,
  isSelected,
  onClick,
}: {
  conv: any;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const lastMsg = conv.lastMessage || "";
  const isProductCard = lastMsg.startsWith("PRODUCT_CARD::");
  const preview = isProductCard
    ? `🛍 ${parseProductCard(lastMsg)?.name ?? "Product enquiry"}`
    : lastMsg || "New conversation";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 border-b border-border hover:bg-muted/40 transition ${
        isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">
            {conv.customerName || conv.buyerName || conv.userName || "Customer"}
          </p>
          {conv.productName && (
            <p className="text-xs text-primary truncate font-medium">Re: {conv.productName}</p>
          )}
          <p className="text-xs text-muted-foreground truncate mt-0.5">{preview}</p>
        </div>
        {conv.unreadCount > 0 && (
          <span className="shrink-0 inline-flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-semibold">
            {conv.unreadCount}
          </span>
        )}
      </div>
    </button>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const SellerMessagesPage = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected]           = useState<any>(null);
  const [history, setHistory]             = useState<any[]>([]);
  const [reply, setReply]                 = useState("");
  const [sending, setSending]             = useState(false);
  const bottomRef                         = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatApi.getSellerInbox()
      .then(c => setConversations(c || []))
      .catch(() => {});
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const openChat = async (conv: any) => {
    setSelected(conv);
    setHistory([]);
    try {
      const h = await chatApi.getHistory(conv.id);
      setHistory(h?.messages || h || []);
      chatApi.markAsRead(conv.id).catch(() => {});
    } catch {
      setHistory([]);
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected || sending) return;
    setSending(true);
    try {
      const msg = await chatApi.sellerReply(selected.id, reply.trim());
      setHistory(prev => [...prev, msg]);
      setReply("");
    } catch {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <SellerLayout title="Messages" subtitle="Chat with your customers">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-10rem)]">

        {/* ── Conversation list ── */}
        <div className="rounded-xl bg-card border border-border overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
            </div>
          ) : conversations.map((c: any) => (
            <ConversationItem
              key={c.conversationId || c.id}
              conv={{ ...c, id: c.conversationId || c.id }}
              isSelected={selected?.id === (c.conversationId || c.id)}
              onClick={() => openChat({ ...c, id: c.conversationId || c.id })}
            />
          ))}
        </div>

        {/* ── Chat area ── */}
        <div className="md:col-span-2 rounded-xl bg-card border border-border flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <MessageSquare className="h-12 w-12 opacity-20" />
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <Store className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {selected.customerName || selected.buyerName || selected.userName || "Customer"}
                  </p>
                  {selected.productName && (
                    <p className="text-xs text-muted-foreground truncate">
                      Re: {selected.productName}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {history.map((m: any, i: number) => {
                  const isProductCard = m.content?.startsWith("PRODUCT_CARD::");

                  if (isProductCard) {
                    return <ProductCard key={m.id ?? i} content={m.content} />;
                  }

                  const isSeller = m.senderType === "SELLER";
                  return (
                    <div key={m.id ?? i} className={`flex ${isSeller ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isSeller
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border flex gap-2 shrink-0">
                <Input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Type a reply..."
                  className="flex-1 rounded-xl"
                  disabled={sending}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendReply()}
                />
                <Button
                  size="icon"
                  className="rounded-xl shrink-0"
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerMessagesPage;