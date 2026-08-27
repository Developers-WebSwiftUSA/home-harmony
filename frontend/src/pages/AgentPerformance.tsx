import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { analyticsService } from "@/services/analytics.service";
import { useAuth } from "@/context/AuthContext";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";

const AgentPerformance = () => {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["agent-analytics"],
    queryFn: () => analyticsService.agent(),
    enabled: isAuthenticated,
  });

  const analytics = data?.data;
  const maxTours = Math.max(...(analytics?.toursByMonth.map((m) => m.tours) || [1]), 1);

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Performance" role="agent" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Performance</h1>
        <p className="text-sm text-muted-foreground mb-6">Your tour and engagement metrics</p>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading performance data...</p>
        ) : analytics ? (
          <div className="space-y-6">
            <DashboardTabPills
              activeKey=""
              tabs={analytics.overview.map((stat) => ({
                key: stat.label,
                label: stat.label,
                count: stat.value.toLocaleString(),
                href: "/agent/tours",
              }))}
            />

            <DashboardTabPills
              activeKey=""
              tabs={[
                { key: "tours", label: "Total Tours", count: analytics.totals.tours, href: "/agent/tours" },
                {
                  key: "agent",
                  label: "Average Rating",
                  count: analytics.totals.averageRating > 0 ? analytics.totals.averageRating.toFixed(1) : "—",
                  href: "/agent/reviews",
                },
                {
                  key: "reviews",
                  label: "Customer Reviews",
                  count: analytics.totals.reviews,
                  href: "/agent/reviews",
                },
              ]}
            />

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading font-bold text-foreground mb-4">Tours Over Time</h2>
              <div className="space-y-3">
                {analytics.toursByMonth.map((item) => (
                  <div key={item.month} className="flex items-center gap-4">
                    <div className="w-12 text-xs text-muted-foreground">{item.month}</div>
                    <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${maxTours ? (item.tours / maxTours) * 100 : 0}%` }}
                      >
                        <span className="text-xs text-primary-foreground font-medium">{item.tours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading font-bold text-foreground mb-4">Tour Status Breakdown</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Pending", value: analytics.totals.pending, color: "text-yellow-600" },
                  { label: "Confirmed", value: analytics.totals.confirmed, color: "text-green-600" },
                  { label: "Completed", value: analytics.totals.completed, color: "text-primary" },
                  { label: "Cancelled/Declined", value: analytics.totals.cancelled, color: "text-red-600" },
                ].map((item) => (
                  <div key={item.label} className="bg-muted rounded-lg p-4 text-center">
                    <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Unable to load performance data.</p>
        )}
      </main>
    </div>
  );
};

export default AgentPerformance;
