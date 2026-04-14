import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { chatApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import MessageSkeleton from "@/components/MessageSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, ShoppingBag, Tag, Package } from "lucide-react";
import { toast } from "sonner";

// ─── Parse PRODUCT_CARD:: content into structured data ────────────────────────
function parseProductCard(content: string) {
  if (!content?.startsWith("PRODUCT_CARD::")) return null;
  const parts = content.replace("PRODUCT_CARD::", "").split("::");
  return {
    name:        parts[0] ?? "",
    price:       parts[1] ?? "",
    description: parts[2] ?? "",
    imageUrl:    parts[3] ?? "",
  };
}

// ─── Product Card bubble ──────────────────────────────────────────────────────
const ProductCard = ({ content }: { content: string }) => {
  const card = parseProductCard(content);
  if (!card) return null;

  return (
    <div className="flex justify-center my-2">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-border bg-card shadow-md">
        {card.imageUrl && (
          <div className="aspect-[4/3] w-full overflow-hidden bg-secondary/30">
            <img src={card.imageUrl} alt={card.name} className="h-full w-full object-cover" />
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
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {card.description}
            </p>
          )}
          <div className="flex items-center gap-1 pt-1">
            <ShoppingBag className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Product enquiry</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── System / automated message bubble ───────────────────────────────────────
const SystemMessage = ({ content }: { content: string }) => (
  <div className="flex justify-center my-1">
    <div className="max-w-[85%] rounded-xl bg-muted/60 border border-border px-4 py-2.5 text-xs text-muted-foreground text-center whitespace-pre-wrap leading-relaxed">
      {content}
    </div>
  </div>
);

// ─── Conversation list item ───────────────────────────────────────────────────
const ConversationItem = ({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: any;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const lastMsg = conversation.lastMessage ?? "";
  const isProductCard = lastMsg.startsWith("PRODUCT_CARD::");
  const preview = isProductCard
    ? `🛍 ${parseProductCard(lastMsg)?.name ?? "Product enquiry"}`
    : lastMsg || "New conversation";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-border/60 transition-colors hover:bg-secondary/40 ${
        isSelected ? "bg-secondary" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate text-foreground">
            {conversation.storeName || conversation.customerName || "Conversation"}
          </p>
          {conversation.productName && (
            <p className="text-xs text-primary/80 truncate">Re: {conversation.productName}</p>
          )}
          <p className="text-xs text-muted-foreground truncate mt-0.5">{preview}</p>
        </div>
        {conversation.unreadCount > 0 && (
          <span className="shrink-0 inline-flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-semibold">
            {conversation.unreadCount}
          </span>
        )}
      </div>
    </button>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Messages = () => {
  const { isAuthenticated, isSeller } = useAuth();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected]           = useState<string | null>(null);
  const [messages, setMessages]           = useState<any[]>([]);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(true);
  const [sending, setSending]             = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Load conversations ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchConversations = isSeller
      ? chatApi.getSellerConversations()
      : chatApi.getUserConversations();

    fetchConversations
      .then(data => setConversations(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load conversations"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isSeller]);

  // ── Auto-select conversation from URL ?conversation=<id> ─────────────────
  useEffect(() => {
    const convId = searchParams.get("conversation");
    if (convId) selectConversation(convId);
  }, [searchParams]);

  // ── Scroll to bottom on new messages ─────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Select and load a conversation's history ──────────────────────────────
  const selectConversation = async (id: string) => {
    setSelected(id);
    setMessages([]);
    try {
      const history = await chatApi.getChatHistory(id);
      setMessages(Array.isArray(history?.messages) ? history.messages : []);

      const senderTypeToMark: "USER" | "SELLER" = isSeller ? "USER" : "SELLER";
      chatApi.markAsRead(id, senderTypeToMark).catch(() => {});
    } catch {
      toast.error("Failed to load messages");
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    try {
      const msg = isSeller
        ? await chatApi.sellerSendMessage(selected, input.trim())
        : await chatApi.userSendMessage(selected, input.trim());

      setMessages(prev => [...prev, msg]);
      setInput("");

      setConversations(prev =>
        prev.map(c =>
          c.id === selected
            ? { ...c, lastMessage: input.trim(), lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const selectedConversation = conversations.find(c => c.id === selected);

  if (loading) return <MessageSkeleton />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <h1 className="font-satoshi text-2xl font-bold mb-4">Messages</h1>

        <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-160px)] max-h-[700px]">

          {/* ── Conversation list ───────────────────────────── */}
          <div className="rounded-xl bg-card border border-border shadow-sm overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-4">
                <MessageCircle className="h-10 w-10 opacity-20" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map((c: any) => (
                <ConversationItem
                  key={c.id}
                  conversation={c}
                  isSelected={selected === c.id}
                  onClick={() => selectConversation(c.id)}
                />
              ))
            )}
          </div>

          {/* ── Chat area ───────────────────────────────────── */}
          <div className="md:col-span-2 rounded-xl bg-card border border-border shadow-sm flex flex-col overflow-hidden">

            {/* Header */}
            {selectedConversation && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  {selectedConversation.chatType === "ORDER_SUPPORT" ? (
                    <Package className="h-4 w-4 text-primary" />
                  ) : (
                    <ShoppingBag className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedConversation.storeName || selectedConversation.customerName}
                  </p>
                  {selectedConversation.productName && (
                    <p className="text-xs text-muted-foreground truncate">
                      Re: {selectedConversation.productName}
                    </p>
                  )}
                  {selectedConversation.chatType === "ORDER_SUPPORT" && (
                    <span className="text-[10px] text-primary/70 font-medium uppercase tracking-wide">
                      Order Support
                    </span>
                  )}
                </div>
              </div>
            )}

            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 p-4">
                <MessageCircle className="h-12 w-12 opacity-20" />
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.map((msg: any) => {
                    // ── Product card messages ──────────────────────────────
                    // FIX: also check content string directly as fallback
                    // in case backend isProductCard flag is missing/false
                    if (msg.isProductCard || msg.content?.startsWith("PRODUCT_CARD::")) {
                      return <ProductCard key={msg.id} content={msg.content} />;
                    }

                    // ── System / automated messages ────────────────────────
                    if (msg.senderType === "SYSTEM" || msg.isAutomated) {
                      return <SystemMessage key={msg.id} content={msg.content} />;
                    }

                    // ── USER and SELLER messages ───────────────────────────
                    const isOwn = isSeller
                      ? msg.senderType === "SELLER"
                      : msg.senderType === "USER";

                    return (
                      <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div className="flex flex-col gap-0.5 max-w-[72%]">
                          {!isOwn && msg.senderName && (
                            <span className="text-[10px] text-muted-foreground px-1">
                              {msg.senderName}
                            </span>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-secondary text-foreground rounded-bl-sm"
                            }`}
                          >
                            {msg.productImageUrl && (
                              <img
                                src={msg.productImageUrl}
                                alt="Product"
                                className="rounded-lg mb-2 w-full max-w-[180px] object-cover"
                              />
                            )}
                            <span className="whitespace-pre-wrap">{msg.content}</span>
                          </div>
                          <span className={`text-[10px] text-muted-foreground px-1 ${isOwn ? "text-right" : ""}`}>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form
                  onSubmit={sendMessage}
                  className="flex gap-2 p-3 border-t border-border shrink-0"
                >
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-xl shrink-0"
                    disabled={sending || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;