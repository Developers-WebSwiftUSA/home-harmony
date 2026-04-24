import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { propertyService } from "@/services/property.service";
import property1 from "@/assets/property-1.jpg";

const AgentProperties = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["agent-properties"],
    queryFn: () => propertyService.agent(),
  });

  const properties = data?.data || [];

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Properties" role="agent" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Assigned Properties</h1>
        <p className="text-sm text-muted-foreground mb-6">Properties linked to your agent account</p>
        {isLoading ? <p className="text-sm text-muted-foreground mb-4">Loading properties...</p> : null}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {properties.map((property) => (
            <div key={property._id} className="bg-card border border-border rounded-xl p-4 flex gap-4">
              <img src={property.images?.[0]?.url || property1} alt={property.title} className="w-28 h-20 object-cover rounded-md" />
              <div className="flex-1">
                <Link to={`/properties/${property._id}`} className="font-medium text-foreground hover:text-primary">
                  {property.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {[property.location?.city, property.location?.state].filter(Boolean).join(", ")}
                </p>
                <p className="text-sm text-primary font-bold">${Number(property.price || 0).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AgentProperties;

