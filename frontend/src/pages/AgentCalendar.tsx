import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { tourService } from "@/services/tour.service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTourDateString, isTourPast, isTourUpcoming } from "@/lib/tourDate";
import { Tour } from "@/types/models";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
  reschedule_pending_buyer_approval: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  reschedule_requested: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  declined: "bg-red-500/10 text-red-600 border-red-500/20",
};

const AgentCalendar = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["agent-calendar-tours"],
    queryFn: () => tourService.list({ limit: 100 }),
  });

  const tours = data?.data || [];

  const { upcoming, past } = useMemo(() => {
    const upcomingTours: Tour[] = [];
    const pastTours: Tour[] = [];

    tours.forEach((tour) => {
      if (["cancelled", "declined", "completed"].includes(tour.status) || isTourPast(tour.date, tour.startTime)) {
        pastTours.push(tour);
      } else if (isTourUpcoming(tour.date, tour.startTime) || tour.status === "pending") {
        upcomingTours.push(tour);
      } else {
        pastTours.push(tour);
      }
    });

    upcomingTours.sort((a, b) => {
      const dateA = getTourDateString(a.date);
      const dateB = getTourDateString(b.date);
      return dateA.localeCompare(dateB) || a.startTime.localeCompare(b.startTime);
    });

    pastTours.sort((a, b) => {
      const dateA = getTourDateString(a.date);
      const dateB = getTourDateString(b.date);
      return dateB.localeCompare(dateA) || b.startTime.localeCompare(a.startTime);
    });

    return { upcoming: upcomingTours, past: pastTours };
  }, [tours]);

  const renderTourCard = (tour: Tour) => (
    <div
      key={tour._id}
      className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate">
            {tour.propertyId?.title || "Property Tour"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {tour.buyerId?.firstName || tour.buyerId?.email || "Buyer"}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {tour.date ? new Date(tour.date).toLocaleDateString() : "-"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {tour.startTime} - {tour.endTime}
            </span>
          </div>
          <span
            className={cn(
              "inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full capitalize border",
              statusStyles[tour.status] || "bg-muted text-muted-foreground border-border"
            )}
          >
            {tour.status.replace(/_/g, " ")}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1 shrink-0"
          onClick={() => navigate(`/agent/tours/${tour._id}`)}
        >
          View
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Calendar" role="agent" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Calendar</h1>
        <p className="text-sm text-muted-foreground mb-6">Your upcoming tours and appointments</p>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading calendar...</p>
        ) : tours.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tours scheduled yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-lg font-heading font-bold text-foreground mb-4">
                  Upcoming ({upcoming.length})
                </h2>
                <div className="space-y-3">{upcoming.map(renderTourCard)}</div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 className="text-lg font-heading font-bold text-foreground mb-4">
                  Past & Closed ({past.length})
                </h2>
                <div className="space-y-3">{past.map(renderTourCard)}</div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentCalendar;
