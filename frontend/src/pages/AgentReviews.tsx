import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { tourService } from "@/services/tour.service";
import { useAuth } from "@/context/AuthContext";
import { getAgentReviewTours } from "@/components/AgentCustomerReviews";
import { TourReviewsList } from "@/components/TourReviewsList";
import { formatRating } from "@/lib/ratings";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";

const AgentReviews = () => {
  const { user, isAuthenticated } = useAuth();
  const [pill, setPill] = useState("all");
  const agentUserId = user?._id || user?.id;
  const { data, isLoading } = useQuery({
    queryKey: ["agent-reviews", agentUserId],
    queryFn: () => tourService.listReviews({ limit: 500 }),
    enabled: isAuthenticated,
  });

  const tours = data?.data || [];
  const agentReviews = getAgentReviewTours(tours, agentUserId);
  const recommended = tours.filter((t) => t.feedback?.wouldRecommend);
  const excellent = agentReviews.filter((t) => t.feedback?.overallExperience === "excellent");
  const visible = useMemo(() => {
    if (pill === "agent") return agentReviews;
    if (pill === "recommend") return recommended;
    if (pill === "excellent") return excellent;
    return tours;
  }, [pill, agentReviews, recommended, excellent, tours]);
  const averageAgentRating =
    agentReviews.length > 0
      ? agentReviews.reduce((sum, tour) => sum + (tour.feedback?.agentRating || 0), 0) / agentReviews.length
      : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: agentReviews.filter((t) => t.feedback?.agentRating === rating).length,
  }));

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Feedback" role="agent" />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Tour Feedback</h1>
          <p className="text-sm text-muted-foreground">
            Buyer reviews from tours you handled — property and agent ratings
          </p>
        </div>

        <DashboardTabPills
          className="mb-8"
          activeKey={pill}
          onChange={setPill}
          tabs={[
            { key: "all", label: "Tours with Feedback", count: tours.length },
            { key: "agent", label: "Your Avg Rating", count: agentReviews.length ? formatRating(averageAgentRating) : "—" },
            { key: "recommend", label: "Would Recommend", count: recommended.length },
            { key: "excellent", label: "Excellent Reviews", count: excellent.length },
          ]}
        />

        {agentReviews.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <h2 className="font-heading font-bold text-foreground mb-4">Your Rating Distribution</h2>
            <div className="space-y-3">
              {ratingDistribution.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium text-foreground">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full rounded-full transition-all"
                      style={{ width: `${(count / agentReviews.length) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground w-12 text-right">{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <TourReviewsList
          tours={visible}
          isLoading={isLoading}
          defaultRatingType="agent"
          emptyMessage="No feedback yet. Reviews appear after buyers complete your tours and submit feedback."
        />
      </main>
    </div>
  );
};

export default AgentReviews;
