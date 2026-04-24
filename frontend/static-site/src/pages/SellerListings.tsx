import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Plus, Eye, Edit, Trash2, MapPin, Bed, Bath, Maximize, Calendar, DollarSign, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "./AdminDashboard";
import { useQuery } from "@tanstack/react-query";
import property1 from "@/assets/property-1.jpg";
import { propertyService } from "@/services/property.service";

const SellerListings = () => {
  const [activeTab, setActiveTab] = useState("All");
  const { data, isLoading } = useQuery({
    queryKey: ["seller-listings"],
    queryFn: () => propertyService.mine(),
  });

  const allListings = (data?.data || []).map((item) => ({
    id: item._id,
    image: item.images?.[0]?.url || property1,
    title: item.title,
    location: [item.location?.address, item.location?.city, item.location?.state].filter(Boolean).join(", "),
    price: `$${Number(item.price || 0).toLocaleString()}`,
    status: item.status === "pending" ? "Pending Review" : item.status.charAt(0).toUpperCase() + item.status.slice(1),
    views: item.views || 0,
    inquiries: item.inquiries || 0,
    beds: item.bedrooms || 0,
    baths: item.bathrooms || 0,
    sqft: Number(item.squareFeet || 0).toLocaleString(),
    listedDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
  }));

  const filteredListings =
    activeTab === "All" ? allListings : allListings.filter((listing) => listing.status === activeTab);

  const totalValue = allListings.reduce((sum, listing) => {
    const value = Number(listing.price.replace(/[^0-9]/g, ""));
    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="My Listings" role="seller" />

      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">My Listings</h1>
            <p className="text-sm text-muted-foreground">Manage all your property listings</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/seller/listings/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Add New Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
            { icon: Home, label: "Total Listings", value: String(allListings.length), change: "Live data" },
            { icon: Eye, label: "Total Views", value: Number(allListings.reduce((sum, item) => sum + item.views, 0)).toLocaleString(), change: "Live data" },
            { icon: DollarSign, label: "Total Value", value: `$${totalValue.toLocaleString()}`, change: "Portfolio estimate" },
            { icon: TrendingUp, label: "Avg. Price", value: allListings.length ? `$${Math.round(totalValue / allListings.length).toLocaleString()}` : "$0", change: "Per listing" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.change}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {["All", "Active", "Pending Review", "Draft"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === activeTab
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        <div className="space-y-4">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading listings...</p> : null}
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="relative w-full md:w-48 h-40 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${
                    listing.status === "Active" ? "bg-green-500 text-white" :
                    listing.status === "Pending Review" ? "bg-yellow-500 text-white" :
                    "bg-gray-500 text-white"
                  }`}>
                    {listing.status}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-bold text-foreground text-lg mb-1">{listing.title}</h3>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-3.5 h-3.5" />{listing.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{listing.price}</div>
                      <div className="text-xs text-muted-foreground">Listed {listing.listedDate}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {listing.beds} Beds</span>
                    <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {listing.baths} Baths</span>
                    <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {listing.sqft} sqft</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{listing.views} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{listing.inquiries} inquiries</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/properties/${listing.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    {listing.status === "Pending Review" && (
                      <Button size="sm" variant="outline" className="text-xs">
                        <Clock className="w-3.5 h-3.5 mr-1" /> Review Status
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-xs text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SellerListings;
