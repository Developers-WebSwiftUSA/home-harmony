import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { DashboardSidebar } from "./AdminDashboard";
import { useAuth } from "@/context/AuthContext";
import { getUserId } from "@/lib/userDisplay";
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
  const { user } = useAuth();
  const userId = getUserId(user);
  const [searchParams, setSearchParams] = useSearchParams();
  const market = (searchParams.get("market") === "rent" ? "rent" : "sale") as CrmMarket;
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedBuyerId(null);
  }, [userId]);

  const { data: saleData, isLoading: saleLoading } = useQuery({
    queryKey: ["crm-buyers", role, "sale", userId],
    queryFn: () => crmService.myBuyers("sale"),
    enabled: Boolean(userId),
  });
  const { data: rentData, isLoading: rentLoading } = useQuery({
    queryKey: ["crm-buyers", role, "rent", userId],
    queryFn: () => crmService.myBuyers("rent"),
    enabled: Boolean(userId),
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["crm-buyer-detail", role, market, selectedBuyerId, userId],
    queryFn: () => crmService.myBuyerDetail(selectedBuyerId!, market),
    enabled: Boolean(userId && selectedBuyerId),
  });

  const buyers = (market === "rent" ? rentData?.data : saleData?.data) || [];
  const isLoading = market === "rent" ? rentLoading : saleLoading;
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
            setSearchParams(key === "sale" ? {} : { market: key }, { replace: true });
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
