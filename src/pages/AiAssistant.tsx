import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { aiApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import AiMessageBubble from "@/components/ai/AiMessageBubble";
import BuyerQuickActions from "@/components/ai/BuyerQuickActions";

interface Message {
  role: "user" | "ai";
  text: string;
  products?: any[];
  timestamp?: Date;
}

const WELCOME_MSG: Message = {
  role: "ai",
  text: "Hi! I'm Onett, your personal shopping assistant. I can help you find products, get fashion advice, discover deals, and stay on trend! 🛍️\n\nChoose from the options below or ask me anything:",
  timestamp: new Date(),
};

const AiAssistant = () => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const clearConversation = () => {
    setMessages([WELCOME_MSG]);
  };

  const sendMessage = async (
    e?: React.FormEvent,
    customPrompt?: string,
    apiCall?: () => Promise<any>
  ) => {
    e?.preventDefault();
    const messageText = customPrompt || input.trim();
    if (!messageText) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to use the AI assistant");
      return;
    }

    if (!customPrompt) setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: messageText, timestamp: new Date() },
    ]);
    setLoading(true);

    try {
      const res = apiCall
        ? await apiCall()
        : await aiApi.chat(messageText);

      const reply =
        res?.reply || res?.data?.reply || "I couldn't find a good answer.";
      const products = res?.products || res?.data?.products;

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: reply, products, timestamp: new Date() },
      ]);
    } catch (err: any) {
      const errorMsg = err?.message || "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `Sorry, ${errorMsg}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col container mx-auto px-4 py-6 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-satoshi text-2xl font-bold">Onett</h1>
              <p className="text-sm text-muted-foreground">
                Your personal shopping assistant
              </p>
            </div>
          </div>
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        <BuyerQuickActions
          onAction={(prompt) => sendMessage(undefined, prompt)}
          disabled={loading}
        />

        {/* Chat Area */}
        <ScrollArea className="flex-1 mt-4 pr-2">
          <div className="space-y-5 pb-4">
            {messages.map((msg, i) => (
              <AiMessageBubble key={i} message={msg} />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div className="rounded-2xl bg-card border border-border/50 px-5 py-4">
                  <div className="flex gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="flex gap-3 pt-4 border-t border-border/50"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Onett about products, style tips, deals..."
            className="flex-1 h-12 px-4 rounded-xl"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className="h-12 w-12 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

      </div>
    </div>
  );
};

export default AiAssistant;