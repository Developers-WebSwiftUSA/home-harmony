import { Link } from "react-router-dom";
import { Home, Calendar, BarChart3, Bell, Plus, Eye, Edit, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "./AdminDashboard";
import { useQuery } from "@tanstack/react-query";
import { propertyService } from "@/services/property.service";
import { tourService } from "@/services/tour.service";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";

const listings = [
  { id: 1, image: property1, title: "Downtown Smart Apartments", price: "$450,000", status: "Active", views: 234, inquiries: 12 },
  { id: 2, image: property2, title: "Garden View Residence", price: "$275,000", status: "Pending Review", views: 89, inquiries: 5 },
];

const tourRequests = [
  { buyer: "Alice Johnson", property: "Downtown Smart Apartments", date: "Feb 20, 2026", time: "10:00 AM", status: "Pending" },
  { buyer: "Bob Williams", property: "Downtown Smart Apartments", date: "Feb 21, 2026", time: "3:00 PM", status: "Accepted" },
];

const SellerDashboard = () => {
  const { data: listingsData } = useQuery({
    queryKey: ["seller-dashboard-listings"],
    queryFn: () => propertyService.mine(),
  });
  const { data: toursData } = useQuery({
    queryKey: ["seller-dashboard-tours"],
    queryFn: () => tourService.list(),
  });

  const listingsLive =
    (listingsData?.data || []).slice(0, 3).map((item) => ({
      id: item._id,
      image: item.images?.[0]?.url || property1,
      title: item.title,
      price: `$${Number(item.price || 0).toLocaleString()}`,
      status: item.status === "pending" ? "Pending Review" : item.status.charAt(0).toUpperCase() + item.status.slice(1),
      views: item.views || 0,
      inquiries: item.inquiries || 0,
    })) || listings;

  const tourRequestsLive =
    (toursData?.data || []).slice(0, 4).map((tour) => ({
      buyer: `${tour.buyerId?.firstName || ""} ${tour.buyerId?.lastName || ""}`.trim() || tour.buyerId?.email || "Buyer",
      property: tour.propertyId?.title || "Property",
      date: tour.date ? new Date(tour.date).toLocaleDateString() : "-",
      time: `${tour.startTime} - ${tour.endTime}`,
      status:
        tour.status === "confirmed"
          ? "Accepted"
          : tour.status.charAt(0).toUpperCase() + tour.status.slice(1),
    })) || tourRequests;

  const totalViews = listingsLive.reduce((sum, i) => sum + i.views, 0);
  const pendingTours = tourRequestsLive.filter((t) => t.status === "Pending").length;

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Dashboard" role="seller" />

      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Seller Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your listings and tours</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/seller/listings/new">
              <Button className="gap-2"><Plus className="w-4 h-4" /> Add Listing</Button>
            </Link>
            <button className="relative p-2 rounded-lg hover:bg-card transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Home, label: "Active Listings", value: String(listingsLive.length) },
            { icon: Eye, label: "Total Views", value: totalViews.toLocaleString() },
            { icon: Calendar, label: "Tour Requests", value: String(pendingTours) },
            { icon: DollarSign, label: "Est. Portfolio", value: "$--" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* My Listings */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-foreground">My Listings</h2>
            <Link to="/seller/listings">
              <Button size="sm" variant="outline" className="text-xs">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {listingsLive.map((listing) => (
              <div key={listing.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <img src={listing.image} alt={listing.title} className="w-20 h-14 rounded-md object-cover" />
                <div className="flex-1">
                  <div className="font-medium text-foreground text-sm">{listing.title}</div>
                  <div className="text-xs text-muted-foreground">{listing.price} · {listing.views} views · {listing.inquiries} inquiries</div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${listing.status === "Active" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                  {listing.status}
                </span>
                <button className="p-2 hover:bg-card rounded-md transition-colors"><Edit className="w-4 h-4 text-muted-foreground" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Tour Requests */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-heading font-bold text-foreground mb-4">Tour Requests</h2>
          <div className="space-y-3">
            {tourRequestsLive.map((tour, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-medium text-foreground text-sm">{tour.buyer}</div>
                  <div className="text-xs text-muted-foreground">{tour.property} · {tour.date} at {tour.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${tour.status === "Accepted" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                    {tour.status}
                  </span>
                  {tour.status === "Pending" && (
                    <>
                      <Button size="sm" className="text-xs h-7">Accept</Button>
                      <Button size="sm" variant="outline" className="text-xs h-7">Decline</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
