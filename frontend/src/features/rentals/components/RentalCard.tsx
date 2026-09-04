import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from "@/types/models";
import { RatingStars } from "@/components/RatingStars";
import { getPropertyRating } from "@/lib/ratings";
import property1 from "@/assets/property-1.jpg";
import { getAllPropertyImageUrls } from "@/lib/propertyImage";
import { formatRentPrice, getPropertyLocationLabel } from "@/features/rentals/lib/rentalFormat";
import { RentalFavoriteButton } from "@/features/rentals/components/RentalFavoriteButton";
import { RentalCardCarousel } from "@/features/rentals/components/RentalCardCarousel";
import { PetPolicyBadge } from "@/components/PetPolicyBadge";
import { cn } from "@/lib/utils";
import { PromotionBadge } from "@/features/ads/components/PromotionBadge";
import { getListingPromotionBadge } from "@/features/ads/lib/promotionDisplay";

type Props = {
  property: Property;
  layout?: "grid" | "list";
  highlighted?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  onSelect?: () => void;
};

export const RentalCard = ({
  property,
  layout = "grid",
  highlighted,
  onHover,
  onLeave,
  onSelect,
}: Props) => {
  const images = getAllPropertyImageUrls(property.images);
  const displayImages = images.length ? images : [property1];
  const location = getPropertyLocationLabel(property);
  const rating = getPropertyRating(property);
  const promotionBadge = getListingPromotionBadge(property, "For Rent");

  const content = (
    <>
      <div
        className={cn(
          "relative overflow-hidden flex-shrink-0",
          layout === "list" ? "w-full md:w-72 h-48 md:h-auto md:min-h-[12rem]" : "h-52"
        )}
      >
        <RentalCardCarousel images={displayImages} alt={property.title} />
        <PromotionBadge label={promotionBadge.label} variant={promotionBadge.variant} />
        <div className="absolute top-3 right-3">
          <RentalFavoriteButton propertyId={property._id} />
        </div>
        <div className="absolute bottom-3 left-3 bg-background/95 backdrop-blur text-foreground text-sm font-bold px-3 py-1.5 rounded-lg shadow">
          {formatRentPrice(property.price)}
        </div>
      </div>

      <div className={cn("p-5 flex flex-col min-w-0", layout === "list" && "flex-1")}>
        <div className="min-h-5 mb-2">
          <RatingStars rating={rating} compact />
        </div>
        <h3 className="font-heading font-bold text-foreground text-lg mb-1 line-clamp-2">
          {property.title}
        </h3>
        <p className="flex items-start gap-1 text-sm text-muted-foreground mb-3 line-clamp-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{location}</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
          <span className="inline-flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" /> {property.bedrooms} bd
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" /> {property.bathrooms} ba
          </span>
          <span className="inline-flex items-center gap-1">
            <Maximize className="w-3.5 h-3.5" /> {Number(property.squareFeet || 0).toLocaleString()} sqft
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs bg-muted px-2 py-1 rounded-full">{property.type}</span>
          {property.rentalDetails?.furnished && (
            <span className="text-xs bg-muted px-2 py-1 rounded-full">Furnished</span>
          )}
          <PetPolicyBadge
            policy={property.rentalDetails?.petPolicy}
            petFee={property.rentalDetails?.petFee}
          />
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link to={`/rentals/${property._id}`}>View Details</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to={`/rentals/${property._id}?apply=1`}>Apply</Link>
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <article
      className={cn(
        "bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-shadow group",
        layout === "list" ? "flex flex-col md:flex-row md:items-stretch" : "",
        highlighted && "ring-2 ring-primary"
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
    >
      {layout === "list" ? (
        content
      ) : (
        <Link to={`/rentals/${property._id}`} className="block">
          {content}
        </Link>
      )}
    </article>
  );
};
