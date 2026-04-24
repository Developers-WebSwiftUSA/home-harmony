import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { tourService } from "@/services/tour.service";

const AgentCalendar = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["agent-calendar-tours"],
    queryFn: () => tourService.list(),
  });

  const tours = data?.data || [];

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Calendar" role="agent" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Calendar</h1>
        <p className="text-sm text-muted-foreground mb-6">Your upcoming tours and appointments</p>
        {isLoading ? <p className="text-sm text-muted-foreground mb-4">Loading calendar...</p> : null}
        <div className="space-y-3">
          {tours.map((tour) => (
            <div key={tour._id} className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-medium text-foreground">{tour.propertyId?.title || "Property Tour"}</h3>
              <p className="text-xs text-muted-foreground">
                {tour.date ? new Date(tour.date).toLocaleDateString() : "-"} · {tour.startTime} - {tour.endTime}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AgentCalendar;

