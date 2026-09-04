import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { favoriteService } from "@/services/favorite.service";
import { isRentalListing, formatRentPrice } from "@/features/rentals/lib/rentalFormat";
import property1 from "@/assets/property-1.jpg";
import { getPropertyPrimaryImage } from "@/lib/propertyImage";
import { RentalFavoriteButton } from "@/features/rentals/components/RentalFavoriteButton";
import { MapPin, Bed, Bath } from "lucide-react";
import { Button } from "@/components/ui/button";

const SavedRentals = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["saved-rentals"],
    queryFn: () => favoriteService.list(),
  });

  const rentals = (data?.data || []).filter((fav) =>
    fav.propertyId ? isRentalListing(fav.propertyId) : false
  );

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Saved Rentals" role="buyer" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Saved Rentals</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Rentals you&apos;ve saved for later.{" "}
          <Link to="/rentals" className="text-primary hover:underline">Browse more rentals</Link>
        </p>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading saved rentals...</p>
        ) : rentals.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-foreground font-medium mb-2">No saved rentals yet</p>
            <p className="text-sm text-muted-foreground mb-4">Tap the heart on any rental listing to save it here.</p>
            <Button asChild><Link to="/rentals">Browse rentals</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rentals.map((fav) => {
              const property = fav.propertyId;
              if (!property) return null;
              return (
                <div key={fav._id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="relative">
                    <img
                      src={getPropertyPrimaryImage(property.images, property1)}
                      alt={property.title}
                      className="w-full h-44 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3">
                      <RentalFavoriteButton propertyId={property._id} />
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-primary font-bold mb-1">{formatRentPrice(property.price)}</p>
                    <h3 className="font-heading font-bold text-foreground text-sm mb-1 line-clamp-2">{property.title}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3" />
                      {[property.location?.city, property.location?.state].filter(Boolean).join(", ")}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      <span className="inline-flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms}</span>
                      <span className="inline-flex items-center gap-1"><Bath className="w-3 h-3" />{property.bathrooms}</span>
                    </div>
                    <Button size="sm" className="w-full" asChild>
                      <Link to={`/rentals/${property._id}`}>View rental</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedRentals;
