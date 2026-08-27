import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Home, Calendar, CalendarCheck, BarChart3, Shield, Bell, MessageSquare, Settings, LogOut, Eye, KeyRound, Heart, Star, Bookmark, Search, FileText, UserCheck, Megaphone, HelpCircle, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import { userService } from "@/services/user.service";
import { propertyService } from "@/services/property.service";
import { tourService } from "@/services/tour.service";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { getDisplayName, getAvatarUrl } from "@/lib/userDisplay";
import { analyticsService } from "@/services/analytics.service";
import { crmService } from "@/services/crm.service";
import { formatOverviewValue, getTrend } from "@/lib/analyticsDisplay";
import { DashboardTabPills, listingTypeTabs, partnerRoleTabs } from "@/components/dashboard/DashboardTabPills";
import { isRentalListing } from "@/features/rentals/lib/rentalFormat";
import { liveQueryOptions } from "@/lib/liveQuery";

const pendingProperties = [
  { id: 1, title: "Luxury Villa in Miami", seller: "John Smith", image: property1, submitted: "2 hours ago" },
  { id: 2, title: "Downtown Studio Apt", seller: "Jane Doe", image: property2, submitted: "5 hours ago" },
];

const recentUsers = [
  { name: "Alice Johnson", role: "Buyer", email: "alice@email.com", status: "Active" },
  { name: "Bob Williams", role: "Seller", email: "bob@email.com", status: "Active" },
  { name: "Carol Davis", role: "Agent", email: "carol@email.com", status: "Pending" },
];

