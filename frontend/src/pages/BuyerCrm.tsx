import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { crmService } from "@/services/crm.service";
import { DashboardTabPills, marketTabs } from "@/components/dashboard/DashboardTabPills";
import { BuyerCrmPanel } from "@/components/dashboard/BuyerCrmPanel";
import { CrmMarket } from "@/features/crm/types/crm.types";

type Props = {
  role: "seller" | "agent";
  sidebarActive: string;
  messagePath: string;
};

const BuyerCrm = ({ role, sidebarActive, messagePath }: Props) => {
  const [market, setMarket] = useState<CrmMarket>("sale");
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);

  const { data: saleData } = useQuery({
    queryKey: ["crm-buyers", role, "sale"],
    queryFn: () => crmService.myBuyers("sale"),
  });
  const { data: rentData } = useQuery({
    queryKey: ["crm-buyers", role, "rent"],
    queryFn: () => crmService.myBuyers("rent"),
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["crm-buyer-detail", role, market, selectedBuyerId],
    queryFn: () => crmService.myBuyerDetail(selectedBuyerId!, market),
    enabled: Boolean(selectedBuyerId),
  });

  const { data: buyersData, isLoading } = useQuery({
    queryKey: ["crm-buyers", role, market],
    queryFn: () => crmService.myBuyers(market),
  });

  const buyers = buyersData?.data || [];
  const saleCount = saleData?.data?.length || 0;
  const rentCount = rentData?.data?.length || 0;

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active={sidebarActive} role={role} />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            {role === "seller" ? "My Buyers" : "My Clients"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Click a buyer to view their tours, applications, reviews, and deal history
          </p>
        </div>

        <DashboardTabPills
          variant="card"
          tabs={marketTabs(saleCount, rentCount)}
          activeKey={market}
          onChange={(key) => {
            setMarket(key as CrmMarket);
            setSelectedBuyerId(null);
          }}
          className="mb-8"
        />

        <BuyerCrmPanel
          buyers={buyers}
          detail={detailData?.data}
          market={market}
          isLoading={isLoading}
          isDetailLoading={detailLoading}
          selectedBuyerId={selectedBuyerId}
          onSelectBuyer={setSelectedBuyerId}
          messageBasePath={messagePath}
        />
      </main>
    </div>
  );
};

export default BuyerCrm;
