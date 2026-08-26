import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Home, Calendar, CalendarCheck, BarChart3, Shield, Bell, MessageSquare, Settings, LogOut, CheckCircle, XCircle, Clock, Eye, KeyRound, Heart, Star, Bookmark, Search, FileText, UserCheck, Megaphone, HelpCircle } from "lucide-react";
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
    queryFn: () => userService.list({ limit: 200 }),
    enabled: isAuthenticated,
  });
  const { data: propertiesData } = useQuery({
    queryKey: ["admin-dashboard-properties"],
    queryFn: () => propertyService.list({ status: "" }),
  });
  const { data: toursData } = useQuery({
    queryKey: ["admin-dashboard-tours"],
    queryFn: () => tourService.list({ limit: 200 }),
    enabled: isAuthenticated,
  });
  const { data: reviewsData } = useQuery({
    queryKey: ["admin-dashboard-reviews"],
    queryFn: () => tourService.listReviews({ limit: 10 }),
    enabled: isAuthenticated,
  });
  const { data: analyticsData } = useQuery({
    queryKey: ["admin-dashboard-analytics"],
    queryFn: () => analyticsService.admin(),
    enabled: isAuthenticated,
  });
  const { data: sellersData } = useQuery({
    queryKey: ["crm-partners", "seller"],
    queryFn: () => crmService.partners("seller"),
    enabled: isAuthenticated,
  });
  const { data: agentsData } = useQuery({
    queryKey: ["crm-partners", "agent"],
    queryFn: () => crmService.partners("agent"),
    enabled: isAuthenticated,
  });

  const users = usersData?.data || [];
  const properties = propertiesData?.data || [];
  const tours = toursData?.data || [];
  const recentReviews = reviewsData?.data || [];
  const overviewIcons = [Users, Home, Calendar, Star];

  const dashboardStats = analyticsData?.data?.overview?.length
    ? analyticsData.data.overview.map((item, index) => {
        const { label: changeLabel } = getTrend(item.change);
        return {
          icon: overviewIcons[index] || Users,
          label: item.label,
          value: formatOverviewValue(item),
          change: changeLabel,
        };
      })
    : [
        { icon: Users, label: "Total Users", value: users.length.toLocaleString(), change: "0%" },
        {
          icon: Home,
          label: "Active Listings",
          value: properties.filter((p) => p.status === "active").length.toLocaleString(),
          change: "0%",
        },
        { icon: Calendar, label: "Scheduled Tours", value: tours.length.toLocaleString(), change: "0%" },
        {
          icon: Star,
          label: "Tour Reviews",
          value: (reviewsData?.total ?? recentReviews.length).toLocaleString(),
          change: "0%",
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
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
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
            </div>
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
            onChange={() => navigate("/admin/partners")}
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
            onChange={() => navigate("/admin/properties")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Moderation */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-foreground">Pending Moderation</h2>
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">2 pending</span>
            </div>
            <div className="space-y-4">
              {moderationItems.map((prop) => (
                <div key={prop.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <img src={prop.image} alt={prop.title} className="w-16 h-12 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm truncate">{prop.title}</div>
                    <div className="text-xs text-muted-foreground">By {prop.seller} · {prop.submitted}</div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-md hover:bg-green-100 transition-colors"><CheckCircle className="w-4 h-4 text-green-600" /></button>
                    <button className="p-1.5 rounded-md hover:bg-red-100 transition-colors"><XCircle className="w-4 h-4 text-destructive" /></button>
                    <button className="p-1.5 rounded-md hover:bg-card transition-colors"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                </div>
              ))}
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
                  <div key={tour._id} className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-foreground text-sm truncate">
                      {tour.propertyId?.title || "Property"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {tour.feedback?.propertyRating}/5 property
                      {tour.feedback?.agentRating ? ` · ${tour.feedback.agentRating}/5 agent` : ""}
                      {" · "}
                      {tour.buyerId?.firstName || tour.buyerId?.email || "Buyer"}
                    </div>
                  </div>
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
                <div key={listedUser.email} className="flex items-center justify-between p-3 bg-muted rounded-lg">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
