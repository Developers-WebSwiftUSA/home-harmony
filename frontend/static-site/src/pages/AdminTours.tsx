import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { tourService } from "@/services/tour.service";

const AdminTours = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-tours"],
    queryFn: () => tourService.list(),
  });

  const tours = data?.data || [];

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Tours" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Tours</h1>
        <p className="text-sm text-muted-foreground mb-6">Monitor all scheduled tours</p>
        {isLoading ? <p className="text-sm text-muted-foreground mb-4">Loading tours...</p> : null}
        <div className="space-y-3">
          {tours.map((tour) => (
            <div key={tour._id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-foreground">{tour.propertyId?.title || "Property"}</h3>
                <p className="text-xs text-muted-foreground">
                  {tour.date ? new Date(tour.date).toLocaleDateString() : "-"} · {tour.startTime} - {tour.endTime}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">{tour.status}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminTours;

