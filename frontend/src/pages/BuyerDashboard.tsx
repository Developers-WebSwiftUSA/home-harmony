import { Link } from "react-router-dom";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";
import { MapPin, Bed, Bath, Maximize, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "./AdminDashboard";
import { useQuery } from "@tanstack/react-query";
import { favoriteService } from "@/services/favorite.service";
import { tourService } from "@/services/tour.service";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { getDisplayName } from "@/lib/userDisplay";
import { getPropertyDetailPath } from "@/lib/propertyRoutes";
import { isRentalListing } from "@/features/rentals/lib/rentalFormat";
import { getSavedRentalSearches } from "@/features/rentals/lib/savedSearches";
import property1 from "@/assets/property-1.jpg";

const BuyerDashboard = () => {
  const { user } = useAuth();
  const { data: favoritesData } = useQuery({
    queryKey: ["buyer-favorites"],
    queryFn: () => favoriteService.list(),
  });
  const { data: toursData } = useQuery({
    queryKey: ["buyer-tours"],
    queryFn: () => tourService.list(),
  });

  const favorites = (favoritesData?.data || []).map((fav) => ({
    id: fav.propertyId?._id,
    listingType: fav.propertyId?.listingType,
    image: fav.propertyId?.images?.[0]?.url || property1,
    title: fav.propertyId?.title || "Property",
    location: [fav.propertyId?.location?.city, fav.propertyId?.location?.state].filter(Boolean).join(", "),
    price: fav.propertyId && isRentalListing(fav.propertyId)
      ? `$${Number(fav.propertyId.price || 0).toLocaleString()}/mo`
      : `$${Number(fav.propertyId?.price || 0).toLocaleString()}`,
    beds: fav.propertyId?.bedrooms || 0,
    baths: fav.propertyId?.bathrooms || 0,
    sqft: Number(fav.propertyId?.squareFeet || 0).toLocaleString(),
  }));

  const savedSearchCount = getSavedRentalSearches().length;

  const upcomingTours = (toursData?.data || []).slice(0, 3).map((tour) => ({
    property: tour.propertyId?.title || "Property",
    date: tour.date ? new Date(tour.date).toLocaleDateString() : "-",
    time: `${tour.startTime} - ${tour.endTime}`,
    agent:
      tour.agentId
        ? `${tour.agentId.firstName || ""} ${tour.agentId.lastName || ""}`.trim() || tour.agentId.email
        : "Assigned later",
    status: tour.status === "confirmed" ? "Confirmed" : tour.status.charAt(0).toUpperCase() + tour.status.slice(1),
  }));

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Dashboard" role="buyer" />

      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="lg" />
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Buyer Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {getDisplayName(user)}
              </p>
            </div>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-card transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
        </div>

        <DashboardTabPills
          className="mb-8"
          activeKey=""
          tabs={[
            { key: "favorites", label: "Favorites", count: favorites.length, href: "/buyer/favorites" },
            {
              key: "tours",
              label: "Tours Scheduled",
              count: (toursData?.data || []).length,
              href: "/buyer/tours",
            },
            { key: "active", label: "Active Tours", count: upcomingTours.length, href: "/buyer/tours" },
            {
              key: "searches",
              label: "Saved Searches",
              count: savedSearchCount,
              href: "/buyer/saved-rentals",
            },
          ]}
        />

        {/* Upcoming Tours */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="font-heading font-bold text-foreground mb-4">Upcoming Tours</h2>
          <div className="space-y-3">
            {upcomingTours.map((tour, idx) => (
              <div key={`${tour.property}-${idx}`} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-medium text-foreground text-sm">{tour.property}</div>
                  <div className="text-xs text-muted-foreground">{tour.date} at {tour.time} · Agent: {tour.agent}</div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${tour.status === "Confirmed" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                  {tour.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Favorites */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-foreground">My Favorites</h2>
            <Link to="/buyer/favorites"><Button size="sm" variant="outline" className="text-xs">View All</Button></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {favorites.map((prop) => (
              <Link
                to={getPropertyDetailPath({ _id: prop.id!, listingType: prop.listingType || "sale" })}
                key={prop.id}
                className="rounded-lg overflow-hidden border border-border hover:shadow-md transition-shadow"
              >
                <img src={prop.image} alt={prop.title} className="w-full h-36 object-cover" />
                <div className="p-3">
                  <h3 className="font-heading font-bold text-foreground text-sm mb-1">{prop.title}</h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><MapPin className="w-3 h-3" />{prop.location}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{prop.beds}</span>
                    <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{prop.baths}</span>
                    <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{prop.sqft}</span>
                  </div>
                  <span className="text-primary font-bold text-sm">{prop.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyerDashboard;
