import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { adCampaignService } from "@/services/adCampaign.service";
import { AdCampaignRequestDialog } from "@/features/ads/components/AdCampaignRequestDialog";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";
import {
  formatAdTypeLabel,
  formatCampaignPeriod,
  formatCurrency,
} from "@/features/ads/lib/promotionDisplay";
import { AdCampaign, AdCampaignStatus } from "@/features/ads/types/adCampaign.types";
import { Property } from "@/types/models";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const statusStyles: Record<AdCampaignStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  active: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

type Props = {
  role: "seller" | "agent";
};

const pageConfig = {
  seller: {
    title: "Promotions & Ads",
    subtitle: "Request sponsored or advertised placement for your active listings.",
    sidebarActive: "Promotions",
  },
  agent: {
    title: "Promotions & Ads",
    subtitle: "Promote assigned listings with sponsored or advertisement campaigns.",
    sidebarActive: "Promotions",
  },
};

const tabs = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "past", label: "Past" },
];

const pastStatuses: AdCampaignStatus[] = ["expired", "cancelled", "rejected"];

const getPropertyFromCampaign = (campaign: AdCampaign): Property | null => {
  if (!campaign.propertyId || typeof campaign.propertyId === "string") return null;
  return campaign.propertyId;
};

const AdCampaigns = ({ role }: Props) => {
  const config = pageConfig[role];
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const queryParams = useMemo(() => {
    if (tab === "all" || tab === "past") return {};
    return { status: tab };
  }, [tab]);

  const { data, isLoading } = useQuery({
    queryKey: ["ad-campaigns", role, queryParams],
    queryFn: () => adCampaignService.list({ ...queryParams, limit: 100 }),
  });

  const { data: allData } = useQuery({
    queryKey: ["ad-campaigns", role, "summary"],
    queryFn: () => adCampaignService.list({ limit: 100 }),
  });

  const campaigns = useMemo(() => {
    const list = data?.data || [];
    if (tab === "past") return list.filter((c) => pastStatuses.includes(c.status));
    return list;
  }, [data?.data, tab]);
  const allCampaigns = allData?.data || [];

  const cancelMutation = useMutation({
    mutationFn: (id: string) => adCampaignService.cancel(id),
    onSuccess: () => {
      toast.success("Promotion request cancelled");
      queryClient.invalidateQueries({ queryKey: ["ad-campaigns"] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not cancel request"),
  });

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active={config.sidebarActive} role={role} />

      <main className="flex-1 ml-64 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{config.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{config.subtitle}</p>
          </div>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            New promotion request
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending review</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {allCampaigns.filter((c) => c.status === "pending").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Live campaigns</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {allCampaigns.filter((c) => c.status === "active").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total spend</p>
            <p className="text-2xl font-bold text-primary mt-2">
              {formatCurrency(allCampaigns.reduce((sum, c) => sum + Number(c.chargedAmount || 0), 0))}
            </p>
          </div>
        </div>

        <DashboardTabPills tabs={tabs} activeKey={tab} onChange={setTab} className="mb-6" />

        {isLoading ? (
          <div className="py-16 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
            <Megaphone className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-heading font-bold text-foreground mb-2">No promotion requests yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Submit a request to highlight a listing as Sponsored or Advertised after admin approval.
            </p>
            <Button onClick={() => setDialogOpen(true)}>Create first request</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const property = getPropertyFromCampaign(campaign);
              return (
                <div key={campaign._id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={cn(
                            "text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize",
                            statusStyles[campaign.status]
                          )}
                        >
                          {campaign.status}
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          {formatAdTypeLabel(campaign.adType)}
                        </span>
                        {campaign.paymentStatus === "charged" && (
                          <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            Charged {formatCurrency(campaign.chargedAmount || 0)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading font-bold text-foreground">
                        {property?.title || "Property"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {campaign.durationDays} days · {formatCurrency(campaign.totalAmount)} estimated
                      </p>
                      {campaign.status === "active" && (
                        <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatCampaignPeriod(campaign.startDate, campaign.endDate)}
                        </p>
                      )}
                      {campaign.status === "rejected" && campaign.rejectionReason && (
                        <p className="text-xs text-red-600 mt-2 inline-flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          {campaign.rejectionReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {property?._id && (
                        <Link to={property.listingType === "rent" || property.listingType === "both" ? `/rentals/${property._id}` : `/properties/${property._id}`}>
                          <Button size="sm" variant="outline">View listing</Button>
                        </Link>
                      )}
                      {campaign.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelMutation.mutate(campaign._id)}
                          disabled={cancelMutation.isPending}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <AdCampaignRequestDialog open={dialogOpen} onOpenChange={setDialogOpen} role={role} />
    </div>
  );
};

export default AdCampaigns;
