import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { tourService } from "@/services/tour.service";
import { useAuth } from "@/context/AuthContext";
import { TourReviewsList } from "@/components/TourReviewsList";

const SellerReviews = () => {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["seller-reviews"],
    queryFn: () => tourService.listReviews({ limit: 500 }),
    enabled: isAuthenticated,
  });

  const tours = data?.data || [];

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-2xl font-bold text-foreground">{tours.length}</div>
            <div className="text-sm text-muted-foreground">Total Reviews</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-600">{averagePropertyRating.toFixed(1)}</div>
            <div className="text-sm text-yellow-600">Avg Property Rating</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-600">
              {agentReviews.length ? averageAgentRating.toFixed(1) : "—"}
            </div>
            <div className="text-sm text-blue-600">Avg Agent Rating</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600">
              {tours.filter((t) => t.feedback?.wouldRecommend).length}
            </div>
            <div className="text-sm text-green-600">Would Recommend</div>
          </div>
        </div>

        <TourReviewsList
          tours={tours}
          isLoading={isLoading}
          defaultRatingType="property"
          emptyMessage="No feedback yet. Reviews appear after buyers complete tours on your listings and submit feedback."
        />
      </main>
    </div>
  );
};

export default SellerReviews;
