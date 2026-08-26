import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { favoriteService } from "@/services/favorite.service";
import { isRentalListing } from "@/features/rentals/lib/rentalFormat";
import { getPropertyDetailPath } from "@/lib/propertyRoutes";
import property1 from "@/assets/property-1.jpg";

const BuyerFavorites = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["buyer-favorites-page"],
    queryFn: () => favoriteService.list(),
  });

  const favorites = (data?.data || []).filter(
    (fav) => fav.propertyId && !isRentalListing(fav.propertyId)
  );

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Favorites" role="buyer" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Favorites
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Saved homes for sale. Rental favorites are in{" "}
          <Link to="/buyer/saved-rentals" className="text-primary hover:underline">
            Saved Rentals
          </Link>
          .
        </p>
        {isLoading ? <p className="text-sm text-muted-foreground">Loading favorites...</p> : null}
        {favorites.length === 0 && !isLoading ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-foreground font-medium mb-2">No sale favorites yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Browse properties for sale or save rentals from the rentals page.
            </p>
            <Link to="/properties" className="text-primary hover:underline text-sm">
              Browse properties for sale
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((fav) => {
              const property = fav.propertyId;
              if (!property) return null;
              return (
                <Link
                  key={fav._id}
                  to={getPropertyDetailPath(property)}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <img
                    src={property.images?.[0]?.url || property1}
                    alt={property.title}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-foreground text-sm mb-1">
                      {property.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {[property.location?.city, property.location?.state].filter(Boolean).join(", ")}
                    </p>
                    <p className="text-primary font-bold text-sm">
                      ${Number(property.price || 0).toLocaleString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default BuyerFavorites;
