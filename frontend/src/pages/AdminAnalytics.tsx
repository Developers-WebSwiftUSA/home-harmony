import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { DashboardSidebar } from "./AdminDashboard";
import { analyticsService } from "@/services/analytics.service";
import { useAuth } from "@/context/AuthContext";
import { formatOverviewValue } from "@/lib/analyticsDisplay";
import { liveQueryOptions } from "@/lib/liveQuery";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";

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
            <DashboardTabPills
              activeKey=""
              tabs={analytics.overview.map((stat) => ({
                key: stat.label,
                label: stat.label,
                count: formatOverviewValue(stat),
                href: overviewHrefs[stat.label] || "/admin",
              }))}
            />

            <DashboardTabPills
              activeKey=""
              tabs={[
                {
                  key: "views",
                  label: "Total Property Views",
                  count: analytics.totals.views.toLocaleString(),
                  href: "/admin/properties",
                },
                {
                  key: "inquiries",
                  label: "Total Inquiries",
                  count: analytics.totals.inquiries.toLocaleString(),
                  href: "/admin/properties",
                },
                {
                  key: "pending",
                  label: "Pending Moderation",
                  count: analytics.totals.pendingProperties,
                  href: "/admin/properties?tab=pending",
                },
              ]}
            />

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
