import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { tourService } from "@/services/tour.service";

const AgentPerformance = () => {
  const { data } = useQuery({
    queryKey: ["agent-performance-tours"],
    queryFn: () => tourService.list(),
  });

  const tours = data?.data || [];
  const pending = tours.filter((t) => t.status === "pending").length;
  const confirmed = tours.filter((t) => t.status === "confirmed").length;
  const completed = tours.filter((t) => t.status === "completed").length;

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Performance" role="agent" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Performance</h1>
        <p className="text-sm text-muted-foreground mb-6">Your tour and engagement metrics</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground">Pending Tours</p>
            <p className="text-2xl font-bold text-foreground">{pending}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground">Confirmed Tours</p>
            <p className="text-2xl font-bold text-foreground">{confirmed}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground">Completed Tours</p>
            <p className="text-2xl font-bold text-foreground">{completed}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentPerformance;

