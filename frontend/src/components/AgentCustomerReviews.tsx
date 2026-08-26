import { Link } from "react-router-dom";
import { Star, Home, User, ThumbsUp, ThumbsDown } from "lucide-react";
import { Tour } from "@/types/models";
import { cn } from "@/lib/utils";
import { formatRating } from "@/lib/ratings";
import { getPropertyDetailPath } from "@/lib/propertyRoutes";

const resolveId = (value?: { _id?: string; id?: string } | string) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

export const getAgentReviewTours = (tours: Tour[], agentUserId?: string) =>
  tours.filter((tour) => {
    const tourAgentId = resolveId(tour.agentId);
    const hasAgentFeedback = Boolean(tour.feedback?.agentRating);
    return hasAgentFeedback && tourAgentId === String(agentUserId || "");
  });

type Props = {
  tours: Tour[];
  agentUserId?: string;
  isLoading?: boolean;
};

export const AgentCustomerReviews = ({ tours, agentUserId, isLoading }: Props) => {
  const reviews = getAgentReviewTours(tours, agentUserId);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, tour) => sum + (tour.feedback?.agentRating || 0), 0) / reviews.length
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((t) => t.feedback?.agentRating === rating).length,
  }));

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Loading customer reviews...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-bold text-foreground mb-1">Customer Reviews & Feedback</h3>
        <p className="text-sm text-muted-foreground">
          Feedback from buyers after completed tours you handled
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-foreground">{reviews.length}</div>
          <div className="text-sm text-muted-foreground">Total Reviews</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {reviews.length ? formatRating(averageRating) : "—"}
          </div>
          <div className="text-sm text-yellow-600">Average Rating</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">
            {reviews.filter((t) => t.feedback?.wouldRecommend).length}
          </div>
          <div className="text-sm text-green-600">Would Recommend</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600">
            {reviews.filter((t) => t.feedback?.overallExperience === "excellent").length}
          </div>
          <div className="text-sm text-blue-600">Excellent Reviews</div>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h4 className="font-heading font-bold text-foreground mb-4">Rating Distribution</h4>
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
                    style={{ width: `${(count / reviews.length) * 100}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground w-12 text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">No customer reviews yet</p>
          <p className="text-sm text-muted-foreground">
            Reviews appear here after buyers complete tours and submit feedback.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((tour) => (
            <div key={tour._id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Home className="w-5 h-5 text-primary flex-shrink-0" />
                    <Link
                      to={tour.propertyId ? getPropertyDetailPath(tour.propertyId) : "#"}
                      className="text-lg font-heading font-bold text-foreground hover:text-primary transition-colors truncate"
                    >
                      {tour.propertyId?.title || "Property"}
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8 truncate">
                    {[
                      tour.propertyId?.location?.address,
                      tour.propertyId?.location?.city,
                      tour.propertyId?.location?.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {tour.feedback?.submittedAt
                    ? new Date(tour.feedback.submittedAt).toLocaleDateString()
                    : ""}
                </span>
              </div>

              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Customer Rating</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-5 h-5",
                        star <= (tour.feedback?.agentRating || 0)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {tour.feedback?.agentRating}/5
                  </span>
                </div>
                {tour.feedback?.agentComment && (
                  <p className="text-sm text-foreground mt-2">{tour.feedback.agentComment}</p>
                )}
              </div>

              {(tour.feedback?.overallExperience || tour.feedback?.wouldRecommend !== undefined) && (
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {tour.feedback?.overallExperience && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Overall experience: </span>
                      <span className="text-foreground font-medium capitalize">
                        {tour.feedback.overallExperience}
                      </span>
                    </div>
                  )}
                  {tour.feedback?.wouldRecommend !== undefined && (
                    <div className="flex items-center gap-2">
                      {tour.feedback.wouldRecommend ? (
                        <>
                          <ThumbsUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-foreground">Would recommend</span>
                        </>
                      ) : (
                        <>
                          <ThumbsDown className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-foreground">Would not recommend</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-border text-xs text-muted-foreground">
                Reviewed by:{" "}
                {`${tour.buyerId?.firstName || ""} ${tour.buyerId?.lastName || ""}`.trim() ||
                  tour.buyerId?.email ||
                  "Buyer"}
                {tour.date ? ` · Tour date: ${new Date(tour.date).toLocaleDateString()}` : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
