import { Users, Calendar, BarChart3, Bell, Home, Star, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "./AdminDashboard";
import { useQuery } from "@tanstack/react-query";
import { tourService } from "@/services/tour.service";
import { messageService } from "@/services/message.service";
import { useAuth } from "@/context/AuthContext";
import agent1 from "@/assets/agent-1.jpg";

const clients = [
  { name: "Alice Johnson", type: "Buyer", phone: "+1 555-111-2222", status: "Active", lastContact: "Today" },
  { name: "Bob Williams", type: "Seller", phone: "+1 555-333-4444", status: "Active", lastContact: "Yesterday" },
  { name: "Carol Davis", type: "Buyer", phone: "+1 555-555-6666", status: "Lead", lastContact: "3 days ago" },
  { name: "Dan Miller", type: "Seller", phone: "+1 555-777-8888", status: "Closed", lastContact: "1 week ago" },
];

const upcomingEvents = [
  { title: "Property Showing - Downtown Apt", time: "10:00 AM", client: "Alice Johnson", type: "Tour" },
  { title: "Client Meeting - Bob Williams", time: "1:00 PM", client: "Bob Williams", type: "Meeting" },
  { title: "Open House - Garden Residence", time: "3:00 PM", client: "Walk-ins", type: "Open House" },
];

const AgentDashboard = () => {
  const { user } = useAuth();
  const { data: toursData } = useQuery({
    queryKey: ["agent-dashboard-tours"],
    queryFn: () => tourService.list(),
  });
  const { data: conversationsData } = useQuery({
    queryKey: ["agent-dashboard-conversations"],
    queryFn: () => messageService.conversations(),
  });

  const tours = toursData?.data || [];
  const conversations = conversationsData?.data || [];

  const upcomingEventsLive = tours.slice(0, 3).map((tour) => ({
    title: `Tour - ${tour.propertyId?.title || "Property"}`,
    time: `${tour.startTime}`,
    client: `${tour.buyerId?.firstName || ""} ${tour.buyerId?.lastName || ""}`.trim() || tour.buyerId?.email || "Client",
    type: "Tour",
  }));

  const clientsLive = conversations.slice(0, 6).map((conv) => {
    const other = conv.participants.find((p) => (p._id || p.id) !== (user?._id || user?.id));
    return {
      name: `${other?.firstName || ""} ${other?.lastName || ""}`.trim() || other?.email || "Client",
      type: other?.role ? other.role.charAt(0).toUpperCase() + other.role.slice(1) : "Client",
      status: "Active",
      lastContact: conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : "-",
    };
  });

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Dashboard" role="agent" />

      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src={agent1} alt="Agent" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Agent Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, Savannah Nguyen</p>
            </div>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-card transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Users, label: "Active Clients", value: String(clientsLive.length) },
            { icon: Home, label: "Properties", value: "--" },
            { icon: Target, label: "Deals Closed", value: String(tours.filter((t) => t.status === "completed").length) },
            { icon: Star, label: "Rating", value: "4.9" },
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-foreground">Today's Schedule</h2>
              <span className="text-xs text-muted-foreground">Feb 18, 2026</span>
            </div>
            <div className="space-y-3">
              {(upcomingEventsLive.length ? upcomingEventsLive : upcomingEvents).map((event, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">{event.title}</div>
                    <div className="text-xs text-muted-foreground">{event.time} · {event.client}</div>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{event.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Client Pipeline */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-foreground">Client Pipeline</h2>
              <Button size="sm" variant="outline" className="text-xs">View All</Button>
            </div>
            <div className="space-y-3">
              {(clientsLive.length ? clientsLive : clients).map((client) => (
                <div key={client.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-xs">{client.name[0]}</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{client.name}</div>
                      <div className="text-xs text-muted-foreground">{client.type} · {client.lastContact}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    client.status === "Active" ? "bg-green-50 text-green-600" :
                    client.status === "Lead" ? "bg-blue-50 text-blue-600" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {client.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;
