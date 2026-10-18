import { cn } from "@/lib/utils";

type Props = {
  index: number;
  total: number;
};

export const TourProgress = ({ index, total }: Props) => (
  <div className="flex items-center gap-1.5" aria-hidden>
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        className={cn(
          "h-1.5 rounded-full transition-all duration-300",
          i === index ? "w-5 bg-primary" : i < index ? "w-1.5 bg-primary/50" : "w-1.5 bg-border"
        )}
      />
    ))}
  </div>
);
