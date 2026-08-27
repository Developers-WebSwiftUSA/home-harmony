import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Calendar, Search } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { tourService } from "@/services/tour.service";
import { Input } from "@/components/ui/input";
import TourNotification from "@/components/tours/TourNotification";
import { isTourUpcoming } from "@/lib/tourDate";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";
import type { Tour } from "@/types/models";

const RESCHEDULE_STATUSES = new Set([
  "reschedule_requested",
  "reschedule_pending_buyer_approval",
]);

const tourMatchesPill = (tour: Tour, key: string) => {
  if (key === "all") return true;
  if (key === "reschedule") return RESCHEDULE_STATUSES.has(tour.status);
  return tour.status === key;
};

const BuyerTours = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["buyer-tours"],
    queryFn: () => tourService.list(),
  });

  const allTours = data?.data || [];
  const tours = useMemo(
    () => allTours.filter((tour) => tourMatchesPill(tour, statusFilter)),
    [allTours, statusFilter]
  );

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.propertyId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.propertyId?.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleViewTour = (tourId: string) => {
    navigate(`/buyer/tours/${tourId}`);
  };

  const upcomingTours = filteredTours.filter(
    (tour) => tour.status === "confirmed" && isTourUpcoming(tour.date, tour.startTime)
  );
  const pendingTours = filteredTours.filter((tour) => tour.status === "pending");
  const rescheduleTours = filteredTours.filter(
    (tour) =>
      tour.status === "reschedule_requested" ||
      tour.status === "reschedule_pending_buyer_approval"
  );

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="My Tours" role="buyer" />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">My Tours</h1>
          <p className="text-sm text-muted-foreground">Manage and track your property tours</p>
        </div>

        <DashboardTabPills
          className="mb-6"
          activeKey={statusFilter}
          onChange={setStatusFilter}
          tabs={[
            { key: "all", label: "Total Tours", count: allTours.length },
            { key: "pending", label: "Pending", count: allTours.filter((t) => t.status === "pending").length },
            { key: "confirmed", label: "Confirmed", count: allTours.filter((t) => t.status === "confirmed").length },
            {
              key: "reschedule",
              label: "Reschedule",
              count: allTours.filter((t) => RESCHEDULE_STATUSES.has(t.status)).length,
            },
            { key: "completed", label: "Completed", count: allTours.filter((t) => t.status === "completed").length },
          ]}
        />

        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by property name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tours...</p>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tours found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Tours */}
            {upcomingTours.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  Upcoming Tours ({upcomingTours.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingTours.map((tour) => (
                    <TourNotification
                      key={tour._id}
                      tour={tour}
                      onView={() => handleViewTour(tour._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Approval */}
            {rescheduleTours.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  Awaiting Your Approval ({rescheduleTours.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rescheduleTours.map((tour) => (
                    <TourNotification
                      key={tour._id}
                      tour={tour}
                      onView={() => handleViewTour(tour._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Tours */}
            {pendingTours.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  Pending Approval ({pendingTours.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingTours.map((tour) => (
                    <TourNotification
                      key={tour._id}
                      tour={tour}
                      onView={() => handleViewTour(tour._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Other Tours */}
            {filteredTours.filter(
              (tour) =>
                !upcomingTours.includes(tour) &&
                !pendingTours.includes(tour) &&
                !rescheduleTours.includes(tour)
            ).length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">All Tours</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTours
                    .filter(
                      (tour) =>
                        !upcomingTours.includes(tour) &&
                        !pendingTours.includes(tour) &&
                        !rescheduleTours.includes(tour)
                    )
                    .map((tour) => (
                      <TourNotification
                        key={tour._id}
                        tour={tour}
                        onView={() => handleViewTour(tour._id)}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default BuyerTours;
