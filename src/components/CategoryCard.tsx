import { Link } from "react-router-dom";
import { Smartphone, Shirt, Home, Sparkles, Dumbbell, BookOpen, Gamepad2, ShoppingBasket, type LucideIcon } from "lucide-react";

interface CategoryCardProps {
  name: string;
  slug: string;
  icon?: { imageUrl: string } | null;
}

const categoryIcons: Record<string, LucideIcon> = {
  electronics: Smartphone,
  fashion: Shirt,
  "home-living": Home,
  beauty: Sparkles,
  sports: Dumbbell,
  books: BookOpen,
  "toys-games": Gamepad2,
  groceries: ShoppingBasket,
};

const CategoryCard = ({ name, slug, icon }: CategoryCardProps) => {
  const IconComp = categoryIcons[slug] || ShoppingBasket;

  return (
    <Link
      to={`/categories/${slug}`}
      className="group flex flex-col items-center gap-2.5 rounded-2xl bg-card p-5 shadow-soft hover-lift cursor-pointer"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/70 transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
        {icon?.imageUrl ? (
          <img src={icon.imageUrl} alt={name} className="h-8 w-8 object-contain" />
        ) : (
          <IconComp className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </div>
      <span className="text-xs font-medium text-center line-clamp-2 text-muted-foreground group-hover:text-foreground transition-colors">{name}</span>
    </Link>
  );
};

export default CategoryCard;
