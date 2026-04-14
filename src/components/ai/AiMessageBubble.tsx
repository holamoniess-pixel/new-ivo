import { Bot, User, Package, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

interface Message {
  role: "user" | "ai";
  text: string;
  products?: any[];
  timestamp?: Date;
}

interface AiMessageBubbleProps {
  message: Message;
}

const AiMessageBubble = ({ message }: AiMessageBubbleProps) => {
  const isUser = message.role === "user";
  const hasProducts = !isUser && message.products && message.products.length > 0;

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className={`space-y-3 ${isUser ? "text-right max-w-[78%]" : "flex-1 min-w-0"}`}>
        {/* Text bubble */}
        <div
          className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border/50"
          }`}
        >
          {message.text.split("\n").map((line, idx) => (
            <div key={idx}>{line || <br />}</div>
          ))}
        </div>

        {/* ── Product cards ──────────────────────────────────────── */}
        {hasProducts && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-1">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{message.products!.length} product{message.products!.length !== 1 ? "s" : ""} found</span>
            </div>

            {/* Horizontal scroll row */}
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
              {message.products!.map((p: any) => {
                const id       = p.productId || p.id;
                const name     = p.productName || p.name || "Product";
                const imageUrl = p.primaryImageUrl || p.imageUrl || null;
                const price    = p.isDiscounted && p.discountPrice ? p.discountPrice : p.price;
                const origPrice = p.isDiscounted && p.discountPrice ? p.price : null;
                const outOfStock = p.stock === 0;

                return (
                  <Link
                    key={id}
                    to={`/products/${id}`}
                    className="snap-start shrink-0 w-40 rounded-xl bg-card border border-border/60 overflow-hidden hover:shadow-md hover:border-primary/30 transition-all group flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-36 bg-secondary/40 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={name}
                          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${outOfStock ? "opacity-60" : ""}`}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Badges */}
                      {p.isDiscounted && !outOfStock && (
                        <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-md leading-none">
                          SALE
                        </span>
                      )}
                      {outOfStock && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                            Out of stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2.5 flex flex-col gap-1 flex-1">
                      <p className="text-xs font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {name}
                      </p>
                      {p.brand && (
                        <p className="text-[10px] text-muted-foreground">{p.brand}</p>
                      )}
                      <div className="mt-auto pt-1 flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-primary">
                          GHS {Number(price ?? 0).toFixed(2)}
                        </span>
                        {origPrice && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            GHS {Number(origPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary border border-border/30">
          <User className="h-4 w-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};

export default AiMessageBubble;