import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { propertyService } from "@/services/property.service";
import { Button } from "@/components/ui/button";

const AdminModeration = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-moderation"],
    queryFn: () => propertyService.list({ status: "pending" }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => propertyService.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-moderation"] }),
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => propertyService.reject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-moderation"] }),
  });

  const properties = data?.data || [];

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Moderation" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Moderation</h1>
        <p className="text-sm text-muted-foreground mb-6">Approve or reject pending property listings</p>
        {isLoading ? <p className="text-sm text-muted-foreground mb-4">Loading moderation queue...</p> : null}
        <div className="space-y-3">
          {properties.map((property) => (
            <div key={property._id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">{property.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {[property.location?.city, property.location?.state].filter(Boolean).join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => approveMutation.mutate(property._id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => rejectMutation.mutate(property._id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminModeration;

