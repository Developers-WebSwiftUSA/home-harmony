import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { messageService } from "@/services/message.service";
import { useAuth } from "@/context/AuthContext";

const AgentClients = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["agent-clients-conversations"],
    queryFn: () => messageService.conversations(),
  });

  const clients = useMemo(() => {
    const conversations = data?.data || [];
    const map = new Map<string, { name: string; email: string; role: string }>();
    conversations.forEach((conv) => {
      conv.participants.forEach((p) => {
        const id = p._id || p.id || "";
        if (!id || id === (user?._id || user?.id)) return;
        map.set(id, {
          name: `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Client",
          email: p.email,
          role: p.role || "user",
        });
      });
    });
    return Array.from(map.values());
  }, [data, user]);

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Clients" role="agent" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Clients</h1>
        <p className="text-sm text-muted-foreground mb-6">People you are currently engaging with</p>
        {isLoading ? <p className="text-sm text-muted-foreground mb-4">Loading clients...</p> : null}
        <div className="space-y-3">
          {clients.map((client) => (
            <div key={client.email} className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-medium text-foreground">{client.name}</h3>
              <p className="text-xs text-muted-foreground">{client.email}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize inline-block mt-2">
                {client.role}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AgentClients;

