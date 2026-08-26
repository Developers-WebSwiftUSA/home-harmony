import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Calendar, Bell, Home, Star, Target, MapPin, Eye, TrendingUp, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "./AdminDashboard";
import { useQuery } from "@tanstack/react-query";
import { tourService } from "@/services/tour.service";
import { messageService } from "@/services/message.service";
import { propertyService } from "@/services/property.service";
import { crmService } from "@/services/crm.service";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { UserAvatar } from "@/components/UserAvatar";
import { getDisplayName } from "@/lib/userDisplay";
import { formatRating, getAgentRating } from "@/lib/ratings";
import { cn } from "@/lib/utils";
import property1 from "@/assets/property-1.jpg";
import { getPropertyDetailPath } from "@/lib/propertyRoutes";
import { PropertyViewershipControl } from "@/components/PropertyViewershipControl";
import { Property } from "@/types/models";
import { AgentCustomerReviews, getAgentReviewTours } from "@/components/AgentCustomerReviews";
import { DashboardTabPills, listingTypeTabs, marketTabs } from "@/components/dashboard/DashboardTabPills";
import { isRentalListing } from "@/features/rentals/lib/rentalFormat";

type DashboardTab = "overview" | "properties" | "progress";

const getProgressStats = (properties: Property[]) => {
  const sold = properties.filter((p) => p.status === "sold");
  const rented = properties.filter((p) => p.status === "rented");
  const active = properties.filter((p) => p.status === "active");
  const pending = properties.filter((p) => p.status === "pending" || p.status === "draft");

  return {
    assigned: properties.length,
    sold: sold.length,
    rented: rented.length,
    active: active.length,
    pending: pending.length,
    soldProperties: sold,
    rentedProperties: rented,
    closedTotal: sold.length + rented.length,
  };
};

const clients = [
  { name: "Alice Johnson", type: "Buyer", status: "Active", lastContact: "Today" },
  { name: "Bob Williams", type: "Seller", status: "Active", lastContact: "Yesterday" },
  { name: "Carol Davis", type: "Buyer", status: "Lead", lastContact: "3 days ago" },
  { name: "Dan Miller", type: "Seller", status: "Closed", lastContact: "1 week ago" },
];

