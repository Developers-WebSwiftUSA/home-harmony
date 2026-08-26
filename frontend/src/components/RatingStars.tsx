import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRating, RatingSummary } from "@/lib/ratings";

type Props = {
  rating: RatingSummary | number;
  count?: number;
  size?: "xs" | "sm" | "md";
  showValue?: boolean;
  showCount?: boolean;
  compact?: boolean;
  emptyLabel?: string;
  className?: string;
};

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
};

export const RatingStars = ({
  rating,
  count,
  size = "sm",
  showValue = true,
  showCount = true,
  compact = false,
  emptyLabel = "No reviews yet",
  className,
}: Props) => {
  const summary: RatingSummary =
    typeof rating === "number"
      ? { average: rating, count: count ?? 0 }
      : rating;

  if (!summary.count) {
    return (
      <span className={cn("text-xs text-muted-foreground leading-5 min-h-5 inline-flex items-center", className)}>
        {emptyLabel}
      </span>
    );
  }

  const rounded = Math.round(summary.average);
  const valueLabel = compact
    ? formatRating(summary.average)
    : `(${formatRating(summary.average)}${showCount ? ` · ${summary.count} review${summary.count === 1 ? "" : "s"}` : ""})`;

  return (
    <div
      className={cn(
        "flex items-center gap-1 min-h-5",
        compact ? "flex-nowrap" : "flex-wrap",
        className
      )}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            sizeClasses[size],
            "flex-shrink-0",
            index < rounded ? "text-primary fill-primary" : "text-border"
          )}
        />
      ))}
      {showValue && (
        <span className={cn("text-xs text-muted-foreground whitespace-nowrap", compact ? "ml-0.5" : "ml-0.5")}>
          {valueLabel}
        </span>
      )}
    </div>
  );
};
