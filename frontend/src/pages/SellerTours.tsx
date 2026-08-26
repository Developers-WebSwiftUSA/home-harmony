import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Calendar, Search, Filter } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { tourService } from "@/services/tour.service";
import { Input } from "@/components/ui/input";
import TourNotification from "@/components/tours/TourNotification";
import { useAuth } from "@/context/AuthContext";

const SellerTours = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const role = user?.role === "agent" ? "agent" : "seller";
  const sidebarActive = role === "agent" ? "Tours" : "Tour Requests";
  const toursQueryKey = role === "agent" ? "agent-tours" : "seller-tours";

  const { data, isLoading } = useQuery({
    queryKey: [toursQueryKey, statusFilter],
    queryFn: () => tourService.list({ status: statusFilter !== "all" ? statusFilter : undefined }),
  });

  const tours = data?.data || [];

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.propertyId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.propertyId?.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.buyerId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.buyerId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleViewTour = (tourId: string) => {
    navigate(`/${role}/tours/${tourId}`);
  };

  const pendingTours = filteredTours.filter((tour) => tour.status === "pending");
  const confirmedTours = filteredTours.filter((tour) => tour.status === "confirmed");
  const rescheduleTours = filteredTours.filter(
    (tour) =>
      tour.status === "reschedule_requested" ||
      tour.status === "reschedule_pending_buyer_approval"
  );

  // Calculate stats
  const stats = {
    pending: tours.filter((t) => t.status === "pending").length,
    confirmed: tours.filter((t) => t.status === "confirmed").length,
    reschedule: tours.filter(
      (t) => t.status === "reschedule_requested" || t.status === "reschedule_pending_buyer_approval"
    ).length,
    total: tours.length,
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active={sidebarActive} role={role} />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            {role === "agent" ? "Assigned Tours" : "Tour Requests"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {role === "agent"
              ? "Manage tour requests for properties assigned to you"
              : "Manage and respond to tour requests for your properties"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tours</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-sm text-green-600">Confirmed</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.reschedule}</div>
            <div className="text-sm text-blue-600">Reschedule</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by property, buyer name, or location..."
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
                <option value="reschedule_pending_buyer_approval">Awaiting Buyer Approval</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="declined">Declined</option>
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

            {/* Reschedule Requests */}
            {rescheduleTours.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  Reschedule Requests ({rescheduleTours.length})
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

            {/* Confirmed Tours */}
            {confirmedTours.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  Confirmed Tours ({confirmedTours.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {confirmedTours.map((tour) => (
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
                !pendingTours.includes(tour) &&
                !confirmedTours.includes(tour) &&
                !rescheduleTours.includes(tour)
            ).length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">All Tours</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTours
                    .filter(
                      (tour) =>
                        !pendingTours.includes(tour) &&
                        !confirmedTours.includes(tour) &&
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

export default SellerTours;
