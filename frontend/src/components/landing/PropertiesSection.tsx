import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import property1 from "@/assets/property-1.jpg";
import { propertyService } from "@/services/property.service";
import { getPropertyRating } from "@/lib/ratings";
import { getListingPromotionBadge } from "@/features/ads/lib/promotionDisplay";
import { PropertyListCard } from "@/components/PropertyListCard";

const PropertiesSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: () => propertyService.list({ status: "active", limit: 6, sort: "promoted" }),
  });

  const properties = data?.data?.length
    ? data.data
    : [];

  const fallbackQuery = useQuery({
    queryKey: ["featured-properties-fallback"],
    queryFn: () => propertyService.list({ status: "active", limit: 3 }),
    enabled: !isLoading && properties.length === 0,
  });

  const displayProperties = properties.length ? properties : fallbackQuery.data?.data || [];

  return (
    <section className="section-padding bg-muted">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Featured Properties</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
              Discover Verified Homes and
              <span className="block">Commercial Spaces</span>
            </h2>
          </div>
          <Link to="/properties">
            <Button className="mt-4 md:mt-0 w-fit">View More Properties</Button>
          </Link>
        </div>

        {isLoading || fallbackQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading properties...</p>
        ) : displayProperties.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active listings yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {displayProperties.slice(0, 3).map((prop) => {
              const promotion = getListingPromotionBadge(prop, prop.featured ? "Featured" : "For Sale");
              return (
              <PropertyListCard
                key={prop._id}
                id={prop._id}
                image={prop.images?.[0]?.url || property1}
                title={prop.title}
                location={[prop.location?.address, prop.location?.city].filter(Boolean).join(", ")}
                price={`$${Number(prop.price || 0).toLocaleString()}`}
                beds={prop.bedrooms || 0}
                baths={prop.bathrooms || 0}
                sqft={Number(prop.squareFeet || 0).toLocaleString()}
                rating={getPropertyRating(prop)}
                badge={promotion.label}
                badgeVariant={promotion.variant}
                layout="grid"
                petPolicy={prop.rentalDetails?.petPolicy}
                petFee={prop.rentalDetails?.petFee}
              />
            );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertiesSection;
