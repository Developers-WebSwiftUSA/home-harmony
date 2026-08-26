import { Home } from "lucide-react";
import { Property } from "@/types/models";
import { RentalCard } from "@/features/rentals/components/RentalCard";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  properties: Property[];
  total?: number;
  isLoading?: boolean;
  isError?: boolean;
  layout?: "grid" | "list";
  highlightedId?: string | null;
  onHighlight?: (id: string | null) => void;
  locationLabel?: string;
};

export const RentalEmptyState = ({ message }: { message?: string }) => (
  <div className="text-center py-16 bg-card border border-border rounded-xl">
    <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="font-heading font-bold text-foreground mb-2">No rentals found</h3>
    <p className="text-sm text-muted-foreground max-w-md mx-auto">
      {message || "Try adjusting your filters or searching a different area."}
    </p>
  </div>
);

export const RentalResultsPanel = ({
  properties,
  total,
  isLoading,
  isError,
  layout = "list",
  highlightedId,
  onHighlight,
  locationLabel,
}: Props) => {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <RentalEmptyState message="Something went wrong loading rentals. Please try again." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
        <p className="text-sm font-medium text-foreground">
          {total ?? properties.length} rentals
          {locationLabel ? ` in ${locationLabel}` : ""}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {properties.length === 0 ? (
          <RentalEmptyState />
        ) : layout === "grid" ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {properties.map((property) => (
              <RentalCard
                key={property._id}
                property={property}
                layout="grid"
                highlighted={highlightedId === property._id}
                onHover={() => onHighlight?.(property._id)}
                onLeave={() => onHighlight?.(null)}
              />
            ))}
          </div>
        ) : (
          properties.map((property) => (
            <RentalCard
              key={property._id}
              property={property}
              layout="list"
              highlighted={highlightedId === property._id}
              onHover={() => onHighlight?.(property._id)}
              onLeave={() => onHighlight?.(null)}
            />
          ))
        )}
      </div>
    </div>
  );
};
