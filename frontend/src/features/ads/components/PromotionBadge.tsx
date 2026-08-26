import { cn } from "@/lib/utils";
import { PromotionBadgeVariant } from "@/features/ads/lib/promotionDisplay";

type Props = {
  label: string;
  variant?: PromotionBadgeVariant;
  className?: string;
};

const variantClasses: Record<PromotionBadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  featured: "bg-primary text-primary-foreground",
  sponsored: "bg-amber-500 text-white shadow-sm",
  advertised: "bg-sky-600 text-white shadow-sm",
};

export const PromotionBadge = ({ label, variant = "default", className }: Props) => (
  <span
    className={cn(
      "absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide",
      variantClasses[variant],
      className
    )}
  >
    {label}
  </span>
);
