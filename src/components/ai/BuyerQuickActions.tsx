import { ShoppingBag, TrendingUp, DollarSign, Shirt, MapPin, Image, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BuyerQuickActionsProps {
  onAction: (prompt: string, apiCall?: () => Promise<any>) => void;
  disabled?: boolean;
}

const actions = [
  { id: "find", label: "Find Products", icon: ShoppingBag, prompt: "Help me find products" },
  { id: "trending", label: "What's Trending", icon: TrendingUp, prompt: "Show me trending items" },
  { id: "budget", label: "Budget Deals", icon: DollarSign, prompt: "Find me great deals and budget-friendly options" },
  { id: "fashion", label: "Style Tips", icon: Shirt, prompt: "Give me fashion advice and styling tips" },
  { id: "location", label: "Near Me", icon: MapPin, prompt: "Find products from sellers near my location" },
  { id: "compare", label: "Compare Products", icon: RefreshCw, prompt: "Help me compare different products" },
];

const BuyerQuickActions = ({ onAction, disabled }: BuyerQuickActionsProps) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
    {actions.map((a) => (
      <Button
        key={a.id}
        variant="outline"
        onClick={() => onAction(a.prompt)}
        disabled={disabled}
        className="h-auto p-3.5 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/20 transition-colors group"
      >
        <a.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-xs font-medium">{a.label}</span>
      </Button>
    ))}
  </div>
);

export default BuyerQuickActions;
