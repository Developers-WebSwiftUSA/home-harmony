import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone,
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  Clock,
  StopCircle,
} from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";
import { adCampaignService } from "@/services/adCampaign.service";
import {
  formatAdTypeLabel,
  formatCampaignPeriod,
  formatCurrency,
} from "@/features/ads/lib/promotionDisplay";
import { AdCampaign, AdCampaignStatus } from "@/features/ads/types/adCampaign.types";
import { Property } from "@/types/models";
import { getDisplayName } from "@/lib/userDisplay";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusStyles: Record<AdCampaignStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  active: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

const tabs = [
  { key: "pending", label: "Pending review" },
  { key: "active", label: "Active" },
  { key: "all", label: "All" },
];

const getPropertyFromCampaign = (campaign: AdCampaign): Property | null => {
  if (!campaign.propertyId || typeof campaign.propertyId === "string") return null;
  return campaign.propertyId;
};

const AdminAdCampaigns = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("pending");
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewMode, setReviewMode] = useState<"approve" | "reject" | null>(null);

  const queryParams = useMemo(() => (tab === "all" ? {} : { status: tab }), [tab]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ad-campaigns", queryParams],
    queryFn: () => adCampaignService.list({ ...queryParams, limit: 100 }),
  });

  const { data: allData } = useQuery({
    queryKey: ["admin-ad-campaigns", "summary"],
    queryFn: () => adCampaignService.list({ limit: 100 }),
  });

  const campaigns = data?.data || [];
  const allCampaigns = allData?.data || [];

  const approveMutation = useMutation({
    mutationFn: (id: string) => adCampaignService.approve(id, adminNotes || undefined),
    onSuccess: () => {
      toast.success("Campaign approved and payment charged");
      queryClient.invalidateQueries({ queryKey: ["admin-ad-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["ad-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      closeReview();
    },
    onError: (error: Error) => toast.error(error.message || "Could not approve campaign"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      adCampaignService.reject(id, rejectionReason || undefined, adminNotes || undefined),
    onSuccess: () => {
      toast.success("Campaign request rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-ad-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["ad-campaigns"] });
      closeReview();
    },
    onError: (error: Error) => toast.error(error.message || "Could not reject campaign"),
  });

  const endMutation = useMutation({
    mutationFn: (id: string) => adCampaignService.end(id),
    onSuccess: () => {
      toast.success("Campaign ended");
      queryClient.invalidateQueries({ queryKey: ["admin-ad-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["ad-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not end campaign"),
  });

  const closeReview = () => {
    setSelectedCampaign(null);
    setReviewMode(null);
    setAdminNotes("");
    setRejectionReason("");
  };

  const openReview = (campaign: AdCampaign, mode: "approve" | "reject") => {
    setSelectedCampaign(campaign);
    setReviewMode(mode);
    setAdminNotes("");
    setRejectionReason("");
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Ad Campaigns" role="admin" />

      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            Ad Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review promotion requests, approve billing, and manage live sponsored listings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pending", value: allCampaigns.filter((c) => c.status === "pending").length },
            { label: "Active", value: allCampaigns.filter((c) => c.status === "active").length },
            {
              label: "Revenue",
              value: formatCurrency(allCampaigns.reduce((sum, c) => sum + Number(c.chargedAmount || 0), 0)),
            },
            { label: "Total requests", value: allCampaigns.length },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <DashboardTabPills tabs={tabs} activeKey={tab} onChange={setTab} className="mb-6" />

        {isLoading ? (
          <div className="py-16 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
            No campaigns in this view.
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
                        <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize", statusStyles[campaign.status])}>
                          {campaign.status}
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          {formatAdTypeLabel(campaign.adType)}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-foreground">{property?.title || "Property"}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Requested by {getDisplayName(campaign.requesterId)} · {campaign.requesterRole}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {campaign.durationDays} days
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          {formatCurrency(campaign.totalAmount)}
                        </span>
                        {campaign.payment && (
                          <span>
                            •••• {campaign.payment.cardLast4} · {campaign.payment.billingEmail}
                          </span>
                        )}
                      </div>
                      {campaign.status === "active" && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Live: {formatCampaignPeriod(campaign.startDate, campaign.endDate)}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {campaign.status === "pending" && (
                        <>
                          <Button size="sm" className="gap-1" onClick={() => openReview(campaign, "approve")}>
                            <CheckCircle2 className="w-4 h-4" />
                            Approve & charge
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => openReview(campaign, "reject")}>
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </>
                      )}
                      {campaign.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => endMutation.mutate(campaign._id)}
                          disabled={endMutation.isPending}
                        >
                          <StopCircle className="w-4 h-4" />
                          End early
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

      <Dialog open={Boolean(selectedCampaign && reviewMode)} onOpenChange={(open) => !open && closeReview()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewMode === "approve" ? "Approve promotion" : "Reject promotion"}
            </DialogTitle>
            <DialogDescription>
              {reviewMode === "approve"
                ? `This will charge ${formatCurrency(selectedCampaign?.totalAmount || 0)} and activate the campaign immediately.`
                : "The requester will not be charged."}
            </DialogDescription>
          </DialogHeader>

          {reviewMode === "reject" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Reason</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Optional reason shown to the requester"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Admin notes</label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes (optional)"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeReview}>
              Cancel
            </Button>
            {reviewMode === "approve" ? (
              <Button
                onClick={() => selectedCampaign && approveMutation.mutate(selectedCampaign._id)}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? "Processing..." : "Approve & charge"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => selectedCampaign && rejectMutation.mutate(selectedCampaign._id)}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject request"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAdCampaigns;
