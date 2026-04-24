import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { userService } from "@/services/user.service";
import { propertyService } from "@/services/property.service";
import { tourService } from "@/services/tour.service";

const AdminAnalytics = () => {
  const { data: usersData } = useQuery({
    queryKey: ["admin-analytics-users"],
    queryFn: () => userService.list(),
  });
  const { data: propertiesData } = useQuery({
    queryKey: ["admin-analytics-properties"],
    queryFn: () => propertyService.list({ status: "" }),
  });
  const { data: toursData } = useQuery({
    queryKey: ["admin-analytics-tours"],
    queryFn: () => tourService.list(),
  });

  const users = usersData?.data || [];
  const properties = propertiesData?.data || [];
  const tours = toursData?.data || [];

  const activeProperties = properties.filter((p) => p.status === "active").length;
  const pendingProperties = properties.filter((p) => p.status === "pending").length;

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Analytics" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-sm text-muted-foreground mb-6">Platform-wide performance overview</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground">Total Properties</p>
            <p className="text-2xl font-bold text-foreground">{properties.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground">Active Properties</p>
            <p className="text-2xl font-bold text-foreground">{activeProperties}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground">Total Tours</p>
            <p className="text-2xl font-bold text-foreground">{tours.length}</p>
          </div>
        </div>
        <div className="mt-6 bg-card border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground">
            Pending moderation queue: <span className="font-medium text-foreground">{pendingProperties}</span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;

