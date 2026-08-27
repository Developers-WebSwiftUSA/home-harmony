import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { tourService } from "@/services/tour.service";
import { useAuth } from "@/context/AuthContext";
import { TourReviewsList } from "@/components/TourReviewsList";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";

const SellerReviews = () => {
  const { isAuthenticated } = useAuth();
  const [pill, setPill] = useState("all");
  const { data, isLoading } = useQuery({
    queryKey: ["seller-reviews"],
    queryFn: () => tourService.listReviews({ limit: 500 }),
    enabled: isAuthenticated,
  });

  const tours = data?.data || [];
  const recommended = tours.filter((t) => t.feedback?.wouldRecommend);
  const visible = useMemo(() => {
    if (pill === "recommend") return recommended;
    if (pill === "property") return tours.filter((t) => t.feedback?.propertyRating);
    if (pill === "agent") return tours.filter((t) => t.feedback?.agentRating);
    return tours;
  }, [pill, recommended, tours]);

  const averagePropertyRating =
    tours.length > 0
      ? tours.reduce((sum, tour) => sum + (tour.feedback?.propertyRating || 0), 0) / tours.length
      : 0;
  const agentReviews = tours.filter((t) => t.feedback?.agentRating);
  const averageAgentRating =
    agentReviews.length > 0
      ? agentReviews.reduce((sum, tour) => sum + (tour.feedback?.agentRating || 0), 0) / agentReviews.length
      : 0;

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Feedback" role="seller" />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Property Feedback</h1>
          <p className="text-sm text-muted-foreground">
            Buyer reviews and ratings for your listings after completed tours
          </p>
        </div>

        <DashboardTabPills
          className="mb-6"
          activeKey={pill}
          onChange={setPill}
          tabs={[
            { key: "all", label: "Total Reviews", count: tours.length },
            { key: "property", label: "Avg Property Rating", count: averagePropertyRating.toFixed(1) },
            { key: "agent", label: "Avg Agent Rating", count: agentReviews.length ? averageAgentRating.toFixed(1) : "—" },
            { key: "recommend", label: "Would Recommend", count: recommended.length },
          ]}
        />

        <TourReviewsList
          tours={visible}
          isLoading={isLoading}
          defaultRatingType="property"
          emptyMessage="No feedback yet. Reviews appear after buyers complete tours on your listings and submit feedback."
        />
      </main>
    </div>
  );
};

export default SellerReviews;
