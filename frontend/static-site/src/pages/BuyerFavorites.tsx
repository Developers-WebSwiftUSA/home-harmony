import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { favoriteService } from "@/services/favorite.service";
import property1 from "@/assets/property-1.jpg";

const BuyerFavorites = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["buyer-favorites-page"],
    queryFn: () => favoriteService.list(),
  });

  const favorites = data?.data || [];

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Favorites" role="buyer" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Favorites
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Saved homes and properties you’ve favorited will appear here.
        </p>
        {isLoading ? <p className="text-sm text-muted-foreground">Loading favorites...</p> : null}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <Link key={fav._id} to={`/properties/${fav.propertyId?._id}`} className="bg-card border border-border rounded-xl overflow-hidden">
              <img src={fav.propertyId?.images?.[0]?.url || property1} alt={fav.propertyId?.title} className="w-full h-44 object-cover" />
              <div className="p-4">
                <h3 className="font-heading font-bold text-foreground text-sm mb-1">{fav.propertyId?.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {[fav.propertyId?.location?.city, fav.propertyId?.location?.state].filter(Boolean).join(", ")}
                </p>
                <p className="text-primary font-bold text-sm">${Number(fav.propertyId?.price || 0).toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BuyerFavorites;

