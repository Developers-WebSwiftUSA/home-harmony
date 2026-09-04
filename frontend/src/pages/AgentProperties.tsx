import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { propertyService } from "@/services/property.service";
import { DashboardTabPills, listingTypeTabs } from "@/components/dashboard/DashboardTabPills";
import { isRentalListing } from "@/features/rentals/lib/rentalFormat";
import { getPropertyDetailPath } from "@/lib/propertyRoutes";
import property1 from "@/assets/property-1.jpg";
import { getPropertyPrimaryImage } from "@/lib/propertyImage";
import { PropertyViewershipControl } from "@/components/PropertyViewershipControl";

const AgentProperties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const listingTypeTab = searchParams.get("type") || "all";
  const [statusTab, setStatusTab] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["agent-properties"],
    queryFn: () => propertyService.agent(),
  });

  const properties = data?.data || [];

  const saleCount = properties.filter((p) => p.listingType === "sale" || p.listingType === "both").length;
  const rentCount = properties.filter((p) => isRentalListing(p)).length;

  const filtered = useMemo(() => {
    let list = properties;
    if (listingTypeTab === "rent") list = list.filter((p) => isRentalListing(p));
    else if (listingTypeTab === "sale") list = list.filter((p) => p.listingType === "sale" || p.listingType === "both");
    if (statusTab !== "All") {
      list = list.filter((p) => {
        const label = p.status === "pending" ? "Pending Review" : p.status.charAt(0).toUpperCase() + p.status.slice(1);
        return label === statusTab;
      });
    }
    return list;
  }, [properties, listingTypeTab, statusTab]);

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Properties" role="agent" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Assigned Properties</h1>
        <p className="text-sm text-muted-foreground mb-6">Properties linked to your agent account</p>

        <DashboardTabPills
          variant="card"
          tabs={listingTypeTabs(properties.length, saleCount, rentCount)}
          activeKey={listingTypeTab}
          onChange={(key) => setSearchParams(key === "all" ? {} : { type: key }, { replace: true })}
          className="mb-6"
        />

        <DashboardTabPills
          tabs={[
            { key: "All", label: "All", count: properties.length },
            {
              key: "Active",
              label: "Active",
              count: properties.filter((p) => p.status === "active").length,
            },
            {
              key: "Pending Review",
              label: "Pending Review",
              count: properties.filter((p) => p.status === "pending").length,
            },
            {
              key: "Draft",
              label: "Draft",
              count: properties.filter((p) => p.status === "draft").length,
            },
            { key: "Sold", label: "Sold", count: properties.filter((p) => p.status === "sold").length },
            {
              key: "Rented",
              label: "Rented",
              count: properties.filter((p) => p.status === "rented").length,
            },
          ]}
          activeKey={statusTab}
          onChange={setStatusTab}
          className="mb-6"
        />

        {isLoading ? <p className="text-sm text-muted-foreground mb-4">Loading properties...</p> : null}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((property) => (
            <div key={property._id} className="bg-card border border-border rounded-xl p-4 flex gap-4">
              <div className="relative shrink-0">
                <img
                  src={getPropertyPrimaryImage(property.images, property1)}
                  alt={property.title}
                  className="w-28 h-20 object-cover rounded-md"
                />
                <span
                  className={`absolute top-1 left-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white ${
                    isRentalListing(property) ? "bg-blue-500" : "bg-emerald-600"
                  }`}
                >
                  {isRentalListing(property) ? "Rent" : "Sale"}
                </span>
              </div>
              <div className="flex-1">
                <Link
                  to={getPropertyDetailPath(property)}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {property.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {[property.location?.city, property.location?.state].filter(Boolean).join(", ")}
                </p>
                <p className="text-sm text-primary font-bold">
                  ${Number(property.price || 0).toLocaleString()}
                  {isRentalListing(property) ? "/mo" : ""}
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize inline-block mt-1">
                  {property.status}
                </span>
                {property.viewershipEnabled === false && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 inline-block mt-1 ml-1">
                    Viewership paused
                  </span>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <PropertyViewershipControl property={property} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AgentProperties;