const DashboardSidebar = ({ active, role }: { active: string; role: string }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const links: Record<string, { icon: any; label: string; href: string }[]> = {
    admin: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
      { icon: Users, label: "Users", href: "/admin/users" },
      { icon: UserCheck, label: "Partners", href: "/admin/partners" },
      { icon: Home, label: "Properties", href: "/admin/properties" },
      { icon: Megaphone, label: "Ad Campaigns", href: "/admin/ad-campaigns" },
      { icon: Newspaper, label: "News", href: "/admin/news" },
      { icon: Calendar, label: "Tours", href: "/admin/tours" },
      { icon: Star, label: "Feedback", href: "/admin/reviews" },
      { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
      { icon: Shield, label: "Moderation", href: "/admin/moderation" },
      { icon: KeyRound, label: "Password Resets", href: "/admin/password-resets" },
      { icon: MessageSquare, label: "Messages", href: "/admin/messages" },
      { icon: HelpCircle, label: "Help", href: "/admin/help" },
      { icon: Settings, label: "Settings", href: "/admin/settings" },
    ],
    buyer: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/buyer" },
      { icon: Home, label: "Rentals", href: "/rentals" },
      { icon: Search, label: "Buy", href: "/properties" },
      { icon: Heart, label: "Favorites", href: "/buyer/favorites" },
      { icon: Bookmark, label: "Saved Rentals", href: "/buyer/saved-rentals" },
      { icon: FileText, label: "Applications", href: "/buyer/applications" },
      { icon: Calendar, label: "My Tours", href: "/buyer/tours" },
      { icon: MessageSquare, label: "Messages", href: "/buyer/messages" },
      { icon: Bell, label: "Alerts", href: "/buyer/alerts" },
      { icon: HelpCircle, label: "Help", href: "/buyer/help" },
      { icon: Settings, label: "Settings", href: "/buyer/settings" },
    ],
    seller: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/seller" },
      { icon: Home, label: "My Listings", href: "/seller/listings" },
      { icon: Megaphone, label: "Promotions", href: "/seller/promotions" },
      { icon: Users, label: "Buyers", href: "/seller/buyers" },
      { icon: FileText, label: "Applications", href: "/seller/applications" },
      { icon: Calendar, label: "Tour Requests", href: "/seller/tours" },
      { icon: Star, label: "Feedback", href: "/seller/reviews" },
      { icon: BarChart3, label: "Analytics", href: "/seller/analytics" },
      { icon: MessageSquare, label: "Messages", href: "/seller/messages" },
      { icon: HelpCircle, label: "Help", href: "/seller/help" },
      { icon: Settings, label: "Settings", href: "/seller/settings" },
    ],
    agent: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/agent" },
      { icon: Users, label: "Clients", href: "/agent/clients" },
      { icon: Home, label: "Properties", href: "/agent/properties" },
      { icon: Megaphone, label: "Promotions", href: "/agent/promotions" },
      { icon: FileText, label: "Applications", href: "/agent/applications" },
      { icon: CalendarCheck, label: "Tours", href: "/agent/tours" },
      { icon: Calendar, label: "Calendar", href: "/agent/calendar" },
      { icon: Star, label: "Feedback", href: "/agent/reviews" },
      { icon: BarChart3, label: "Performance", href: "/agent/performance" },
      { icon: MessageSquare, label: "Messages", href: "/agent/messages" },
      { icon: HelpCircle, label: "Help", href: "/agent/help" },
      { icon: Settings, label: "Settings", href: "/agent/settings" },
    ],
  };

  return (
    <aside className="w-64 section-dark min-h-screen p-6 flex flex-col fixed left-0 top-0">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-heading font-bold text-sm">H</span>
        </div>
        <span className="font-heading text-sm font-bold text-dark-surface-foreground">
          House Tour <span className="text-primary">Guide</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {(links[role] || links.admin).map((link) => (
          <Link
            key={link.label}
            to={link.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active === link.label
                ? "bg-primary text-primary-foreground"
                : "text-dark-surface-foreground/60 hover:text-dark-surface-foreground hover:bg-dark-surface-muted"
            }`}
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleSignOut}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-surface-foreground/60 hover:text-dark-surface-foreground hover:bg-dark-surface-muted transition-colors mt-4 w-full text-left"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </aside>
  );
};


export { DashboardSidebar };

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: usersData } = useQuery({
    queryKey: ["admin-dashboard-users"],
    queryFn: () => userService.list({ limit: 500 }),
    enabled: isAuthenticated,
    ...liveQueryOptions,
  });
  const { data: propertiesData } = useQuery({
    queryKey: ["admin-dashboard-properties"],
    queryFn: () => propertyService.list({ limit: 500 }),
    ...liveQueryOptions,
  });
  const { data: toursData } = useQuery({
    queryKey: ["admin-dashboard-tours"],
    queryFn: () => tourService.list({ limit: 1000 }),
    enabled: isAuthenticated,
    ...liveQueryOptions,
  });
  const { data: reviewsData } = useQuery({
    queryKey: ["admin-dashboard-reviews"],
    queryFn: () => tourService.listReviews({ limit: 500 }),
    enabled: isAuthenticated,
    ...liveQueryOptions,
  });
  const { data: analyticsData } = useQuery({
    queryKey: ["admin-dashboard-analytics"],
    queryFn: () => analyticsService.admin(),
    enabled: isAuthenticated,
    ...liveQueryOptions,
  });
  const { data: sellersData } = useQuery({
    queryKey: ["crm-partners", "seller"],
    queryFn: () => crmService.partners("seller"),
    enabled: isAuthenticated,
    ...liveQueryOptions,
  });
  const { data: agentsData } = useQuery({
    queryKey: ["crm-partners", "agent"],
    queryFn: () => crmService.partners("agent"),
    enabled: isAuthenticated,
    ...liveQueryOptions,
  });

  const users = usersData?.data || [];
  const properties = propertiesData?.data || [];
  const tours = toursData?.data || [];
  const recentReviews = reviewsData?.data || [];
  const overviewIcons = [Users, Home, Calendar, Star];

  const overviewHrefs: Record<string, string> = {
    "Total Users": "/admin/users",
    "Active Listings": "/admin/properties?tab=active",
    "Scheduled Tours": "/admin/tours",
    "Tour Reviews": "/admin/reviews",
  };

  const dashboardStats = analyticsData?.data?.overview?.length
    ? analyticsData.data.overview.map((item, index) => {
        const { label: changeLabel } = getTrend(item.change);
        return {
          icon: overviewIcons[index] || Users,
          label: item.label,
          value: formatOverviewValue(item),
          change: changeLabel,
          href: overviewHrefs[item.label] || "/admin",
        };
      })
    : [
        { icon: Users, label: "Total Users", value: users.length.toLocaleString(), change: "0%", href: "/admin/users" },
        {
          icon: Home,
          label: "Active Listings",
          value: properties.filter((p) => p.status === "active").length.toLocaleString(),
          change: "0%",
          href: "/admin/properties?tab=active",
        },
        { icon: Calendar, label: "Scheduled Tours", value: tours.length.toLocaleString(), change: "0%", href: "/admin/tours" },
        {
          icon: Star,
          label: "Tour Reviews",
          value: (reviewsData?.total ?? recentReviews.length).toLocaleString(),
          change: "0%",
          href: "/admin/reviews",
        },
      ];

  const moderationItems =
    properties
      .filter((p) => p.status === "pending")
      .slice(0, 3)
      .map((p) => ({
        id: p._id,
        title: p.title,
        seller: `${p.sellerId?.firstName || ""} ${p.sellerId?.lastName || ""}`.trim() || p.sellerId?.email || "Seller",
        image: p.images?.[0]?.url || property1,
        submitted: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-",
      })) || pendingProperties;

  const newestUsers =
    users.slice(0, 5).map((u) => ({
      id: u._id || u.id,
      name: getDisplayName(u),
      role: u.role?.charAt(0).toUpperCase() + u.role?.slice(1),
      email: u.email,
      status: u.status === "active" ? "Active" : u.status || "Active",
      avatar: getAvatarUrl(u),
    })) || recentUsers;

  const sellerPartnerCount = sellersData?.data?.length || 0;
  const agentPartnerCount = agentsData?.data?.length || 0;
  const saleListingCount = properties.filter(
    (p) => p.listingType === "sale" || p.listingType === "both"
  ).length;
  const rentListingCount = properties.filter((p) => isRentalListing(p)).length;

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Dashboard" role="admin" />

      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="lg" />
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Admin Dashboard</h1>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.href}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  stat.change.startsWith("-")
                    ? "text-red-600 bg-red-50"
                    : "text-green-600 bg-green-50"
                }`}>{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Link>
          ))}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading font-bold text-foreground">Partners & Buyers</h2>
              <p className="text-sm text-muted-foreground">
                View sellers and agents with their sale and rental buyer pipelines
              </p>
            </div>
            <Link to="/admin/partners">
              <Button size="sm" variant="outline" className="text-xs">Manage Partners</Button>
            </Link>
          </div>
          <DashboardTabPills
            variant="card"
            tabs={partnerRoleTabs(sellerPartnerCount, agentPartnerCount)}
            activeKey="seller"
            onChange={(key) => navigate(`/admin/partners?role=${key}`)}
            className="mb-2"
          />
          <Link to="/admin/partners" className="block mt-2">
            <Button variant="ghost" size="sm" className="text-xs text-primary px-0 hover:bg-transparent">
              Open full partners view →
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="font-heading font-bold text-foreground mb-4">Listing Mix</h2>
          <DashboardTabPills
            variant="card"
            tabs={listingTypeTabs(properties.length, saleListingCount, rentListingCount)}
            activeKey="all"
            onChange={(key) =>
              navigate(
                key === "all"
                  ? "/admin/properties?tab=all"
                  : `/admin/properties?tab=all&listingType=${key}`
              )
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Moderation */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-foreground">Pending Moderation</h2>
              <Link
                to="/admin/properties?tab=pending"
                className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full hover:bg-primary/20"
              >
                {properties.filter((p) => p.status === "pending").length} pending
              </Link>
            </div>
            <div className="space-y-4">
              {moderationItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No listings waiting for review</p>
              ) : (
                moderationItems.map((prop) => (
                  <Link
                    key={prop.id}
                    to={`/admin/properties/${prop.id}`}
                    className="flex items-center gap-4 p-3 bg-muted rounded-lg hover:bg-muted/80"
                  >
                    <img src={prop.image} alt={prop.title} className="w-16 h-12 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm truncate">{prop.title}</div>
                      <div className="text-xs text-muted-foreground">By {prop.seller} · {prop.submitted}</div>
                    </div>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-foreground">Recent Reviews</h2>
              <Link to="/admin/reviews">
                <Button size="sm" variant="outline" className="text-xs">View All</Button>
              </Link>
            </div>
            {recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {recentReviews.slice(0, 5).map((tour) => (
                  <Link
                    key={tour._id}
                    to={`/admin/tours/${tour._id}`}
                    className="block p-3 bg-muted rounded-lg hover:bg-muted/80"
                  >
                    <div className="font-medium text-foreground text-sm truncate">
                      {tour.propertyId?.title || "Property"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {tour.feedback?.propertyRating}/5 property
                      {tour.feedback?.agentRating ? ` · ${tour.feedback.agentRating}/5 agent` : ""}
                      {" · "}
                      {tour.buyerId?.firstName || tour.buyerId?.email || "Buyer"}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-foreground">Recent Users</h2>
              <Link to="/admin/users">
                <Button size="sm" variant="outline" className="text-xs">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {newestUsers.map((listedUser) => (
                <Link
                  key={listedUser.email}
                  to={listedUser.id ? `/admin/users/${listedUser.id}` : "/admin/users"}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80"
                >
                  <div className="flex items-center gap-3">
                    {listedUser.avatar ? (
                      <img
                        src={listedUser.avatar}
                        alt={listedUser.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-xs">{listedUser.name[0]}</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-foreground text-sm">{listedUser.name}</div>
                      <div className="text-xs text-muted-foreground">{listedUser.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{listedUser.role}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${listedUser.status === "Active" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                      {listedUser.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
