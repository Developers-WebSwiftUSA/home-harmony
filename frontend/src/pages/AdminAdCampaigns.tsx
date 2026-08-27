import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone,
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  Clock,
  StopCircle,
  ArrowLeft,
  Download,
  Receipt,
  Search,
} from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adCampaignService } from "@/services/adCampaign.service";
import {
  formatAdTypeLabel,
  formatCampaignPeriod,
  formatCurrency,
} from "@/features/ads/lib/promotionDisplay";
import {
  getBillingCustomerKey,
  getCampaignProperty,
  getCampaignPropertyTitle,
  getChargedPayments,
  getCustomerLabel,
  getCustomerLifetimeTotal,
  getCustomerPayments,
  invoiceNumber,
  isChargedPayment,
  matchesBillSearch,
  searchChargedPayments,
} from "@/features/ads/lib/campaignBilling";
import { downloadCampaignInvoicePdf } from "@/features/ads/lib/invoicePdf";
import { AdCampaign, AdCampaignStatus } from "@/features/ads/types/adCampaign.types";
import { liveQueryOptions } from "@/lib/liveQuery";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusStyles: Record<AdCampaignStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  active: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

type PillKey = "all" | "pending" | "active" | "revenue";

const formatBillDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const AdminAdCampaigns = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = (searchParams.get("status") as PillKey) || "all";
  const customerKey = searchParams.get("customer") || "";
  const billId = searchParams.get("bill") || "";
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewMode, setReviewMode] = useState<"approve" | "reject" | null>(null);
  const [billSearch, setBillSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ad-campaigns"],
    queryFn: () => adCampaignService.list({ limit: 1000 }),
    ...liveQueryOptions,
  });

  const campaigns = data?.data || [];
  const payments = useMemo(() => getChargedPayments(campaigns), [campaigns]);
  const filteredPayments = useMemo(
    () => searchChargedPayments(campaigns, billSearch),
    [campaigns, billSearch]
  );
  const customerPayments = useMemo(
    () => getCustomerPayments(campaigns, customerKey),
    [campaigns, customerKey]
  );
  const matchingCustomerPayments = useMemo(
    () => customerPayments.filter((campaign) => matchesBillSearch(campaign, billSearch)),
    [customerPayments, billSearch]
  );
  const selectedBill =
    matchingCustomerPayments.find((campaign) => campaign._id === billId) ||
    matchingCustomerPayments[0] ||
    null;

  const stats = {
    all: campaigns.length,
    pending: campaigns.filter((campaign) => campaign.status === "pending").length,
    active: campaigns.filter((campaign) => campaign.status === "active").length,
    revenue: getCustomerLifetimeTotal(payments),
  };

  const visibleCampaigns = useMemo(() => {
    if (statusFilter === "all" || statusFilter === "revenue") return campaigns;
    return campaigns.filter((campaign) => campaign.status === statusFilter);
  }, [campaigns, statusFilter]);

  const pills: { key: PillKey; label: string; value: string; className: string; valueClass: string }[] = [
    {
      key: "all",
      label: "Total requests",
      value: String(stats.all),
      className: "bg-card border border-border",
      valueClass: "text-foreground",
    },
    {
      key: "pending",
      label: "Pending",
      value: String(stats.pending),
      className: "bg-yellow-500/10 border border-yellow-500/20",
      valueClass: "text-yellow-600",
    },
    {
      key: "active",
      label: "Active",
      value: String(stats.active),
      className: "bg-green-500/10 border border-green-500/20",
      valueClass: "text-green-600",
    },
    {
      key: "revenue",
      label: "Revenue",
      value: formatCurrency(stats.revenue),
      className: "bg-purple-500/10 border border-purple-500/20",
      valueClass: "text-purple-600",
    },
  ];

  const setStatusFilter = (value: PillKey) => {
    const next = new URLSearchParams();
    if (value !== "all") next.set("status", value);
    setBillSearch("");
    setSearchParams(next, { replace: true });
  };

  const openCustomerBilling = (campaign: AdCampaign) => {
    const next = new URLSearchParams();
    next.set("status", "revenue");
    next.set("customer", getBillingCustomerKey(campaign));
    next.set("bill", campaign._id);
    setSearchParams(next, { replace: true });
  };

  const selectBill = (campaign: AdCampaign) => {
    const next = new URLSearchParams(searchParams);
    next.set("status", "revenue");
    next.set("customer", getBillingCustomerKey(campaign));
    next.set("bill", campaign._id);
    setSearchParams(next, { replace: true });
  };

  const backToPayments = () => {
    const next = new URLSearchParams();
    next.set("status", "revenue");
    setSearchParams(next, { replace: true });
  };

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

  const handleDownloadInvoice = (campaign: AdCampaign) => {
    try {
      downloadCampaignInvoicePdf(campaign);
      toast.success("Invoice PDF downloaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate invoice PDF");
    }
  };

  const renderBillSearch = () => (
    <div className="bg-card border border-border rounded-xl p-4 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={billSearch}
          onChange={(e) => setBillSearch(e.target.value)}
          placeholder="Search bills by name, email, or bill number"
          className="pl-10"
          aria-label="Search bills by name, email, or bill number"
        />
      </div>
    </div>
  );

  const renderCampaignList = (list: AdCampaign[]) => {
    if (list.length === 0) {
      return (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
          No campaigns in this view.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {list.map((campaign) => {
          const property = getCampaignProperty(campaign);
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
                    Requested by {getCustomerLabel(campaign)} · {campaign.requesterRole}
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
                  {isChargedPayment(campaign) && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => openCustomerBilling(campaign)}>
                      <Receipt className="w-4 h-4" />
                      Billing
                    </Button>
                  )}
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
    );
  };

  const renderPayments = (list: AdCampaign[]) => {
    if (payments.length === 0) {
      return (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
          No payments have been charged yet.
        </div>
      );
    }

    if (list.length === 0) {
      return (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
          No bills match that name, email, or bill number.
        </div>
      );
    }

    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-heading font-bold text-foreground">Payments</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Every charged promotion. Search by customer name, billing email, or bill number, then click a row for bill details.
          </p>
        </div>
        <div className="divide-y divide-border">
          {list.map((campaign) => (
            <button
              key={campaign._id}
              type="button"
              onClick={() => openCustomerBilling(campaign)}
              className="w-full text-left px-5 py-4 hover:bg-muted/60 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{getCustomerLabel(campaign)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {invoiceNumber(campaign._id)} · {campaign.payment?.billingEmail || "No billing email"} ·{" "}
                    {getCampaignPropertyTitle(campaign)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{formatCurrency(Number(campaign.chargedAmount || 0))}</p>
                  <p className="text-xs text-muted-foreground">{formatBillDate(campaign.chargedAt)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderBillingHistory = () => {
    if (!selectedBill) {
      return (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
          No billing history for this customer.
        </div>
      );
    }

    const lifetime = getCustomerLifetimeTotal(customerPayments);

    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={backToPayments}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to payments
        </button>

        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Customer</p>
          <h2 className="text-xl font-heading font-bold text-foreground mt-1">{getCustomerLabel(selectedBill)}</h2>
          <p className="text-sm text-muted-foreground">{selectedBill.payment?.billingEmail}</p>
          <div className="flex flex-wrap gap-6 mt-4">
            <div>
              <p className="text-xs text-muted-foreground">Lifetime billed</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(lifetime)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payments</p>
              <p className="text-lg font-bold text-foreground">{customerPayments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Bill details</p>
              <h3 className="font-heading font-bold text-foreground mt-1">{invoiceNumber(selectedBill._id)}</h3>
            </div>
            <Button className="gap-2" onClick={() => handleDownloadInvoice(selectedBill)}>
              <Download className="w-4 h-4" />
              Download invoice PDF
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p>
              <span className="text-muted-foreground">Listing: </span>
              {getCampaignPropertyTitle(selectedBill)}
            </p>
            <p>
              <span className="text-muted-foreground">Promotion: </span>
              {formatAdTypeLabel(selectedBill.adType)} · {selectedBill.durationDays} days
            </p>
            <p>
              <span className="text-muted-foreground">Charged: </span>
              {formatCurrency(Number(selectedBill.chargedAmount || 0))} on {formatBillDate(selectedBill.chargedAt)}
            </p>
            <p>
              <span className="text-muted-foreground">Period: </span>
              {formatCampaignPeriod(selectedBill.startDate, selectedBill.endDate)}
            </p>
            <p>
              <span className="text-muted-foreground">Card: </span>
              {selectedBill.payment?.cardBrand || "Card"} •••• {selectedBill.payment?.cardLast4}
            </p>
            <p>
              <span className="text-muted-foreground">Billed to: </span>
              {selectedBill.payment?.cardHolderName}
            </p>
            {selectedBill.payment?.billingAddress && (
              <p className="md:col-span-2">
                <span className="text-muted-foreground">Address: </span>
                {selectedBill.payment.billingAddress}
              </p>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-heading font-bold text-foreground">Billing history</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {billSearch.trim()
                ? "Matching charged campaigns for this customer."
                : "All charged campaigns for this customer."}
            </p>
          </div>
          <div className="divide-y divide-border">
            {matchingCustomerPayments.map((campaign) => {
              const isSelected = campaign._id === selectedBill._id;
              return (
                <button
                  key={campaign._id}
                  type="button"
                  onClick={() => selectBill(campaign)}
                  className={cn(
                    "w-full text-left px-5 py-4 transition-colors",
                    isSelected ? "bg-primary/5" : "hover:bg-muted/60"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{getCampaignPropertyTitle(campaign)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {invoiceNumber(campaign._id)} · {formatAdTypeLabel(campaign.adType)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(Number(campaign.chargedAmount || 0))}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatBillDate(campaign.chargedAt)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
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
            Review promotion requests, click a status to filter, and search Revenue by name, email, or bill number.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                <div className={cn("text-2xl font-bold", pill.valueClass)}>{pill.value}</div>
                <div className={cn("text-sm", pill.valueClass === "text-foreground" ? "text-muted-foreground" : pill.valueClass)}>
                  {pill.label}
                </div>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="py-16 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading campaigns...
          </div>
        ) : statusFilter === "revenue" && customerKey && (matchingCustomerPayments.length > 0 || !billSearch.trim()) ? (
          <>
            {renderBillSearch()}
            {renderBillingHistory()}
          </>
        ) : statusFilter === "revenue" ? (
          <>
            {payments.length > 0 && renderBillSearch()}
            {renderPayments(filteredPayments)}
          </>
        ) : (
          renderCampaignList(visibleCampaigns)
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
