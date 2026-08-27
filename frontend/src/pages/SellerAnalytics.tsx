import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { analyticsService } from "@/services/analytics.service";
import { useAuth } from "@/context/AuthContext";
import { formatOverviewValue } from "@/lib/analyticsDisplay";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";

const SellerAnalytics = () => {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["seller-analytics"],
    queryFn: () => analyticsService.seller(),
    enabled: isAuthenticated,
  });

  const analytics = data?.data;
  const maxViews = Math.max(...(analytics?.viewsByMonth.map((m) => m.views) || [1]), 1);

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Analytics" role="seller" />

      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">Track your property performance and insights</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        ) : analytics ? (
          <>
            <DashboardTabPills
              className="mb-8"
              activeKey=""
              tabs={analytics.overview.map((stat) => ({
                key: stat.label,
                label: stat.label,
                count: formatOverviewValue(stat),
                href: "/seller/listings",
              }))}
            />

            <DashboardTabPills
              className="mb-8"
              activeKey=""
              tabs={[
                {
                  key: "active",
                  label: "Active Listings",
                  count: analytics.listingBreakdown.active,
                  href: "/seller/listings",
                },
                {
                  key: "pending",
                  label: "Pending Listings",
                  count: analytics.listingBreakdown.pending,
                  href: "/seller/listings",
                },
                {
                  key: "sold",
                  label: "Sold Listings",
                  count: analytics.listingBreakdown.sold,
                  href: "/seller/listings",
                },
                {
                  key: "rented",
                  label: "Rented Listings",
                  count: analytics.listingBreakdown.rented,
                  href: "/seller/listings",
                },
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-heading font-bold text-foreground mb-4">Views Over Time</h2>
                <div className="space-y-3">
                  {analytics.viewsByMonth.map((item) => (
                    <div key={item.month} className="flex items-center gap-4">
                      <div className="w-12 text-xs text-muted-foreground">{item.month}</div>
                      <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${maxViews ? (item.views / maxViews) * 100 : 0}%` }}
                        >
                          <span className="text-xs text-primary-foreground font-medium">{item.views}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-heading font-bold text-foreground mb-4">Inquiries by Source</h2>
                <div className="space-y-4">
                  {analytics.inquiriesBySource.map((item) => (
                    <div key={item.source}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{item.source}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading font-bold text-foreground mb-4">Top Performing Properties</h2>
              {analytics.topProperties.length === 0 ? (
                <p className="text-sm text-muted-foreground">No property data yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Property</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Views</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Inquiries</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Conversion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topProperties.map((prop) => (
                        <tr key={prop.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-foreground text-sm">{prop.name}</td>
                          <td className="py-3 px-4 text-right text-sm text-foreground">{prop.views}</td>
                          <td className="py-3 px-4 text-right text-sm text-foreground">{prop.inquiries}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-sm font-medium text-green-600">{prop.conversion}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Unable to load analytics.</p>
        )}
      </main>
    </div>
  );
};

export default SellerAnalytics;
