import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/RatingStars";
import { RatingSummary } from "@/lib/ratings";
import { PetPolicyBadge } from "@/components/PetPolicyBadge";
import { PetPolicy } from "@/lib/petPolicy";
import { PromotionBadge } from "@/features/ads/components/PromotionBadge";
import { PromotionBadgeVariant } from "@/features/ads/lib/promotionDisplay";

type Props = {
  id: string;
  image: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  rating: RatingSummary;
  badge: string;
  badgeVariant?: PromotionBadgeVariant;
  layout?: "grid" | "list";
  petPolicy?: PetPolicy | string | null;
  petFee?: number;
  to?: string;
};

export const PropertyListCard = ({
  id,
  image,
  title,
  location,
  price,
  beds,
  baths,
  sqft,
  rating,
  badge,
  badgeVariant = "default",
  layout = "grid",
  petPolicy,
  petFee,
  to,
}: Props) => {
  const href = to || `/properties/${id}`;
  if (layout === "list") {
    return (
      <Link
        to={href}
        className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow flex flex-col md:flex-row md:items-stretch group"
      >
        <div className="relative w-full md:w-72 h-48 md:h-auto md:min-h-[12rem] flex-shrink-0 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <PromotionBadge label={badge} variant={badgeVariant} />
        </div>

        <div className="p-5 flex-1 flex flex-col min-w-0">
          <div className="min-h-5 mb-2">
            <RatingStars rating={rating} compact />
          </div>
          <h3 className="font-heading font-bold text-foreground text-lg mb-1 line-clamp-2">{title}</h3>
          <p className="flex items-start gap-1 text-sm text-muted-foreground mb-3 line-clamp-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{location}</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Bed className="w-3.5 h-3.5" /> {beds} Beds
            </span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Bath className="w-3.5 h-3.5" /> {baths} Baths
            </span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Maximize className="w-3.5 h-3.5" /> {sqft} sqft
            </span>
            <PetPolicyBadge policy={petPolicy} petFee={petFee} />
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
            <span className="text-primary font-bold text-xl">{price}</span>
            <Button size="sm" className="flex-shrink-0" type="button">
              View Details
            </Button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={href}
      className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group h-full flex flex-col"
    >
      <div className="relative h-56 flex-shrink-0 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <PromotionBadge label={badge} variant={badgeVariant} />
        <button
          type="button"
          className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 flex flex-1 flex-col min-h-0">
        <div className="min-h-5 mb-2">
          <RatingStars rating={rating} compact />
        </div>
        <h3 className="font-heading font-bold text-foreground text-lg mb-1 line-clamp-2">{title}</h3>
        <p className="flex items-start gap-1 text-sm text-muted-foreground mb-4 line-clamp-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{location}</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground border-t border-border pt-4 mb-4">
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Bed className="w-3.5 h-3.5" /> {beds} Beds
          </span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Bath className="w-3.5 h-3.5" /> {baths} Baths
          </span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Maximize className="w-3.5 h-3.5" /> {sqft} sqft
          </span>
          <PetPolicyBadge policy={petPolicy} petFee={petFee} />
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="text-primary font-bold text-lg">{price}</span>
          <Button size="sm" variant="outline" className="text-xs flex-shrink-0" type="button">
            Details
          </Button>
        </div>
      </div>
    </Link>
  );
};
