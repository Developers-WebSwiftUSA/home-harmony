import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";
import { CrmDetailDialog } from "@/components/dashboard/CrmDetailDialog";
import { BuyerDetail, BuyerSummary, CrmMarket } from "@/features/crm/types/crm.types";
import { UserAvatar } from "@/components/UserAvatar";
import { getDisplayName } from "@/lib/userDisplay";
import { getPropertyDetailPath } from "@/lib/propertyRoutes";
import { RatingStars } from "@/components/RatingStars";
import { cn } from "@/lib/utils";
import { useOpenUserChat } from "@/hooks/useOpenUserChat";

const detailTabs = ["Overview", "Tours", "Applications", "Reviews", "Properties"] as const;

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    active: "bg-green-50 text-green-700",
    pending: "bg-yellow-50 text-yellow-700",
    reviewing: "bg-blue-50 text-blue-700",
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
    withdrawn: "bg-muted text-muted-foreground",
  };
  return map[status] || "bg-muted text-muted-foreground";
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: BuyerSummary | null;
  detail?: BuyerDetail | null;
  market: CrmMarket;
  isLoading?: boolean;
  messageBasePath: string;
  layer?: "base" | "nested";
};

export const BuyerDetailDialog = ({
  open,
  onOpenChange,
  summary,
  detail,
  market,
  isLoading,
  messageBasePath,
  layer = "base",
}: Props) => {
  const [detailTab, setDetailTab] = useState<(typeof detailTabs)[number]>("Overview");
  const { openChat, isPending: openingChat } = useOpenUserChat();

  useEffect(() => {
    if (open) setDetailTab("Overview");
  }, [open, summary?.buyerId]);

  const relatedProperties = useMemo(() => {
    const fromTours = (detail?.tours || []).map((t) => t.propertyId).filter(Boolean);
    const fromApps = (detail?.applications || []).map((a) => a.propertyId).filter(Boolean);
    const merged = [...fromTours, ...fromApps];
    return merged.filter(
      (property, index, list) =>
        property && list.findIndex((p) => p && p._id === property._id) === index
    );
  }, [detail?.applications, detail?.tours]);

  if (!summary) return null;

  return (
    <CrmDetailDialog open={open} onOpenChange={onOpenChange} size="xl" layer={layer}>
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pr-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <UserAvatar user={summary.buyer} size="lg" />
              <span
                className={cn(
                  "absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full capitalize font-medium border-2 border-card",
                  statusPill(summary.status)
                )}
              >
                {summary.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary mb-1">
                {market === "rent" ? "Rental Buyer" : "Sale Buyer"}
              </p>
              <h2 className="text-xl font-heading font-bold text-foreground">
                {getDisplayName(summary.buyer)}
              </h2>
              <p className="text-sm text-muted-foreground">{summary.buyer.email}</p>
              {summary.buyer.phone && (
                <p className="text-xs text-muted-foreground mt-0.5">{summary.buyer.phone}</p>
              )}
            </div>
          </div>
          <Button
            size="sm"
            className="gap-2 shadow-sm"
            disabled={openingChat}
            onClick={async () => {
              await openChat(summary.buyerId, messageBasePath);
              onOpenChange(false);
            }}
          >
            {openingChat ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
            {openingChat ? "Opening..." : "Message"}
          </Button>
        </div>

        <DashboardTabPills
          tabs={detailTabs.map((tab) => ({ key: tab, label: tab }))}
          activeKey={detailTab}
          onChange={(key) => setDetailTab(key as (typeof detailTabs)[number])}
          className="mb-6"
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm">Loading buyer activity...</p>
          </div>
        ) : detailTab === "Overview" ? (
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <DashboardTabPills
              className="mb-2"
              activeKey=""
              onChange={(key) => setDetailTab(key as (typeof detailTabs)[number])}
              tabs={[
                { key: "Tours", label: "Tours", count: summary.toursCount },
                { key: "Applications", label: "Applications", count: summary.applicationsCount },
                { key: "Properties", label: "Properties", count: summary.propertiesCount },
                { key: "Reviews", label: "Reviews", count: summary.reviewsCount },
              ]}
            />
            <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <span className="text-sm font-medium text-foreground">Closed deals</span>
              <span className="text-2xl font-bold text-green-700">{summary.closedDeals}</span>
            </div>
          </div>
        ) : detailTab === "Tours" ? (
          <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {(detail?.tours || []).length === 0 ? (
              <EmptyState message="No tours scheduled yet." />
            ) : (
              detail?.tours.map((tour) => (
                <div
                  key={tour._id}
                  className="border border-border rounded-xl p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {tour.propertyId?.title || "Property"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tour.date ? new Date(tour.date).toLocaleDateString() : "—"} ·{" "}
                        {tour.startTime}–{tour.endTime}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize h-fit">
                      {tour.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : detailTab === "Applications" ? (
          <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {market !== "rent" ? (
              <EmptyState message="Applications apply to rental buyers only." />
            ) : (detail?.applications || []).length === 0 ? (
              <EmptyState message="No rental applications yet." />
            ) : (
              detail?.applications.map((app) => (
                <div
                  key={app._id}
                  className="border border-border rounded-xl p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-medium text-sm">{app.propertyId?.title}</p>
                    <span className={cn("text-xs px-2.5 py-1 rounded-full capitalize h-fit", statusPill(app.status))}>
                      {app.status}
                    </span>
                  </div>
                  {app.moveInDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Move-in {new Date(app.moveInDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        ) : detailTab === "Reviews" ? (
          <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {(detail?.reviews || []).length === 0 ? (
              <EmptyState message="No reviews submitted yet." />
            ) : (
              detail?.reviews.map((review) => (
                <div
                  key={review.tourId}
                  className="border border-border rounded-xl p-4 transition-colors hover:bg-muted/40"
                >
                  <p className="font-medium text-sm mb-2">{review.property?.title}</p>
                  <RatingStars rating={{ average: review.rating || 0, count: 1 }} size="xs" />
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        ) : relatedProperties.length === 0 ? (
          <EmptyState message="No related properties yet." />
        ) : (
          <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {relatedProperties.map((property) =>
              property ? (
                <div
                  key={property._id}
                  className="flex items-center justify-between border border-border rounded-xl p-4 transition-colors hover:bg-muted/40 group"
                >
                  <div>
                    <Link
                      to={getPropertyDetailPath(property)}
                      className="font-medium text-sm hover:text-primary inline-flex items-center gap-1"
                      onClick={() => onOpenChange(false)}
                    >
                      {property.title}
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{property.status}</p>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full",
                      property.listingType === "rent" || property.listingType === "both"
                        ? "bg-blue-500/10 text-blue-700"
                        : "bg-green-500/10 text-green-700"
                    )}
                  >
                    {property.listingType === "rent" ? "Rent" : property.listingType === "both" ? "Both" : "Sale"}
                  </span>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </CrmDetailDialog>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center">
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);
