import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Users, Home, Calendar, Star, Eye, MessageSquare } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { analyticsService } from "@/services/analytics.service";
import { useAuth } from "@/context/AuthContext";
import { formatOverviewValue, getTrend } from "@/lib/analyticsDisplay";
import { ArrowDown, ArrowUp } from "lucide-react";
import { liveQueryOptions } from "@/lib/liveQuery";

const overviewIcons = [Users, Home, Calendar, Star];

const overviewHrefs: Record<string, string> = {
  "Total Users": "/admin/users",
  "Active Listings": "/admin/properties?tab=active",
  "Scheduled Tours": "/admin/tours",
  "Tour Reviews": "/admin/reviews",
};

const roleHrefs: Record<string, string> = {
  admin: "/admin/users?role=admin",
  buyer: "/admin/users?role=buyer",
  seller: "/admin/users?role=seller",
  agent: "/admin/users?role=agent",
};

const AdminAnalytics = () => {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => analyticsService.admin(),
    enabled: isAuthenticated,
    ...liveQueryOptions,
  });

  const analytics = data?.data;
  const maxGrowth = Math.max(
    ...(analytics?.growthByMonth.map((m) => m.users + m.properties + m.tours) || [1]),
    1
  );
  const maxTopViews = Math.max(...(analytics?.topProperties.map((p) => p.views) || [1]), 1);

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Analytics" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-sm text-muted-foreground mb-6">Platform-wide performance overview</p>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        ) : analytics ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.overview.map((stat, index) => {
                const Icon = overviewIcons[index] || Users;
                const { trend, label } = getTrend(stat.change);
                const href = overviewHrefs[stat.label] || "/admin";
                return (
                  <Link
                    key={stat.label}
                    to={href}
                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs font-medium ${
                          trend === "up" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {trend === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {label}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{formatOverviewValue(stat)}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </Link>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admin/properties" className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Total Property Views</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{analytics.totals.views.toLocaleString()}</p>
              </Link>
              <Link to="/admin/properties" className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Total Inquiries</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{analytics.totals.inquiries.toLocaleString()}</p>
              </Link>
              <Link to="/admin/properties?tab=pending" className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all">
                <p className="text-xs text-muted-foreground mb-2">Pending Moderation</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totals.pendingProperties}</p>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-heading font-bold text-foreground mb-4">Platform Growth (6 months)</h2>
                <div className="space-y-3">
                  {analytics.growthByMonth.map((item) => {
                    const total = item.users + item.properties + item.tours;
                    return (
                      <div key={item.month} className="flex items-center gap-4">
                        <div className="w-12 text-xs text-muted-foreground">{item.month}</div>
                        <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(total / maxGrowth) * 100}%` }}
                          >
                            <span className="text-xs text-primary-foreground font-medium">{total}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Combined new users, properties, and tours per month
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-heading font-bold text-foreground mb-4">Users by Role</h2>
                <div className="space-y-4">
                  {Object.entries(analytics.usersByRole).map(([role, count]) => {
                    const pct = analytics.totals.users
                      ? Math.round((count / analytics.totals.users) * 100)
                      : 0;
                    return (
                      <Link key={role} to={roleHrefs[role] || "/admin/users"} className="block hover:opacity-90">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground capitalize">{role}</span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading font-bold text-foreground mb-4">Top Properties by Views</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Property</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Seller</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Views</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Inquiries</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topProperties.map((prop) => (
                      <tr key={prop.id} className="border-b border-border">
                        <td className="py-3 px-4 text-sm text-foreground">
                          <Link to={`/admin/properties/${prop.id}`} className="hover:text-primary">
                            {prop.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{prop.seller}</td>
                        <td className="py-3 px-4 text-right text-sm">{prop.views}</td>
                        <td className="py-3 px-4 text-right text-sm">{prop.inquiries}</td>
                        <td className="py-3 px-4 text-right text-sm text-green-600">{prop.conversion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {analytics.topProperties.length > 0 && (
                <div className="mt-4 space-y-2">
                  {analytics.topProperties.slice(0, 3).map((prop) => (
                    <div key={`bar-${prop.id}`} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-32 truncate">{prop.name}</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(prop.views / maxTopViews) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Unable to load analytics.</p>
        )}
      </main>
    </div>
  );
};

export default AdminAnalytics;