const upcomingEvents = [
  { title: "Property Showing - Downtown Apt", time: "10:00 AM", client: "Alice Johnson", type: "Tour" },
  { title: "Client Meeting - Bob Williams", time: "1:00 PM", client: "Bob Williams", type: "Meeting" },
  { title: "Open House - Garden Residence", time: "3:00 PM", client: "Walk-ins", type: "Open House" },
];

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  const { data: toursData, isLoading: loadingTours } = useQuery({
    queryKey: ["agent-dashboard-tours"],
    queryFn: () => tourService.list(),
  });
  const { data: completedToursData, isLoading: loadingReviews } = useQuery({
    queryKey: ["agent-dashboard-reviews"],
    queryFn: () => tourService.listReviews({ limit: 500 }),
  });
  const { data: conversationsData } = useQuery({
    queryKey: ["agent-dashboard-conversations"],
    queryFn: () => messageService.conversations(),
  });
  const { data: propertiesData, isLoading: loadingProperties } = useQuery({
    queryKey: ["agent-dashboard-properties"],
    queryFn: () => propertyService.agent(),
  });
  const { data: profileData } = useQuery({
    queryKey: ["agent-dashboard-profile"],
    queryFn: () => authService.me(),
    enabled: Boolean(user),
  });
  const { data: saleBuyersData } = useQuery({
    queryKey: ["crm-buyers", "agent", "sale"],
    queryFn: () => crmService.myBuyers("sale"),
  });
  const { data: rentBuyersData } = useQuery({
    queryKey: ["crm-buyers", "agent", "rent"],
    queryFn: () => crmService.myBuyers("rent"),
  });

  const tours = toursData?.data || [];
  const completedTours = completedToursData?.data || [];
  const agentUserId = user?._id || user?.id;
  const reviewCount = getAgentReviewTours(completedTours, agentUserId).length;
  const conversations = conversationsData?.data || [];
  const assignedProperties = propertiesData?.data || [];
  const agentRating = getAgentRating(profileData?.data || user);
  const ratingDisplay = agentRating.count
    ? formatRating(agentRating.average)
    : "—";

  const saleBuyerCount = saleBuyersData?.data?.length || 0;
  const rentBuyerCount = rentBuyersData?.data?.length || 0;
  const saleListingCount = assignedProperties.filter(
    (p) => p.listingType === "sale" || p.listingType === "both"
  ).length;
  const rentListingCount = assignedProperties.filter((p) => isRentalListing(p)).length;

  const crmBuyers = [...(saleBuyersData?.data || []), ...(rentBuyersData?.data || [])]
    .slice(0, 6)
    .map((entry) => ({
      name: getDisplayName(entry.buyer),
      type: entry.market === "rent" ? "Rental Buyer" : "Sale Buyer",
      status: entry.status.charAt(0).toUpperCase() + entry.status.slice(1),
      lastContact: entry.lastActivity
        ? new Date(entry.lastActivity).toLocaleDateString()
        : "-",
      buyerId: entry.buyerId,
    }));

  const upcomingEventsLive = tours.slice(0, 3).map((tour) => ({
    title: `Tour - ${tour.propertyId?.title || "Property"}`,
    time: `${tour.startTime}`,
    client: `${tour.buyerId?.firstName || ""} ${tour.buyerId?.lastName || ""}`.trim() || tour.buyerId?.email || "Client",
    type: "Tour",
  }));

  const clientsLive = conversations.slice(0, 6).map((conv) => {
    const other = conv.participants.find((p) => (p._id || p.id) !== (user?._id || user?.id));
    return {
      name: `${other?.firstName || ""} ${other?.lastName || ""}`.trim() || other?.email || "Client",
      type: other?.role ? other.role.charAt(0).toUpperCase() + other.role.slice(1) : "Client",
      status: "Active",
      lastContact: conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : "-",
    };
  });

  const progressStats = useMemo(
    () => getProgressStats(assignedProperties),
    [assignedProperties]
  );

  const tabConfig = [
    { key: "overview" as const, label: "Overview", count: saleBuyerCount + rentBuyerCount, subtitle: "Sale & rental buyers" },
    { key: "properties" as const, label: "Assigned Properties", count: assignedProperties.length, subtitle: "Your listings" },
    {
      key: "progress" as const,
      label: "Progress",
      count: progressStats.closedTotal,
      subtitle: `${reviewCount} review${reviewCount === 1 ? "" : "s"}`,
    },
  ];

  const progressCards = [
    { label: "Assigned Properties", value: progressStats.assigned, icon: Home, color: "text-primary", bg: "bg-primary/10" },
    { label: "Properties Sold", value: progressStats.sold, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/10" },
    { label: "Properties Rented", value: progressStats.rented, icon: KeyRound, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Active Listings", value: progressStats.active, icon: TrendingUp, color: "text-yellow-600", bg: "bg-yellow-500/10" },
  ];

  const renderPropertyProgressList = (items: Property[], emptyMessage: string) => {
    if (items.length === 0) {
      return <p className="text-sm text-muted-foreground py-6 text-center">{emptyMessage}</p>;
    }

    return (
      <div className="space-y-3">
        {items.map((property) => (
          <div
            key={property._id}
            className="flex items-center justify-between gap-3 p-3 bg-muted rounded-lg"
          >
            <div className="min-w-0">
              <Link
                to={getPropertyDetailPath(property)}
                className="font-medium text-foreground text-sm hover:text-primary truncate block"
              >
                {property.title}
              </Link>
              <p className="text-xs text-muted-foreground truncate">
                {[property.location?.city, property.location?.state].filter(Boolean).join(", ")}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-primary">
                ${Number(property.price || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{property.status}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Dashboard" role="agent" />

      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="lg" />
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Agent Dashboard</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tabConfig.map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "bg-card border border-border rounded-xl p-5 text-left transition-all hover:opacity-90",
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-muted"
                )}
              >
                <div className="text-2xl font-bold text-foreground">{tab.count}</div>
                <div className="text-sm font-medium text-foreground">{tab.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{tab.subtitle}</div>
              </button>
            );
          })}
        </div>

        {activeTab === "progress" ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-heading font-bold text-foreground">Your Progress</h2>
              <p className="text-sm text-muted-foreground">
                Track assigned listings and completed outcomes across your portfolio
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {progressCards.map((card) => (
                <div key={card.label} className="bg-card border border-border rounded-xl p-5">
                  <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{card.value}</div>
                  <div className="text-xs text-muted-foreground">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h3 className="font-heading font-bold text-foreground mb-4">Completion Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: "Sold", count: progressStats.sold, color: "bg-green-500" },
                  { label: "Rented", count: progressStats.rented, color: "bg-blue-500" },
                  { label: "Active", count: progressStats.active, color: "bg-yellow-500" },
                  { label: "Pending / Draft", count: progressStats.pending, color: "bg-muted-foreground/40" },
                ].map((item) => {
                  const width =
                    progressStats.assigned > 0
                      ? Math.round((item.count / progressStats.assigned) * 100)
                      : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{item.label}</span>
                        <span className="text-muted-foreground">
                          {item.count} ({width}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${item.color}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-heading font-bold text-foreground mb-4">Sold Properties</h3>
                {renderPropertyProgressList(
                  progressStats.soldProperties,
                  "No sold properties yet."
                )}
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-heading font-bold text-foreground mb-4">Rented Properties</h3>
                {renderPropertyProgressList(
                  progressStats.rentedProperties,
                  "No rented properties yet."
                )}
              </div>
            </div>

            <AgentCustomerReviews
              tours={completedTours}
              agentUserId={agentUserId}
              isLoading={loadingReviews || loadingTours}
            />
          </div>
        ) : activeTab === "overview" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { icon: Users, label: "Sale Buyers", value: String(saleBuyerCount) },
                { icon: Users, label: "Rental Buyers", value: String(rentBuyerCount) },
                { icon: Home, label: "Assigned Properties", value: String(assignedProperties.length) },
                { icon: Star, label: "Rating", value: ratingDisplay },
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

            <div className="mb-8">
              <DashboardTabPills
                variant="card"
                tabs={listingTypeTabs(assignedProperties.length, saleListingCount, rentListingCount)}
                activeKey="all"
                onChange={() => navigate("/agent/properties")}
                className="mb-2"
              />
              <Link to="/agent/properties">
                <Button variant="ghost" size="sm" className="text-xs text-primary px-0 hover:bg-transparent">
                  View assigned properties →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-bold text-foreground">Today's Schedule</h2>
                  <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="space-y-3">
                  {(upcomingEventsLive.length ? upcomingEventsLive : upcomingEvents).map((event, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-sm">{event.title}</div>
                        <div className="text-xs text-muted-foreground">{event.time} · {event.client}</div>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{event.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-bold text-foreground">Client Pipeline</h2>
                  <Link to="/agent/clients">
                    <Button size="sm" variant="outline" className="text-xs">View All</Button>
                  </Link>
                </div>
                <DashboardTabPills
                  variant="card"
                  tabs={marketTabs(saleBuyerCount, rentBuyerCount)}
                  activeKey="sale"
                  onChange={() => navigate("/agent/clients")}
                  className="mb-4"
                />
                <div className="space-y-3">
                  {(crmBuyers.length ? crmBuyers : clientsLive.length ? clientsLive : clients).map((client) => (
                    <div key={client.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-xs">{client.name[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm">{client.name}</div>
                          <div className="text-xs text-muted-foreground">{client.type} · {client.lastContact}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        client.status === "Active" ? "bg-green-50 text-green-600" :
                        client.status === "Lead" ? "bg-blue-50 text-blue-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : activeTab === "properties" ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-heading font-bold text-foreground">Assigned Properties</h2>
              <p className="text-sm text-muted-foreground">
                Properties assigned to you by sellers or admins
              </p>
            </div>

            {loadingProperties ? (
              <p className="text-sm text-muted-foreground">Loading assigned properties...</p>
            ) : assignedProperties.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Home className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium mb-1">No assigned properties yet</p>
                <p className="text-sm text-muted-foreground">
                  When a seller or admin assigns you to a listing, it will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {assignedProperties.map((property) => (
                  <div key={property._id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row">
                      <img
                        src={property.images?.[0]?.url || property1}
                        alt={property.title}
                        className="w-full sm:w-40 h-32 sm:h-auto object-cover"
                      />
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Link
                            to={getPropertyDetailPath(property)}
                            className="font-heading font-bold text-foreground hover:text-primary"
                          >
                            {property.title}
                          </Link>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${
                            property.status === "active"
                              ? "bg-green-100 text-green-700"
                              : property.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-muted text-muted-foreground"
                          }`}>
                            {property.status}
                          </span>
                        </div>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {[property.location?.address, property.location?.city, property.location?.state]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p className="text-lg font-bold text-primary mb-3">
                          ${Number(property.price || 0).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> {property.views || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {property.inquiries || 0} inquiries
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link to={getPropertyDetailPath(property)}>
                            <Button size="sm" variant="outline" className="text-xs">
                              View Listing
                            </Button>
                          </Link>
                          <PropertyViewershipControl
                            property={property}
                            queryKeys={[["agent-dashboard-properties"], ["agent-properties"]]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default AgentDashboard;
