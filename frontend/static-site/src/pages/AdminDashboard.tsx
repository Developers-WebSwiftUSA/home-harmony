import { Link } from "react-router-dom";
import { LayoutDashboard, Users, Home, Calendar, BarChart3, Shield, Bell, MessageSquare, Settings, LogOut, CheckCircle, XCircle, Clock, TrendingUp, Eye, KeyRound, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import { userService } from "@/services/user.service";
import { propertyService } from "@/services/property.service";
import { tourService } from "@/services/tour.service";

const stats = [
  { icon: Users, label: "Total Users", value: "2,847", change: "+12%", color: "text-primary" },
  { icon: Home, label: "Active Listings", value: "1,234", change: "+8%", color: "text-primary" },
  { icon: Calendar, label: "Scheduled Tours", value: "342", change: "+15%", color: "text-primary" },
  { icon: TrendingUp, label: "Revenue", value: "$128K", change: "+22%", color: "text-primary" },
];

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
  const links: Record<string, { icon: any; label: string; href: string }[]> = {
    admin: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
      { icon: Users, label: "Users", href: "/admin/users" },
      { icon: Home, label: "Properties", href: "/admin/properties" },
      { icon: Calendar, label: "Tours", href: "/admin/tours" },
      { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
      { icon: Shield, label: "Moderation", href: "/admin/moderation" },
      { icon: KeyRound, label: "Password Resets", href: "/admin/password-resets" },
      { icon: MessageSquare, label: "Messages", href: "/admin/messages" },
      { icon: Settings, label: "Settings", href: "/admin/settings" },
    ],
    buyer: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/buyer" },
      { icon: Home, label: "Search", href: "/properties" },
      { icon: Heart, label: "Favorites", href: "/buyer/favorites" },
      { icon: Calendar, label: "My Tours", href: "/buyer/tours" },
      { icon: MessageSquare, label: "Messages", href: "/buyer/messages" },
      { icon: Bell, label: "Alerts", href: "/buyer/alerts" },
      { icon: Settings, label: "Settings", href: "/buyer/settings" },
    ],
    seller: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/seller" },
      { icon: Home, label: "My Listings", href: "/seller/listings" },
      { icon: Calendar, label: "Tour Requests", href: "/seller/tours" },
      { icon: BarChart3, label: "Analytics", href: "/seller/analytics" },
      { icon: MessageSquare, label: "Messages", href: "/seller/messages" },
      { icon: Settings, label: "Settings", href: "/seller/settings" },
    ],
    agent: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/agent" },
      { icon: Users, label: "Clients", href: "/agent/clients" },
      { icon: Home, label: "Properties", href: "/agent/properties" },
      { icon: Calendar, label: "Calendar", href: "/agent/calendar" },
      { icon: BarChart3, label: "Performance", href: "/agent/performance" },
      { icon: MessageSquare, label: "Messages", href: "/agent/messages" },
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

      <Link to="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-surface-foreground/60 hover:text-dark-surface-foreground hover:bg-dark-surface-muted transition-colors mt-4">
        <LogOut className="w-4 h-4" /> Sign Out
      </Link>
    </aside>
  );
};


export { DashboardSidebar };

const AdminDashboard = () => {
  const { data: usersData } = useQuery({
    queryKey: ["admin-dashboard-users"],
    queryFn: () => userService.list(),
  });
  const { data: propertiesData } = useQuery({
    queryKey: ["admin-dashboard-properties"],
    queryFn: () => propertyService.list({ status: "" }),
  });
  const { data: toursData } = useQuery({
    queryKey: ["admin-dashboard-tours"],
    queryFn: () => tourService.list(),
  });

  const users = usersData?.data || [];
  const properties = propertiesData?.data || [];
  const tours = toursData?.data || [];

  const dashboardStats = [
    { icon: Users, label: "Total Users", value: users.length.toLocaleString(), change: "+--%", color: "text-primary" },
    { icon: Home, label: "Active Listings", value: properties.filter((p) => p.status === "active").length.toLocaleString(), change: "+--%", color: "text-primary" },
    { icon: Calendar, label: "Scheduled Tours", value: tours.length.toLocaleString(), change: "+--%", color: "text-primary" },
    { icon: TrendingUp, label: "Revenue", value: "$--", change: "--", color: "text-primary" },
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
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User",
      role: u.role?.charAt(0).toUpperCase() + u.role?.slice(1),
      email: u.email,
      status: "Active",
    })) || recentUsers;

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Dashboard" role="admin" />

      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-card transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
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

          {/* Recent Users */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-foreground">Recent Users</h2>
              <Button size="sm" variant="outline" className="text-xs">View All</Button>
            </div>
            <div className="space-y-3">
              {newestUsers.map((user) => (
                <div key={user.email} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-xs">{user.name[0]}</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{user.role}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.status === "Active" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                      {user.status}
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
