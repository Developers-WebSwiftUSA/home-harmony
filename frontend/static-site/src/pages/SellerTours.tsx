import { useState } from "react";
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, XCircle, MessageSquare, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "./AdminDashboard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tourService } from "@/services/tour.service";
import property1 from "@/assets/property-1.jpg";

const SellerTours = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const { data, isLoading } = useQuery({
    queryKey: ["seller-tours"],
    queryFn: () => tourService.list(),
  });

  const tours = (data?.data || []).map((item) => ({
    id: item._id,
    buyer: `${item.buyerId?.firstName || ""} ${item.buyerId?.lastName || ""}`.trim() || item.buyerId?.email || "Buyer",
    buyerEmail: item.buyerId?.email || "",
    buyerPhone: item.buyerId?.phone || "",
    property: item.propertyId?.title || "Property",
    propertyImage: item.propertyId?.images?.[0]?.url || property1,
    date: item.date ? new Date(item.date).toLocaleDateString() : "-",
    time: `${item.startTime} - ${item.endTime}`,
    status:
      item.status === "confirmed"
        ? "Accepted"
        : item.status.charAt(0).toUpperCase() + item.status.slice(1),
    requestedDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
    message: item.message || "",
  }));

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "confirmed" | "declined" }) =>
      tourService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller-tours"] }),
  });

  // Filter tour requests based on selected status
  const filteredTours = filterStatus === "All" 
    ? tours 
    : tours.filter(tour => tour.status === filterStatus);

  // Calculate stats dynamically
  const stats = {
    pending: tours.filter(t => t.status === "Pending").length,
    accepted: tours.filter(t => t.status === "Accepted").length,
    declined: tours.filter(t => t.status === "Declined").length,
    total: tours.length,
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Tour Requests" role="seller" />

      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Tour Requests</h1>
            <p className="text-sm text-muted-foreground">Manage property tour requests from buyers</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Clock, label: "Pending", value: stats.pending.toString(), color: "text-yellow-600" },
            { icon: CheckCircle, label: "Accepted", value: stats.accepted.toString(), color: "text-green-600" },
            { icon: XCircle, label: "Declined", value: stats.declined.toString(), color: "text-red-600" },
            { icon: Calendar, label: "Total Requests", value: stats.total.toString(), color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <s.icon className={`w-5 h-5 ${s.color || "text-primary"}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {["All", "Pending", "Accepted", "Declined"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tour Requests List */}
        <div className="space-y-4">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading tour requests...</p> : null}
          {filteredTours.length > 0 ? (
            filteredTours.map((tour) => (
            <div key={tour.id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Property Image */}
                <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={tour.propertyImage} alt={tour.property} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-bold text-foreground text-lg mb-1">{tour.property}</h3>
                      <p className="text-sm text-muted-foreground mb-2">Tour requested by {tour.buyer}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      tour.status === "Accepted" ? "bg-green-50 text-green-600" :
                      tour.status === "Declined" ? "bg-red-50 text-red-600" :
                      "bg-yellow-50 text-yellow-600"
                    }`}>
                      {tour.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">{tour.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">{tour.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{tour.buyer}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Requested {tour.requestedDate}</span>
                    </div>
                  </div>

                  {tour.message && (
                    <div className="bg-muted rounded-lg p-3 mb-4">
                      <p className="text-sm text-foreground">{tour.message}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <a href={`tel:${tour.buyerPhone}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        <Phone className="w-3.5 h-3.5" /> Call
                      </Button>
                    </a>
                    <a href={`mailto:${tour.buyerEmail}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </Button>
                    </a>
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> Message
                    </Button>
                    {tour.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => statusMutation.mutate({ id: tour.id, status: "confirmed" })}
                          disabled={statusMutation.isPending}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1 text-destructive hover:text-destructive"
                          onClick={() => statusMutation.mutate({ id: tour.id, status: "declined" })}
                          disabled={statusMutation.isPending}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Decline
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-bold text-foreground mb-2">No tour requests found</h3>
              <p className="text-sm text-muted-foreground">
                {filterStatus === "All" 
                  ? "You don't have any tour requests yet."
                  : `You don't have any ${filterStatus.toLowerCase()} tour requests.`}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SellerTours;
