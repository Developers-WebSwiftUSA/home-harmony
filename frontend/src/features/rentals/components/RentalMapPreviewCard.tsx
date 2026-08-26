import { Link } from "react-router-dom";
import { Bed, Bath, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from "@/types/models";
import { formatRentPrice, getPropertyLocationLabel } from "@/features/rentals/lib/rentalFormat";
import { PetPolicyBadge } from "@/components/PetPolicyBadge";
import property1 from "@/assets/property-1.jpg";

type Props = {
  property: Property;
};

export const RentalMapPreviewCard = ({ property }: Props) => (
  <div className="w-[240px]">
    <img
      src={property.images?.[0]?.url || property1}
      alt={property.title}
      className="w-full h-28 object-cover rounded-md mb-2"
      loading="lazy"
    />
    <p className="font-heading font-bold text-sm text-foreground mb-1">{formatRentPrice(property.price)}</p>
    <p className="text-xs font-medium line-clamp-1 mb-1">{property.title}</p>
    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
      <MapPin className="w-3 h-3" />
      <span className="line-clamp-1">{getPropertyLocationLabel(property)}</span>
    </p>
    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
      <span className="inline-flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms}</span>
      <span className="inline-flex items-center gap-1"><Bath className="w-3 h-3" />{property.bathrooms}</span>
    </div>
    <div className="mb-3">
      <PetPolicyBadge policy={property.rentalDetails?.petPolicy} petFee={property.rentalDetails?.petFee} />
    </div>
    <Button size="sm" className="w-full" asChild>
      <Link to={`/rentals/${property._id}`}>View rental</Link>
    </Button>
  </div>
);
