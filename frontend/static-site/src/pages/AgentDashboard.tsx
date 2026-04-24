import { Users, Bell, Home, Star, Target } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { useQuery } from "@tanstack/react-query";
import { tourService } from "@/services/tour.service";
import { messageService } from "@/services/message.service";
import { propertyService } from "@/services/property.service";
import { useAuth } from "@/context/AuthContext";
import type { Tour } from "@/types/models";

function toLocalYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tourOnLocalDay(tour: Tour, day: Date): boolean {
  return toLocalYmd(new Date(tour.date)) === toLocalYmd(day);
}

const AgentDashboard = () => {
  const { user } = useAuth();

  const { data: toursData, isLoading: toursLoading } = useQuery({
    queryKey: ["agent-dashboard-tours"],
    queryFn: () => tourService.list(),
  });
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ["agent-dashboard-conversations"],
    queryFn: () => messageService.conversations(),
  });
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ["agent-dashboard-properties"],
    queryFn: () => propertyService.agent(),
  });

  const tours = toursData?.data || [];
  const conversations = conversationsData?.data || [];
  const properties = propertiesData?.data || [];

  const today = new Date();
  const todayLabel = today.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const todayTours = tours
    .filter((t) => tourOnLocalDay(t, today))
    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  const ratingCount = user?.agentProfile?.rating?.count ?? 0;
  const ratingAverage = user?.agentProfile?.rating?.average ?? 0;
  const ratingDisplay = ratingCount === 0 ? "0" : Number(ratingAverage).toFixed(1);

  const activeClientsDisplay = conversationsLoading ? "—" : String(conversations.length);
  const propertiesDisplay = propertiesLoading ? "—" : String(properties.length);
  const dealsClosed = tours.filter((t) => t.status === "completed").length;

  const headerInitials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.trim() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Dashboard" role="agent" />

      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {headerInitials}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Agent Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome{user?.firstName ? `, ${user.firstName}` : ""}
              </p>
            </div>
          </div>
          <button type="button" className="relative p-2 rounded-lg hover:bg-card transition-colors" aria-label="Notifications">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Users, label: "Active Clients", value: activeClientsDisplay },
            { icon: Home, label: "Properties", value: propertiesDisplay },
            { icon: Target, label: "Deals Closed", value: String(dealsClosed) },
            { icon: Star, label: "Rating", value: ratingDisplay },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-foreground">Today&apos;s Schedule</h2>
            <span className="text-xs text-muted-foreground">{todayLabel}</span>
          </div>
          {toursLoading ? (
            <p className="text-sm text-muted-foreground py-6">Loading schedule…</p>
          ) : todayTours.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">No tours scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todayTours.map((tour) => {
                const client =
                  `${tour.buyerId?.firstName || ""} ${tour.buyerId?.lastName || ""}`.trim() ||
                  tour.buyerId?.email ||
                  "Client";
                const title = tour.propertyId?.title || "Property";
                return (
                  <div key={tour._id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm">Tour — {title}</div>
                      <div className="text-xs text-muted-foreground">
                        {tour.startTime}
                        {tour.endTime ? `–${tour.endTime}` : ""} · {client}
                      </div>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0 capitalize">
                      {tour.status.replace(/_/g, " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;
