import { Link, useNavigate } from "react-router-dom";
import { Bell, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "./AdminDashboard";
import { useQuery } from "@tanstack/react-query";
import { propertyService } from "@/services/property.service";
import { tourService } from "@/services/tour.service";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { getDisplayName } from "@/lib/userDisplay";
import { analyticsService } from "@/services/analytics.service";
import { crmService } from "@/services/crm.service";
import { formatOverviewValue } from "@/lib/analyticsDisplay";
import { DashboardTabPills, listingTypeTabs, marketTabs } from "@/components/dashboard/DashboardTabPills";
import { isRentalListing } from "@/features/rentals/lib/rentalFormat";
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: listingsData } = useQuery({
    queryKey: ["seller-dashboard-listings"],
    queryFn: () => propertyService.mine(),
  });
  const { data: toursData } = useQuery({
    queryKey: ["seller-dashboard-tours"],
    queryFn: () => tourService.list(),
  });
  const { data: analyticsData } = useQuery({
    queryKey: ["seller-dashboard-analytics"],
    queryFn: () => analyticsService.seller(),
  });
  const { data: saleBuyersData } = useQuery({
    queryKey: ["crm-buyers", "seller", "sale"],
    queryFn: () => crmService.myBuyers("sale"),
  });
  const { data: rentBuyersData } = useQuery({
    queryKey: ["crm-buyers", "seller", "rent"],
    queryFn: () => crmService.myBuyers("rent"),
  });

  const allProperties = listingsData?.data || [];
  const saleListingCount = allProperties.filter(
    (p) => p.listingType === "sale" || p.listingType === "both"
  ).length;
  const rentListingCount = allProperties.filter((p) => isRentalListing(p)).length;
  const saleBuyerCount = saleBuyersData?.data?.length || 0;
  const rentBuyerCount = rentBuyersData?.data?.length || 0;

  const listingsLive =
    allProperties.slice(0, 3).map((item) => ({
      id: item._id,
      image: item.images?.[0]?.url || property1,
      title: item.title,
      price: `$${Number(item.price || 0).toLocaleString()}`,
      status: item.status === "pending" ? "Pending Review" : item.status.charAt(0).toUpperCase() + item.status.slice(1),
      views: item.views || 0,
      inquiries: item.inquiries || 0,
      listingType: item.listingType,
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

  const analytics = analyticsData?.data;
  const totalViews = analytics?.overview.find((o) => o.label === "Total Views")?.value
    ?? listingsLive.reduce((sum, i) => sum + i.views, 0);
  const tourRequestTotal = analytics?.overview.find((o) => o.label === "Tour Requests")?.value
    ?? tourRequestsLive.length;
  const portfolioValue = analytics?.overview.find((o) => o.label === "Avg. Price");

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Dashboard" role="seller" />

      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="lg" />
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Seller Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {getDisplayName(user)}
              </p>
            </div>
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

        <DashboardTabPills
          className="mb-8"
          activeKey=""
          tabs={[
            {
              key: "active",
              label: "Active Listings",
              count: String(analytics?.listingBreakdown.active ?? listingsLive.length),
              href: "/seller/listings",
            },
            { key: "views", label: "Total Views", count: totalViews.toLocaleString(), href: "/seller/analytics" },
            {
              key: "tours",
              label: "Tour Requests",
              count: String(tourRequestTotal),
              href: "/seller/tours",
            },
            {
              key: "price",
              label: "Avg. Listing Price",
              count: portfolioValue ? formatOverviewValue(portfolioValue) : "$--",
              href: "/seller/analytics",
            },
          ]}
        />

        <div className="mb-8">
          <h2 className="font-heading font-bold text-foreground mb-4">Listings by Type</h2>
          <DashboardTabPills
            variant="card"
            tabs={listingTypeTabs(allProperties.length, saleListingCount, rentListingCount)}
            activeKey="all"
            onChange={(key) =>
              navigate(key === "all" ? "/seller/listings" : `/seller/listings?type=${key}`)
            }
            className="mb-2"
          />
          <Link to="/seller/listings">
            <Button variant="ghost" size="sm" className="text-xs text-primary px-0 hover:bg-transparent">
              Manage all listings →
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-foreground">My Buyers</h2>
            <Link to="/seller/buyers">
              <Button size="sm" variant="outline" className="text-xs">View All</Button>
            </Link>
          </div>
          <DashboardTabPills
            variant="card"
            tabs={marketTabs(saleBuyerCount, rentBuyerCount)}
            activeKey="sale"
            onChange={(key) => navigate(`/seller/buyers?market=${key}`)}
          />
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
