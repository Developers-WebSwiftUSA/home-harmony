import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { BuyerDetailDialog } from "@/components/dashboard/BuyerDetailDialog";
import { BuyerDetail, BuyerSummary, CrmMarket } from "@/features/crm/types/crm.types";
import { UserAvatar } from "@/components/UserAvatar";
import { getDisplayName } from "@/lib/userDisplay";
import { cn } from "@/lib/utils";

type Props = {
  buyers: BuyerSummary[];
  detail?: BuyerDetail | null;
  market: CrmMarket;
  isLoading?: boolean;
  isDetailLoading?: boolean;
  selectedBuyerId?: string | null;
  onSelectBuyer: (buyerId: string | null) => void;
  messageBasePath: string;
};

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

export const BuyerCrmPanel = ({
  buyers,
  detail,
  market,
  isLoading,
  isDetailLoading,
  selectedBuyerId,
  onSelectBuyer,
  messageBasePath,
}: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedSummary = buyers.find((b) => b.buyerId === selectedBuyerId) || null;

  const handleOpenBuyer = (buyerId: string) => {
    onSelectBuyer(buyerId);
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) onSelectBuyer(null);
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading buyers...</p>;
  }

  if (buyers.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No {market === "rent" ? "rental" : "sale"} buyers yet. They will appear from tours,
          applications, and messages on your listings.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {buyers.map((buyer) => (
          <button
            key={buyer.buyerId}
            type="button"
            onClick={() => handleOpenBuyer(buyer.buyerId)}
            className={cn(
              "w-full text-left bg-card border border-border rounded-xl p-4 transition-all",
              "hover:shadow-lg hover:border-primary/25 hover:-translate-y-0.5 duration-200 group"
            )}
          >
            <div className="flex items-start gap-3">
              <UserAvatar user={buyer.buyer} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {getDisplayName(buyer.buyer)}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 transition-all group-hover:text-primary group-hover:translate-x-0.5" />
                </div>
                <p className="text-xs text-muted-foreground truncate">{buyer.buyer.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className={cn(
                      "text-[11px] px-2 py-0.5 rounded-full capitalize",
                      statusPill(buyer.status)
                    )}
                  >
                    {buyer.status}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {buyer.toursCount} tours
                  </span>
                  {market === "rent" && (
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
        ))}
      </div>

      <BuyerDetailDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        summary={selectedSummary}
        detail={detail}
        market={market}
        isLoading={isDetailLoading}
        messageBasePath={messageBasePath}
      />
    </>
  );
};
