import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Search, Filter } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { tourService } from "@/services/tour.service";
import { Input } from "@/components/ui/input";
import TourNotification from "@/components/tours/TourNotification";

const BuyerTours = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["buyer-tours", statusFilter],
    queryFn: () => tourService.list({ status: statusFilter !== "all" ? statusFilter : undefined }),
  });

  const tours = data?.data || [];

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
    (tour) =>
      tour.status === "confirmed" &&
      new Date(`${tour.date}T${tour.startTime}`) > new Date()
  );
  const pendingTours = filteredTours.filter((tour) => tour.status === "pending");
  const rescheduleTours = filteredTours.filter(
    (tour) =>
      tour.status === "reschedule_requested" ||
      tour.status === "reschedule_pending_buyer_approval"
  );

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Tours" role="buyer" />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">My Tours</h1>
          <p className="text-sm text-muted-foreground">Manage and track your property tours</p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by property name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground outline-none"
              >
                <option value="all">All Tours</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="reschedule_requested">Reschedule Requested</option>
                <option value="reschedule_pending_buyer_approval">Awaiting My Approval</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
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
