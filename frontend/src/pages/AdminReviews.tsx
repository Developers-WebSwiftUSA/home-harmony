import { useQuery } from "@tanstack/react-query";
import { Star, User, Home, Calendar, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { tourService } from "@/services/tour.service";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const AdminReviews = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => tourService.list({ status: "completed" }),
  });

  const tours = (data?.data || []).filter((tour) => tour.feedback);

  const averagePropertyRating =
    tours.length > 0
      ? tours.reduce((sum, tour) => sum + (tour.feedback?.propertyRating || 0), 0) / tours.length
      : 0;
  const averageAgentRating =
    tours.filter((t) => t.feedback?.agentRating).length > 0
      ? tours
          .filter((t) => t.feedback?.agentRating)
          .reduce((sum, tour) => sum + (tour.feedback?.agentRating || 0), 0) /
        tours.filter((t) => t.feedback?.agentRating).length
      : 0;

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Reviews" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Property & Agent Reviews</h1>
          <p className="text-sm text-muted-foreground">View all feedback and reviews from completed tours</p>
        </div>

        {/* Stats */}
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
            <div className="text-2xl font-bold text-blue-600">{averageAgentRating.toFixed(1)}</div>
            <div className="text-sm text-blue-600">Avg Agent Rating</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600">
              {tours.filter((t) => t.feedback?.wouldRecommend).length}
            </div>
            <div className="text-sm text-green-600">Would Recommend</div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tours.map((tour) => (
              <div key={tour._id} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Home className="w-5 h-5 text-primary" />
                      <Link
                        to={`/properties/${tour.propertyId._id}`}
                        className="text-lg font-heading font-bold text-foreground hover:text-primary transition-colors"
                      >
                        {tour.propertyId.title}
                      </Link>
                    </div>
                    <div className="text-sm text-muted-foreground ml-8">
                      {tour.propertyId.location?.address}, {tour.propertyId.location?.city},{" "}
                      {tour.propertyId.location?.state}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tour.feedback?.submittedAt
                      ? new Date(tour.feedback.submittedAt).toLocaleDateString()
                      : "Unknown date"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Property Review */}
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

                  {/* Agent Review */}
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

                {/* Additional Feedback */}
                {(tour.feedback?.overallExperience || tour.feedback?.wouldRecommend !== undefined) && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
                    {tour.feedback?.overallExperience && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Overall Experience: </span>
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

                {/* Buyer Info */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    Reviewed by: {tour.buyerId.firstName || tour.buyerId.email} · Tour Date:{" "}
                    {tour.date ? new Date(tour.date).toLocaleDateString() : "Unknown"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReviews;
