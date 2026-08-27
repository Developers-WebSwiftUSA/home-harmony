import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { DashboardSidebar } from "./AdminDashboard";
import { crmService } from "@/services/crm.service";
import {
  DashboardTabPills,
  partnerRoleTabs,
} from "@/components/dashboard/DashboardTabPills";
import { PartnerDetailDialog } from "@/components/dashboard/PartnerDetailDialog";
import { CrmMarket } from "@/features/crm/types/crm.types";
import { UserAvatar } from "@/components/UserAvatar";
import { getDisplayName } from "@/lib/userDisplay";
import { liveQueryOptions } from "@/lib/liveQuery";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const AdminPartners = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleTab = searchParams.get("role") === "agent" ? "agent" : "seller";
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [buyerMarket, setBuyerMarket] = useState<CrmMarket>("sale");

  const { data: sellersData } = useQuery({
    queryKey: ["crm-partners", "seller"],
    queryFn: () => crmService.partners("seller"),
    ...liveQueryOptions,
  });
  const { data: agentsData } = useQuery({
    queryKey: ["crm-partners", "agent"],
    queryFn: () => crmService.partners("agent"),
    ...liveQueryOptions,
  });

  const { data: partnersData, isLoading } = useQuery({
    queryKey: ["crm-partners", roleTab],
    queryFn: () => crmService.partners(roleTab),
    ...liveQueryOptions,
  });

  const { data: partnerDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["crm-partner-detail", selectedPartnerId],
    queryFn: () => crmService.partnerDetail(selectedPartnerId!),
    enabled: Boolean(selectedPartnerId && partnerDialogOpen),
  });

  const { data: buyerDetailData, isLoading: buyerDetailLoading } = useQuery({
    queryKey: ["crm-partner-buyer", selectedPartnerId, buyerMarket, selectedBuyerId],
    queryFn: () => crmService.partnerBuyerDetail(selectedPartnerId!, selectedBuyerId!, buyerMarket),
    enabled: Boolean(selectedPartnerId && selectedBuyerId),
  });

  const partners = partnersData?.data || [];
  const sellerCount = sellersData?.data?.length || 0;
  const agentCount = agentsData?.data?.length || 0;

  const buyerDetail = buyerDetailData?.data
    ? {
        ...buyerDetailData.data.buyer,
        tours: buyerDetailData.data.tours,
        applications: buyerDetailData.data.applications,
        reviews: buyerDetailData.data.reviews,
      }
    : null;

  const handlePartnerClick = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setSelectedBuyerId(null);
    setBuyerMarket("sale");
    setPartnerDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Partners" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Partners & Buyers</h1>
          <p className="text-sm text-muted-foreground">
            Click a seller or agent to view their profile, listings, and buyer pipeline
          </p>
        </div>

        <DashboardTabPills
          variant="card"
          tabs={partnerRoleTabs(sellerCount, agentCount)}
          activeKey={roleTab}
          onChange={(key) => {
            setSearchParams(key === "seller" ? {} : { role: key }, { replace: true });
            setSelectedPartnerId(null);
            setPartnerDialogOpen(false);
          }}
          className="mb-8"
        />

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading partners...</p>
        ) : partners.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center text-sm text-muted-foreground">
            No {roleTab}s found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {partners.map(({ partner, stats }) => (
              <button
                key={partner._id || partner.id}
                type="button"
                onClick={() => handlePartnerClick(partner._id || partner.id || "")}
                className={cn(
                  "w-full text-left bg-card border border-border rounded-xl p-5 transition-all",
                  "hover:shadow-lg hover:border-primary/25 hover:-translate-y-0.5 duration-200 group"
                )}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar user={partner} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {getDisplayName(partner)}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 transition-all group-hover:text-primary group-hover:translate-x-0.5" />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{partner.email}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-700">
                        {stats.saleBuyers} sale buyers
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700">
                        {stats.rentBuyers} rental buyers
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {stats.listings} listings
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <PartnerDetailDialog
          open={partnerDialogOpen}
          onOpenChange={(open) => {
            setPartnerDialogOpen(open);
            if (!open) {
              setSelectedPartnerId(null);
              setSelectedBuyerId(null);
            }
          }}
          detail={partnerDetail?.data}
          isLoading={detailLoading}
          buyerDetail={buyerDetail}
          isBuyerDetailLoading={buyerDetailLoading}
          selectedBuyerId={selectedBuyerId}
          onSelectBuyer={(buyerId, market) => {
            setSelectedBuyerId(buyerId);
            setBuyerMarket(market);
          }}
          messageBasePath="/admin/messages"
        />
      </main>
    </div>
  );
};

export default AdminPartners;
