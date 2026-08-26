import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Star, User, Home, ThumbsUp, ThumbsDown } from "lucide-react";
import { Tour } from "@/types/models";
import { cn } from "@/lib/utils";
import { ReviewRatingFilters } from "@/components/ReviewRatingFilters";
import { getPropertyDetailPath } from "@/lib/propertyRoutes";
import {
  DEFAULT_REVIEW_RATING_FILTER,
  ReviewRatingFilter,
  ReviewRatingType,
  filterToursByRating,
} from "@/lib/reviewFilters";

type Props = {
  tours: Tour[];
  isLoading?: boolean;
  emptyMessage?: string;
  showRatingFilters?: boolean;
  defaultRatingType?: ReviewRatingType;
};

export const TourReviewsList = ({
  tours,
  isLoading,
  emptyMessage = "No reviews yet",
  showRatingFilters = true,
  defaultRatingType = "all",
}: Props) => {
  const [ratingFilter, setRatingFilter] = useState<ReviewRatingFilter>({
    ...DEFAULT_REVIEW_RATING_FILTER,
    ratingType: defaultRatingType,
  });

  const filteredTours = useMemo(
    () => filterToursByRating(tours, ratingFilter),
    [tours, ratingFilter]
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-xl">
        <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const filterLabel =
    ratingFilter.stars === null
      ? null
      : `${ratingFilter.stars} star${ratingFilter.stars === 1 ? "" : "s"}${
          ratingFilter.ratingType === "property"
            ? " (property)"
            : ratingFilter.ratingType === "agent"
              ? " (agent)"
              : ""
        }`;

  return (
    <div>
      {showRatingFilters && (
        <ReviewRatingFilters tours={tours} filter={ratingFilter} onChange={setRatingFilter} />
      )}

      {ratingFilter.stars !== null && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredTours.length} of {tours.length} reviews
          {filterLabel ? ` · ${filterLabel}` : ""}
        </p>
      )}

      {filteredTours.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No reviews match the selected star rating.</p>
        </div>
      ) : (
        <div className="space-y-4">
      {filteredTours.map((tour) => (
        <div key={tour._id} className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-4 gap-4">
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
              <div className="text-sm text-muted-foreground ml-8">
                {[tour.propertyId?.location?.address, tour.propertyId?.location?.city, tour.propertyId?.location?.state]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex-shrink-0">
              {tour.feedback?.submittedAt
                ? new Date(tour.feedback.submittedAt).toLocaleDateString()
                : "Unknown date"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Property Review</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-5 h-5",
                      star <= (tour.feedback?.propertyRating || 0)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-300"
                    )}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {tour.feedback?.propertyRating}/5
                </span>
              </div>
              {tour.feedback?.propertyComment && (
                <p className="text-sm text-foreground mt-2">{tour.feedback.propertyComment}</p>
              )}
            </div>

            {tour.agentId && tour.feedback?.agentRating && (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Agent: {tour.agentId.firstName || tour.agentId.email}
                  </span>
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
                    {tour.feedback.agentRating}/5
                  </span>
                </div>
                {tour.feedback?.agentComment && (
                  <p className="text-sm text-foreground mt-2">{tour.feedback.agentComment}</p>
                )}
              </div>
            )}
          </div>

          {(tour.feedback?.overallExperience || tour.feedback?.wouldRecommend !== undefined) && (
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-4">
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

          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
            Reviewed by:{" "}
            {`${tour.buyerId?.firstName || ""} ${tour.buyerId?.lastName || ""}`.trim() ||
              tour.buyerId?.email ||
              "Buyer"}
            {tour.date ? ` · Tour date: ${new Date(tour.date).toLocaleDateString()}` : ""}
            {tour.sellerId && (
              <>
                {" "}
                · Seller: {tour.sellerId.firstName || tour.sellerId.email}
              </>
            )}
          </div>
        </div>
      ))}
        </div>
      )}
    </div>
  );
};
