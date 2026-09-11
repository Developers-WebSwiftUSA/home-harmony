import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Images,
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  RotateCcw,
  Plus,
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
import { gallerySlotService } from "@/services/gallerySlot.service";
import { formatCurrency } from "@/features/ads/lib/promotionDisplay";
import {
  GalleryPurchaseStatus,
  GallerySlotPurchase,
  GalleryUsageRow,
} from "@/features/gallery-slots/types/gallerySlot.types";
import { liveQueryOptions } from "@/lib/liveQuery";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const statusStyles: Record<GalleryPurchaseStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-muted text-muted-foreground",
  refunded: "bg-muted text-muted-foreground",
};

type PillKey = "all" | "pending" | "approved" | "revenue" | "listings";

const getPurchaseProperty = (purchase: GallerySlotPurchase) =>
  typeof purchase.propertyId === "string" ? null : purchase.propertyId;

const getCustomerLabel = (purchase: GallerySlotPurchase) => {
  const requester = purchase.requesterId;
  const name = [requester?.firstName, requester?.lastName].filter(Boolean).join(" ");
  return name || requester?.email || purchase.payment?.cardHolderName || "Seller";
};

const AdminGalleryPurchases = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<PillKey>("pending");
  const [selected, setSelected] = useState<GallerySlotPurchase | null>(null);
  const [reviewMode, setReviewMode] = useState<"approve" | "reject" | "refund" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [grantListing, setGrantListing] = useState<GalleryUsageRow | null>(null);
  const [grantSlots, setGrantSlots] = useState("1");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-gallery-purchases"],
    queryFn: () => gallerySlotService.list({ limit: 1000 }),
    ...liveQueryOptions,
  });

  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ["admin-gallery-usage"],
    queryFn: () => gallerySlotService.usage(),
    ...liveQueryOptions,
  });

  const purchases = data?.data || [];
  const listings = usageData?.data || [];

  const payments = useMemo(
    () => purchases.filter((item) => item.paymentStatus === "charged"),
    [purchases]
  );

  const visiblePurchases = useMemo(() => {
    if (statusFilter === "all") return purchases;
    if (statusFilter === "pending") return purchases.filter((item) => item.status === "pending");
    if (statusFilter === "approved") return purchases.filter((item) => item.status === "approved");
    return [];
  }, [purchases, statusFilter]);

  const pendingCount = purchases.filter((item) => item.status === "pending").length;
  const lockedListings = listings.filter((item) => item.lockedCount > 0).length;
  const revenue = payments.reduce((sum, item) => sum + Number(item.chargedAmount || item.totalAmount || 0), 0);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-gallery-purchases"] });
    queryClient.invalidateQueries({ queryKey: ["admin-gallery-usage"] });
    queryClient.invalidateQueries({ queryKey: ["gallery-slot-purchases"] });
    queryClient.invalidateQueries({ queryKey: ["properties"] });
    queryClient.invalidateQueries({ queryKey: ["seller-listing"] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => gallerySlotService.approve(id, adminNotes || undefined),
    onSuccess: () => {
      toast.success("Payment charged and extra photos unlocked");
      closeReview();
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Could not approve request"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      gallerySlotService.reject(id, rejectionReason || undefined, adminNotes || undefined),
    onSuccess: () => {
      toast.success("Pay to Go request rejected");
      closeReview();
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Could not reject request"),
  });

  const refundMutation = useMutation({
    mutationFn: (id: string) => gallerySlotService.refund(id, adminNotes || undefined),
    onSuccess: () => {
      toast.success("Payment refunded and extra slots revoked");
      closeReview();
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Could not refund purchase"),
  });

  const grantMutation = useMutation({
    mutationFn: () => gallerySlotService.grant(grantListing!._id, Number(grantSlots)),
    onSuccess: () => {
      toast.success("Gallery slots updated");
      setGrantListing(null);
      setGrantSlots("1");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Could not update slots"),
  });

  const closeReview = () => {
    setSelected(null);
    setReviewMode(null);
    setAdminNotes("");
    setRejectionReason("");
  };

  const pills: Array<{ key: PillKey; label: string; value: string; className: string; valueClass: string }> = [
    { key: "all", label: "All requests", value: String(purchases.length), className: "bg-card border-border", valueClass: "text-foreground" },
    { key: "pending", label: "Pending", value: String(pendingCount), className: "bg-yellow-50 border-yellow-100", valueClass: "text-yellow-800" },
    { key: "listings", label: "Listings with extras", value: String(listings.length), className: "bg-sky-50 border-sky-100", valueClass: "text-sky-800" },
    { key: "revenue", label: "Revenue", value: formatCurrency(revenue), className: "bg-green-50 border-green-100", valueClass: "text-green-800" },
  ];

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Gallery Photos" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Images className="w-6 h-6 text-primary" />
            Gallery Pay to Go
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review extra-photo payments and unlocks. Change rates on the{" "}
            <Link to="/admin/pricing" className="text-primary hover:underline">
              Pricing
            </Link>{" "}
            page.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {pills.map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setStatusFilter(pill.key)}
              className={cn(
                "rounded-xl p-4 text-left transition-all cursor-pointer hover:opacity-90 border",
                pill.className,
                statusFilter === pill.key && "ring-2 ring-primary ring-offset-2 ring-offset-muted"
              )}
            >
              <div className={cn("text-2xl font-bold", pill.valueClass)}>{pill.value}</div>
              <div className={cn("text-sm", pill.valueClass === "text-foreground" ? "text-muted-foreground" : pill.valueClass)}>
                {pill.label}
              </div>
            </button>
          ))}
        </div>

        {statusFilter === "listings" ? (
          usageLoading ? (
            <div className="py-16 flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading listings...
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
              No listings with extra gallery photos yet.
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div key={listing._id} className="bg-card border border-border rounded-xl p-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-bold text-foreground">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {[listing.sellerId?.firstName, listing.sellerId?.lastName].filter(Boolean).join(" ") ||
                        listing.sellerId?.email ||
                        "Seller"}{" "}
                      · {listing.status}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {listing.galleryCount} gallery photos · {listing.publicGalleryCount} public ·{" "}
                      {listing.paidGallerySlots} paid slots · {listing.lockedCount} locked
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/admin/properties/${listing._id}`}>
                      <Button size="sm" variant="outline">
                        Review listing
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => {
                        setGrantListing(listing);
                        setGrantSlots("1");
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Grant / revoke slots
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : statusFilter === "revenue" ? (
          payments.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
              No extra-photo payments have been charged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((purchase) => {
                const property = getPurchaseProperty(purchase);
                return (
                  <div key={purchase._id} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-heading font-bold text-foreground">
                          {property?.title || "Listing"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getCustomerLabel(purchase)} · {purchase.slotsGranted || purchase.slotsRequested} slots
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {purchase.payment?.cardBrand || "Card"} •••• {purchase.payment?.cardLast4} ·{" "}
                          {purchase.payment?.billingEmail}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatCurrency(Number(purchase.chargedAmount || 0))}
                        </p>
                        {purchase.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 gap-1"
                            onClick={() => {
                              setSelected(purchase);
                              setReviewMode("refund");
                            }}
                          >
                            <RotateCcw className="w-4 h-4" />
                            Refund
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : isLoading ? (
          <div className="py-16 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading requests...
          </div>
        ) : visiblePurchases.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
            No Pay to Go requests in this view.
          </div>
        ) : (
          <div className="space-y-4">
            {visiblePurchases.map((purchase) => {
              const property = getPurchaseProperty(purchase);
              return (
                <div key={purchase._id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize", statusStyles[purchase.status])}>
                          {purchase.status}
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          {purchase.slotsRequested} extra slot{purchase.slotsRequested === 1 ? "" : "s"}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-foreground">{property?.title || "Listing"}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Requested by {getCustomerLabel(purchase)}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          {formatCurrency(purchase.totalAmount)}
                        </span>
                        {purchase.payment && (
                          <span>
                            •••• {purchase.payment.cardLast4} · {purchase.payment.billingEmail}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {property?._id ? (
                        <Link to={`/admin/properties/${property._id}`}>
                          <Button size="sm" variant="outline">
                            Listing
                          </Button>
                        </Link>
                      ) : null}
                      {purchase.status === "pending" && (
                        <>
                          <Button size="sm" className="gap-1" onClick={() => { setSelected(purchase); setReviewMode("approve"); }}>
                            <CheckCircle2 className="w-4 h-4" />
                            Approve & charge
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => { setSelected(purchase); setReviewMode("reject"); }}>
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={Boolean(selected && reviewMode)} onOpenChange={(open) => !open && closeReview()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewMode === "approve"
                ? "Approve extra photos"
                : reviewMode === "refund"
                  ? "Refund extra photos"
                  : "Reject Pay to Go"}
            </DialogTitle>
            <DialogDescription>
              {reviewMode === "approve"
                ? `This will charge ${formatCurrency(selected?.totalAmount || 0)} and unlock ${selected?.slotsRequested || 0} extra gallery photo slot${selected?.slotsRequested === 1 ? "" : "s"}.`
                : reviewMode === "refund"
                  ? "This refunds the seller and revokes the extra photo slots."
                  : "The seller will not be charged."}
            </DialogDescription>
          </DialogHeader>
          {reviewMode === "reject" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Reason</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Optional reason shown to the seller"
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
              <Button onClick={() => selected && approveMutation.mutate(selected._id)} disabled={approveMutation.isPending}>
                {approveMutation.isPending ? "Processing..." : "Approve & charge"}
              </Button>
            ) : reviewMode === "refund" ? (
              <Button variant="destructive" onClick={() => selected && refundMutation.mutate(selected._id)} disabled={refundMutation.isPending}>
                {refundMutation.isPending ? "Refunding..." : "Refund"}
              </Button>
            ) : (
              <Button variant="destructive" onClick={() => selected && rejectMutation.mutate(selected._id)} disabled={rejectMutation.isPending}>
                {rejectMutation.isPending ? "Rejecting..." : "Reject request"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(grantListing)} onOpenChange={(open) => !open && setGrantListing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant or revoke extra photo slots</DialogTitle>
            <DialogDescription>
              Complimentary slots for {grantListing?.title}. Use a negative number to revoke.
              Current paid slots: {grantListing?.paidGallerySlots || 0}. {lockedListings} listing
              {lockedListings === 1 ? "" : "s"} still have locked photos.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Slots to add</label>
            <input
              type="number"
              value={grantSlots}
              onChange={(e) => setGrantSlots(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setGrantListing(null)}>
              Cancel
            </Button>
            <Button onClick={() => grantMutation.mutate()} disabled={grantMutation.isPending || !Number(grantSlots)}>
              {grantMutation.isPending ? "Saving..." : "Update slots"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGalleryPurchases;
