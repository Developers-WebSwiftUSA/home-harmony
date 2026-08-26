import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ReviewRatingFilter,
  ReviewRatingType,
  StarRating,
  countToursByStar,
} from "@/lib/reviewFilters";
import { Tour } from "@/types/models";

const STAR_OPTIONS: StarRating[] = [5, 4, 3, 2, 1];

type Props = {
  tours: Tour[];
  filter: ReviewRatingFilter;
  onChange: (filter: ReviewRatingFilter) => void;
};

export const ReviewRatingFilters = ({ tours, filter, onChange }: Props) => {
  const hasActiveFilter = filter.stars !== null || filter.ratingType !== "all";

  const setRatingType = (ratingType: ReviewRatingType) => {
    onChange({ ...filter, ratingType });
  };

  const setStars = (stars: StarRating | null) => {
    onChange({ ...filter, stars });
  };

  const clearFilters = () => {
    onChange({ ratingType: "all", stars: null });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">Filter by rating</h3>
          <p className="text-xs text-muted-foreground">Narrow reviews by star count and type</p>
        </div>
        {hasActiveFilter && (
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 h-8" onClick={clearFilters}>
            <X className="w-3.5 h-3.5" />
            Clear filters
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={filter.ratingType} onValueChange={(value) => setRatingType(value as ReviewRatingType)}>
          <SelectTrigger className="w-[160px] h-9 bg-background">
            <SelectValue placeholder="Rating type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            <SelectItem value="property">Property only</SelectItem>
            <SelectItem value="agent">Agent only</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={filter.stars === null ? "default" : "outline"}
            className="h-9"
            onClick={() => setStars(null)}
          >
            All stars
          </Button>
          {STAR_OPTIONS.map((stars) => {
            const count = countToursByStar(tours, stars, filter.ratingType);
            const isActive = filter.stars === stars;

            return (
              <Button
                key={stars}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                className={cn("h-9 gap-1.5", isActive && "ring-2 ring-primary/30")}
                onClick={() => setStars(isActive ? null : stars)}
              >
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: stars }).map((_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        "w-3.5 h-3.5",
                        isActive ? "fill-primary-foreground text-primary-foreground" : "fill-yellow-500 text-yellow-500"
                      )}
                    />
                  ))}
                </span>
                <span className={cn("text-xs", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  ({count})
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
