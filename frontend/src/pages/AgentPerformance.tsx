import { useQuery } from "@tanstack/react-query";
import { BarChart3, Star, Calendar, Home } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { analyticsService } from "@/services/analytics.service";
import { useAuth } from "@/context/AuthContext";

const AgentPerformance = () => {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["agent-analytics"],
    queryFn: () => analyticsService.agent(),
    enabled: isAuthenticated,
  });

  const analytics = data?.data;
  const maxTours = Math.max(...(analytics?.toursByMonth.map((m) => m.tours) || [1]), 1);
  const overviewIcons = [Home, Calendar, Calendar, Calendar];

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.overview.map((stat, index) => {
                const Icon = overviewIcons[index] || BarChart3;
                return (
                  <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-1">Total Tours</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totals.tours}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <p className="text-xs text-muted-foreground">Average Rating</p>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.totals.averageRating > 0 ? analytics.totals.averageRating.toFixed(1) : "—"}
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-1">Customer Reviews</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totals.reviews}</p>
              </div>
            </div>

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
