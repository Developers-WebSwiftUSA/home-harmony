import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ChevronRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrmDetailDialog } from "@/components/dashboard/CrmDetailDialog";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";
import { BuyerDetailDialog } from "@/components/dashboard/BuyerDetailDialog";
import { PartnerDetail, BuyerDetail, BuyerSummary, CrmMarket } from "@/features/crm/types/crm.types";
import { UserAvatar } from "@/components/UserAvatar";
import { getDisplayName, getUserId } from "@/lib/userDisplay";
import { getPropertyDetailPath } from "@/lib/propertyRoutes";
import { isRentalListing } from "@/features/rentals/lib/rentalFormat";
import { cn } from "@/lib/utils";
import { useOpenUserChat } from "@/hooks/useOpenUserChat";

type PartnerTab = "overview" | "listings" | "sale-buyers" | "rent-buyers";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail?: PartnerDetail | null;
  isLoading?: boolean;
  buyerDetail?: BuyerDetail | null;
  isBuyerDetailLoading?: boolean;
  selectedBuyerId?: string | null;
  onSelectBuyer: (buyerId: string | null, market: CrmMarket) => void;
  messageBasePath: string;
};

export const PartnerDetailDialog = ({
  open,
  onOpenChange,
  detail,
  isLoading,
  buyerDetail,
  isBuyerDetailLoading,
  selectedBuyerId,
  onSelectBuyer,
  messageBasePath,
}: Props) => {
  const [partnerTab, setPartnerTab] = useState<PartnerTab>("overview");
  const [buyerDialogOpen, setBuyerDialogOpen] = useState(false);
  const { openChat, isPending: openingPartnerChat } = useOpenUserChat();

  useEffect(() => {
    if (open) {
      setPartnerTab("overview");
      setBuyerDialogOpen(false);
    }
  }, [open]);

  const buyerMarket: CrmMarket = partnerTab === "rent-buyers" ? "rent" : "sale";
  const activeBuyers =
    partnerTab === "sale-buyers"
      ? detail?.saleBuyers || []
      : partnerTab === "rent-buyers"
        ? detail?.rentBuyers || []
        : [];

  const selectedBuyerSummary = activeBuyers.find((b) => b.buyerId === selectedBuyerId) || null;

  const handlePartnerOpenChange = (next: boolean) => {
    if (!next) {
      setPartnerTab("overview");
      onSelectBuyer(null, "sale");
      setBuyerDialogOpen(false);
    }
    onOpenChange(next);
  };

  const handleBuyerClick = (buyer: BuyerSummary) => {
    onSelectBuyer(buyer.buyerId, buyerMarket);
    setBuyerDialogOpen(true);
  };

  return (
    <>
      <CrmDetailDialog open={open} onOpenChange={handlePartnerOpenChange} size="xl">
        {isLoading || !detail ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm">Loading partner details...</p>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pr-8">
              <div className="flex items-center gap-4">
                <UserAvatar user={detail.partner} size="lg" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-primary mb-1 capitalize">
                    {detail.partner.role}
                  </p>
                  <h2 className="text-xl font-heading font-bold text-foreground">
                    {getDisplayName(detail.partner)}
                  </h2>
                  <p className="text-sm text-muted-foreground">{detail.partner.email}</p>
                </div>
              </div>
              <Button
                size="sm"
                className="gap-2 shadow-sm"
                disabled={openingPartnerChat}
                onClick={async () => {
                  const partnerId = getUserId(detail.partner);
                  if (!partnerId) return;
                  await openChat(partnerId, messageBasePath);
                  handlePartnerOpenChange(false);
                }}
              >
                {openingPartnerChat ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                {openingPartnerChat ? "Opening..." : "Message"}
              </Button>
            </div>

            <DashboardTabPills
              tabs={[
                { key: "overview", label: "Overview" },
                { key: "listings", label: "Listings", count: detail.properties.length },
                { key: "sale-buyers", label: "Sale Buyers", count: detail.saleBuyers.length },
                { key: "rent-buyers", label: "Rental Buyers", count: detail.rentBuyers.length },
              ]}
              activeKey={partnerTab}
              onChange={(key) => {
                setPartnerTab(key as PartnerTab);
                onSelectBuyer(null, key === "rent-buyers" ? "rent" : "sale");
              }}
              className="mb-6"
            />

            {partnerTab === "overview" && (
              <DashboardTabPills
                className="mb-2"
                activeKey=""
                onChange={(key) => {
                  if (key === "active") {
                    setPartnerTab("listings");
                    return;
                  }
                  setPartnerTab(key as PartnerTab);
                  onSelectBuyer(null, key === "rent-buyers" ? "rent" : "sale");
                }}
                tabs={[
                  { key: "listings", label: "Listings", count: detail.properties.length },
                  { key: "sale-buyers", label: "Sale Buyers", count: detail.saleBuyers.length },
                  { key: "rent-buyers", label: "Rental Buyers", count: detail.rentBuyers.length },
                  {
                    key: "active",
                    label: "Active",
                    count: detail.properties.filter((p) => p.status === "active").length,
                  },
                ]}
              />
            )}

            {partnerTab === "listings" && (
              <div className="space-y-3 max-h-[420px] overflow-y-auto animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                {detail.properties.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No listings yet.</p>
                ) : (
                  detail.properties.map((property) => (
                    <div
                      key={property._id}
                      className="flex items-center justify-between border border-border rounded-xl p-4 hover:bg-muted/40 transition-colors group"
                    >
                      <div>
                        <Link
                          to={getPropertyDetailPath(property)}
                          className="font-medium text-sm hover:text-primary inline-flex items-center gap-1"
                          onClick={() => handlePartnerOpenChange(false)}
                        >
                          {property.title}
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{property.status}</p>
                      </div>
                      <span
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full",
                          isRentalListing(property)
                            ? "bg-blue-500/10 text-blue-700"
                            : "bg-green-500/10 text-green-700"
                        )}
                      >
                        {isRentalListing(property) ? "For Rent" : "For Sale"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {(partnerTab === "sale-buyers" || partnerTab === "rent-buyers") && (
              <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                {activeBuyers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No {buyerMarket === "rent" ? "rental" : "sale"} buyers for this partner yet.
                  </p>
                ) : (
                  activeBuyers.map((buyer) => (
                    <button
                      key={buyer.buyerId}
                      type="button"
                      onClick={() => handleBuyerClick(buyer)}
                      className="w-full text-left bg-muted/40 border border-border rounded-xl p-4 transition-all hover:shadow-md hover:bg-muted/70 hover:border-primary/20 group"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar user={buyer.buyer} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-medium text-foreground truncate">
                              {getDisplayName(buyer.buyer)}
                            </h3>
                            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{buyer.buyer.email}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {buyer.toursCount} tours
                            </span>
                            {buyerMarket === "rent" && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700">
                                {buyer.applicationsCount} apps
                              </span>
                            )}
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-700">
                              {buyer.closedDeals} closed
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </CrmDetailDialog>

      <BuyerDetailDialog
        open={buyerDialogOpen}
        onOpenChange={(next) => {
          setBuyerDialogOpen(next);
          if (!next) onSelectBuyer(null, buyerMarket);
        }}
        summary={selectedBuyerSummary}
        detail={buyerDetail}
        market={buyerMarket}
        isLoading={isBuyerDetailLoading}
        messageBasePath={messageBasePath}
        layer="nested"
      />
    </>
  );
};
