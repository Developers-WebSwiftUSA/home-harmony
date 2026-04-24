import { BarChart3, TrendingUp, TrendingDown, Eye, Calendar, DollarSign, Users, Home, ArrowUp, ArrowDown } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";

const analyticsData = {
  overview: [
    { label: "Total Views", value: "1,247", change: "+12%", trend: "up", icon: Eye },
    { label: "Inquiries", value: "48", change: "+8%", trend: "up", icon: Users },
    { label: "Tour Requests", value: "12", change: "-3%", trend: "down", icon: Calendar },
    { label: "Avg. Price", value: "$651K", change: "+5%", trend: "up", icon: DollarSign },
  ],
  viewsByMonth: [
    { month: "Oct", views: 320 },
    { month: "Nov", views: 380 },
    { month: "Dec", views: 410 },
    { month: "Jan", views: 450 },
    { month: "Feb", views: 520 },
  ],
  topProperties: [
    { name: "Downtown Smart Apartments", views: 456, inquiries: 23, conversion: "5.0%" },
    { name: "Peninsula Apartments", views: 234, inquiries: 12, conversion: "5.1%" },
    { name: "Garden View Residence", views: 89, inquiries: 5, conversion: "5.6%" },
  ],
  inquiriesBySource: [
    { source: "Property Listings", count: 28, percentage: 58 },
    { source: "Direct Contact", count: 12, percentage: 25 },
    { source: "Agent Referral", count: 8, percentage: 17 },
  ],
};

const SellerAnalytics = () => {
  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Analytics" role="seller" />

      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">Track your property performance and insights</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground outline-none">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
            </select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analyticsData.overview.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.trend === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Views Over Time */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-heading font-bold text-foreground mb-4">Views Over Time</h2>
            <div className="space-y-3">
              {analyticsData.viewsByMonth.map((item, i) => (
                <div key={item.month} className="flex items-center gap-4">
                  <div className="w-12 text-xs text-muted-foreground">{item.month}</div>
                  <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(item.views / 520) * 100}%` }}
                    >
                      <span className="text-xs text-primary-foreground font-medium">{item.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inquiries by Source */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-heading font-bold text-foreground mb-4">Inquiries by Source</h2>
            <div className="space-y-4">
              {analyticsData.inquiriesBySource.map((item) => (
                <div key={item.source}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{item.source}</span>
                    <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
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

        {/* Top Performing Properties */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-foreground">Top Performing Properties</h2>
            <button className="text-xs text-primary hover:underline">View All</button>
          </div>
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
                {analyticsData.topProperties.map((prop, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground text-sm">{prop.name}</div>
                    </td>
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
        </div>
      </main>
    </div>
  );
};

export default SellerAnalytics;
