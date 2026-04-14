import { FileText, DollarSign, BarChart3, Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiApi } from "@/lib/api";

interface SellerQuickActionsProps {
  onAction: (prompt: string, apiCall?: () => Promise<any>) => void;
  disabled?: boolean;
}

const actions = [
  {
    id: "listing",
    label: "Generate Listing",
    icon: FileText,
    prompt: "Generate a product listing for me",
  },
  {
    id: "price",
    label: "Price Suggestion",
    icon: DollarSign,
    prompt: "Suggest a price for my product",
  },
  {
    id: "inventory",
    label: "Inventory Analysis",
    icon: BarChart3,
    prompt: "Analyze my inventory and give me insights",
    apiCall: () => aiApi.inventoryAnalysis(),
  },
  {
    id: "trends",
    label: "Market Trends",
    icon: TrendingUp,
    prompt: "Show me current market trends",
    apiCall: () => aiApi.getTrends(),
  },
];

const SellerQuickActions = ({ onAction, disabled }: SellerQuickActionsProps) => (
  <div className="grid grid-cols-2 gap-2.5">
    {actions.map((a) => (
      <Button
        key={a.id}
        variant="outline"
        onClick={() => onAction(a.prompt, a.apiCall)}
        disabled={disabled}
        className="h-auto p-3.5 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/20 transition-colors group"
      >
        <a.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-xs font-medium">{a.label}</span>
      </Button>
    ))}
  </div>
);

export default SellerQuickActions;
