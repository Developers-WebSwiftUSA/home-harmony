import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, MapPin, Bed, Bath, Maximize, Calendar, Clock, UserCheck, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PetPolicyBadge } from "@/components/PetPolicyBadge";
import { DashboardSidebar } from "./AdminDashboard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import property1 from "@/assets/property-1.jpg";
import { PropertyImage } from "@/components/PropertyImage";
import { getPropertyPrimaryImage } from "@/lib/propertyImage";
import { propertyService } from "@/services/property.service";
import { AssignAgentControl } from "@/components/AssignAgentControl";
import { PropertyViewershipControl } from "@/components/PropertyViewershipControl";
import { getDisplayName } from "@/lib/userDisplay";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DashboardTabPills, listingTypeTabs } from "@/components/dashboard/DashboardTabPills";
import { isRentalListing } from "@/features/rentals/lib/rentalFormat";

const SellerListings = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("All");
  const listingTypeTab = searchParams.get("type") || "all";
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["seller-listings"],
    queryFn: () => propertyService.mine(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyService.remove(id),
    onSuccess: () => {
      toast.success("Listing deleted");
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard-listings"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete listing");
    },
  });

  const allListings = (data?.data || []).map((item) => ({
    id: item._id,
    raw: item,
    image: getPropertyPrimaryImage(item.images, property1),
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

  const saleCount = allListings.filter(
    (l) => l.raw.listingType === "sale" || l.raw.listingType === "both"
  ).length;
  const rentCount = allListings.filter((l) => isRentalListing(l.raw)).length;

  const typeFiltered =
    listingTypeTab === "all"
      ? allListings
      : listingTypeTab === "rent"
        ? allListings.filter((l) => isRentalListing(l.raw))
        : allListings.filter((l) => l.raw.listingType === "sale" || l.raw.listingType === "both");

  const filteredListings =
    activeTab === "All"
      ? typeFiltered
      : typeFiltered.filter((listing) => listing.status === activeTab);

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
            <Link to="/seller/promotions">
              <Button variant="outline" className="gap-2">
                <Megaphone className="w-4 h-4" /> Promotions
              </Button>
            </Link>
            <Link to="/seller/listings/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Add New Listing
              </Button>
            </Link>
          </div>
        </div>

        <DashboardTabPills
          className="mb-8"
          activeKey=""
          onChange={(key) => {
            if (key === "all") setActiveTab("All");
            else navigate("/seller/analytics");
          }}
          tabs={[
            { key: "all", label: "Total Listings", count: allListings.length },
            {
              key: "views",
              label: "Total Views",
              count: Number(allListings.reduce((sum, item) => sum + item.views, 0)).toLocaleString(),
              href: "/seller/analytics",
            },
            {
              key: "price",
              label: "Total Value",
              count: `$${totalValue.toLocaleString()}`,
              href: "/seller/analytics",
            },
            {
              key: "avg",
              label: "Avg. Price",
              count: allListings.length
                ? `$${Math.round(totalValue / allListings.length).toLocaleString()}`
                : "$0",
              href: "/seller/analytics",
            },
          ]}
        />

        <DashboardTabPills
          variant="card"
          tabs={listingTypeTabs(allListings.length, saleCount, rentCount)}
          activeKey={listingTypeTab}
          onChange={(key) => setSearchParams(key === "all" ? {} : { type: key }, { replace: true })}
          className="mb-6"
        />

        <DashboardTabPills
          className="mb-6"
          activeKey={activeTab}
          onChange={setActiveTab}
          tabs={[
            { key: "All", label: "All", count: typeFiltered.length },
            {
              key: "Active",
              label: "Active",
              count: typeFiltered.filter((listing) => listing.status === "Active").length,
            },
            {
              key: "Pending Review",
              label: "Pending Review",
              count: typeFiltered.filter((listing) => listing.status === "Pending Review").length,
            },
            {
              key: "Draft",
              label: "Draft",
              count: typeFiltered.filter((listing) => listing.status === "Draft").length,
            },
          ]}
        />

        <div className="space-y-4">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading listings...</p> : null}
          {!isLoading && filteredListings.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <p className="text-muted-foreground mb-4">No listings in this category.</p>
              <Link to="/seller/listings/new">
                <Button>Add your first listing</Button>
              </Link>
            </div>
          ) : null}
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative w-full md:w-48 h-40 rounded-lg overflow-hidden flex-shrink-0">
                  <PropertyImage src={listing.image} alt={listing.title} fallback={property1} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${
                    listing.status === "Active" ? "bg-green-500 text-white" :
                    listing.status === "Pending Review" ? "bg-yellow-500 text-white" :
                    "bg-gray-500 text-white"
                  }`}>
                    {listing.status}
                  </span>
                  <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${
                    isRentalListing(listing.raw) ? "bg-blue-500 text-white" : "bg-emerald-600 text-white"
                  }`}>
                    {isRentalListing(listing.raw) ? "For Rent" : "For Sale"}
                  </span>
                </div>

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

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {listing.beds} Beds</span>
                    <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {listing.baths} Baths</span>
                    <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {listing.sqft} sqft</span>
                    <PetPolicyBadge
                      policy={listing.raw.rentalDetails?.petPolicy}
                      petFee={listing.raw.rentalDetails?.petFee}
                    />
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

                  <div className="border-t border-border pt-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Assigned Agent</span>
                    </div>
                    {listing.raw.agentId && typeof listing.raw.agentId === "object" && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Current: {getDisplayName(listing.raw.agentId)} ({listing.raw.agentId.email})
                      </p>
                    )}
                    <AssignAgentControl
                      propertyId={listing.id}
                      currentAgent={listing.raw.agentId}
                      compact
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={listing.raw.listingType === "rent" || listing.raw.listingType === "both" ? `/rentals/${listing.id}` : `/properties/${listing.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    </Link>
                    <PropertyViewershipControl
                      property={listing.raw}
                      queryKeys={[["seller-listings"], ["seller-dashboard-listings"], ["properties"], ["rentals"]]}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      type="button"
                      onClick={() => navigate(`/seller/listings/${listing.id}/edit`)}
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    {listing.status === "Pending Review" && (
                      <Button size="sm" variant="outline" className="text-xs" type="button" disabled>
                        <Clock className="w-3.5 h-3.5 mr-1" /> Review Status
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-destructive hover:text-destructive"
                      type="button"
                      onClick={() => setDeleteTarget({ id: listing.id, title: listing.title })}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteTarget?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SellerListings;
