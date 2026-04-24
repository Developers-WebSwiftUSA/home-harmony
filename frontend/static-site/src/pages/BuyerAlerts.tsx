import { DashboardSidebar } from "./AdminDashboard";

const BuyerAlerts = () => {
  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Alerts" role="buyer" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Alerts
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Price drops, new matches, and tour updates for your saved searches.
        </p>
        <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground">
          Placeholder alerts center. Later you can list notifications and allow the
          buyer to manage alert preferences here.
        </div>
      </main>
    </div>
  );
};

export default BuyerAlerts;

