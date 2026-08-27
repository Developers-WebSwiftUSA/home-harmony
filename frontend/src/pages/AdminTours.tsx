import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, Search, Filter } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { tourService } from "@/services/tour.service";
import { Input } from "@/components/ui/input";
import TourNotification from "@/components/tours/TourNotification";
import { liveQueryOptions } from "@/lib/liveQuery";
import { cn } from "@/lib/utils";
import type { Tour } from "@/types/models";

const RESCHEDULE_STATUSES = new Set([
  "reschedule_requested",
  "reschedule_pending_buyer_approval",
]);

type TourPillKey = "all" | "pending" | "confirmed" | "reschedule" | "completed";

const tourMatchesPill = (tour: Tour, key: string) => {
  if (key === "all") return true;
  if (key === "reschedule") return RESCHEDULE_STATUSES.has(tour.status);
  return tour.status === key;
};

const AdminTours = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";
  const searchTerm = searchParams.get("q") || "";

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tours"],
    queryFn: async () => {
      const first = await tourService.list({ limit: 1000, page: 1 });
      const total = first.total ?? first.data?.length ?? 0;
      const loaded = first.data || [];
      if (total <= loaded.length) return first;
      const pages = Math.ceil(total / 1000);
      const rest = await Promise.all(
        Array.from({ length: pages - 1 }, (_, i) => tourService.list({ limit: 1000, page: i + 2 }))
      );
      return {
        ...first,
        data: [...loaded, ...rest.flatMap((page) => page.data || [])],
        count: total,
      };
    },
    ...liveQueryOptions,
  });

  const tours = data?.data || [];
  const statusCounts = data?.statusCounts;

  const stats = useMemo(() => {
    if (statusCounts) {
      return {
        all: statusCounts.all ?? tours.length,
        pending: statusCounts.pending ?? 0,
        confirmed: statusCounts.confirmed ?? 0,
        reschedule:
          (statusCounts.reschedule_requested ?? 0) +
          (statusCounts.reschedule_pending_buyer_approval ?? 0),
        completed: statusCounts.completed ?? 0,
      };
    }
    return {
      all: tours.length,
      pending: tours.filter((t) => t.status === "pending").length,
      confirmed: tours.filter((t) => t.status === "confirmed").length,
      reschedule: tours.filter((t) => RESCHEDULE_STATUSES.has(t.status)).length,
      completed: tours.filter((t) => t.status === "completed").length,
    };
  }, [statusCounts, tours]);

  const pills: { key: TourPillKey; label: string; count: number; className: string; valueClass: string }[] = [
    {
      key: "all",
      label: "Total Tours",
      count: stats.all,
      className: "bg-card border border-border",
      valueClass: "text-foreground",
    },
    {
      key: "pending",
      label: "Pending",
      count: stats.pending,
      className: "bg-yellow-500/10 border border-yellow-500/20",
      valueClass: "text-yellow-600",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      count: stats.confirmed,
      className: "bg-green-500/10 border border-green-500/20",
      valueClass: "text-green-600",
    },
    {
      key: "reschedule",
      label: "Reschedule",
      count: stats.reschedule,
      className: "bg-blue-500/10 border border-blue-500/20",
      valueClass: "text-blue-600",
    },
    {
      key: "completed",
      label: "Completed",
      count: stats.completed,
      className: "bg-gray-500/10 border border-gray-500/20",
      valueClass: "text-gray-600",
    },
  ];

  const setStatusFilter = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "all") next.delete("status");
    else next.set("status", value);
    setSearchParams(next, { replace: true });
  };

  const setSearchTerm = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value.trim()) next.delete("q");
    else next.set("q", value);
    setSearchParams(next, { replace: true });
  };

  const filteredTours = tours.filter((tour) => {
    const matchesStatus = tourMatchesPill(tour, statusFilter);
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      tour.propertyId?.title?.toLowerCase().includes(q) ||
      tour.propertyId?.location?.city?.toLowerCase().includes(q) ||
      tour.buyerId?.firstName?.toLowerCase().includes(q) ||
      tour.buyerId?.lastName?.toLowerCase().includes(q) ||
      tour.buyerId?.email?.toLowerCase().includes(q) ||
      tour.sellerId?.firstName?.toLowerCase().includes(q) ||
      tour.sellerId?.email?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleViewTour = (tourId: string) => {
    navigate(`/admin/tours/${tourId}`);
  };

  const pendingTours = filteredTours.filter((tour) => tour.status === "pending");
  const confirmedTours = filteredTours.filter((tour) => tour.status === "confirmed");
  const rescheduleTours = filteredTours.filter((tour) => RESCHEDULE_STATUSES.has(tour.status));
  const otherTours = filteredTours.filter(
    (tour) =>
      tour.status !== "pending" &&
      tour.status !== "confirmed" &&
      !RESCHEDULE_STATUSES.has(tour.status)
  );

  const renderTourGrid = (items: Tour[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((tour) => (
        <TourNotification key={tour._id} tour={tour} onView={() => handleViewTour(tour._id)} />
      ))}
    </div>
  );

  const showGrouped = statusFilter === "all";

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Tours" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">All Tours</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and manage all property tours across the platform. Click a status to filter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {pills.map((pill) => {
            const isSelected = statusFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setStatusFilter(pill.key)}
                className={cn(
                  "rounded-xl p-4 text-left transition-all cursor-pointer hover:opacity-90 border",
                  pill.className,
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-muted"
                )}
              >
                <div className={cn("text-2xl font-bold", pill.valueClass)}>{pill.count}</div>
                <div className={cn("text-sm", pill.valueClass === "text-foreground" ? "text-muted-foreground" : pill.valueClass)}>
                  {pill.label}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by property, buyer, seller, or location..."
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
                <option value="reschedule">Reschedule</option>
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
        ) : showGrouped ? (
          <div className="space-y-6">
            {pendingTours.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  Pending Approval ({pendingTours.length})
                </h2>
                {renderTourGrid(pendingTours)}
              </div>
            )}
            {rescheduleTours.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  Reschedule Requests ({rescheduleTours.length})
                </h2>
                {renderTourGrid(rescheduleTours)}
              </div>
            )}
            {confirmedTours.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  Confirmed Tours ({confirmedTours.length})
                </h2>
                {renderTourGrid(confirmedTours)}
              </div>
            )}
            {otherTours.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  Other Tours ({otherTours.length})
                </h2>
                {renderTourGrid(otherTours)}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground mb-4">
              {pills.find((p) => p.key === statusFilter)?.label || "Tours"} ({filteredTours.length})
            </h2>
            {renderTourGrid(filteredTours)}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminTours;
