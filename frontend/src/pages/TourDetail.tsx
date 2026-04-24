import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, MapPin, User, MessageSquare, CheckCircle, XCircle, RefreshCw, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DashboardSidebar } from "./AdminDashboard";
import { tourService } from "@/services/tour.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Tour, TourRescheduleHistory } from "@/types/models";
import { useState } from "react";
import { cn } from "@/lib/utils";
import AnimatedCalendar from "@/components/tours/AnimatedCalendar";
import AnimatedTimePicker from "@/components/tours/AnimatedTimePicker";

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState<{ startTime: string; endTime: string } | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleComment, setRescheduleComment] = useState("");
  const [reviewForm, setReviewForm] = useState({
    propertyRating: 0,
    agentRating: 0,
    propertyComment: "",
    agentComment: "",
    overallExperience: "" as "excellent" | "good" | "average" | "poor" | "",
    wouldRecommend: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["tour-detail", id],
    queryFn: () => tourService.getById(id || ""),
    enabled: !!id,
  });

  const tour = data?.data;

  const approveMutation = useMutation({
    mutationFn: () => tourService.approve(id!),
    onSuccess: () => {
      toast.success("Tour approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["tour-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["buyer-tours"] });
      queryClient.invalidateQueries({ queryKey: ["seller-tours"] });
      queryClient.invalidateQueries({ queryKey: ["agent-tours"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve tour");
    },
  });

  const declineMutation = useMutation({
    mutationFn: (reason: string) => tourService.decline(id!, reason),
    onSuccess: () => {
      toast.success("Tour declined");
      queryClient.invalidateQueries({ queryKey: ["tour-detail", id] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to decline tour");
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: () => {
      if (!rescheduleDate || !rescheduleTime) {
        throw new Error("Please select a date and time");
      }
      return tourService.reschedule(id!, {
        newDate: rescheduleDate.toISOString().split("T")[0],
        newStartTime: rescheduleTime.startTime,
        newEndTime: rescheduleTime.endTime,
        reason: rescheduleReason,
        comment: rescheduleComment,
      });
    },
    onSuccess: () => {
      toast.success("Reschedule request submitted!");
      setRescheduleModalOpen(false);
      setRescheduleDate(null);
      setRescheduleTime(null);
      setRescheduleReason("");
      setRescheduleComment("");
      queryClient.invalidateQueries({ queryKey: ["tour-detail", id] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to request reschedule");
    },
  });

  const approveRescheduleMutation = useMutation({
    mutationFn: () => tourService.approveReschedule(id!),
    onSuccess: () => {
      toast.success("Reschedule approved!");
      queryClient.invalidateQueries({ queryKey: ["tour-detail", id] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve reschedule");
    },
  });

  const rejectRescheduleMutation = useMutation({
    mutationFn: (reason: string) => tourService.rejectReschedule(id!, reason),
    onSuccess: () => {
      toast.success("Reschedule rejected");
      queryClient.invalidateQueries({ queryKey: ["tour-detail", id] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reject reschedule");
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: () => tourService.markComplete(id!),
    onSuccess: () => {
      toast.success("Tour marked as completed!");
      queryClient.invalidateQueries({ queryKey: ["tour-detail", id] });
      setReviewModalOpen(true);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to mark tour as complete");
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: () => {
      if (reviewForm.propertyRating === 0) {
        throw new Error("Please provide a property rating");
      }
      return tourService.submitFeedback(id!, {
        propertyRating: reviewForm.propertyRating,
        agentRating: reviewForm.agentRating || undefined,
        propertyComment: reviewForm.propertyComment || undefined,
        agentComment: reviewForm.agentComment || undefined,
        overallExperience: reviewForm.overallExperience || undefined,
        wouldRecommend: reviewForm.wouldRecommend,
      });
    },
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
      setReviewModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tour-detail", id] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit feedback");
    },
  });

  const canApprove = () => {
    if (!user || !tour) return false;
    if (tour.status === "pending") {
      return user.role === "seller" || user.role === "agent" || user.role === "admin";
    }
    if (tour.status === "reschedule_pending_buyer_approval") {
      return user.role === "buyer" && user._id === tour.buyerId._id;
    }
    return false;
  };

  const canReschedule = () => {
    if (!user || !tour) return false;
    if (tour.status === "confirmed" || tour.status === "pending") {
      return user.role === "seller" || user.role === "agent" || user.role === "admin";
    }
    return false;
  };

  const canMarkComplete = () => {
    if (!user || !tour) return false;
    return (
      tour.status === "confirmed" &&
      user.role === "buyer" &&
      user._id === tour.buyerId._id &&
      new Date(`${tour.date}T${tour.startTime}`) < new Date()
    );
  };

  const canReview = () => {
    if (!user || !tour) return false;
    const uid = user._id || user.id;
    const buyerId = tour.buyerId._id || tour.buyerId;
    const sellerId = tour.sellerId._id || tour.sellerId;
    const isBuyer = user.role === "buyer" && String(uid) === String(buyerId);
    const isSeller = user.role === "seller" && String(uid) === String(sellerId);
    return tour.status === "completed" && (isBuyer || isSeller) && !tour.feedback;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex">
        <DashboardSidebar active="Tours" role={user?.role || "buyer"} />
        <main className="flex-1 ml-64 p-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tour details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-muted flex">
        <DashboardSidebar active="Tours" role={user?.role || "buyer"} />
        <main className="flex-1 ml-64 p-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Tour not found</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  const propertyImage = tour.propertyId?.images?.[0]?.url;
  const agentName = tour.agentId
    ? `${tour.agentId.firstName || ""} ${tour.agentId.lastName || ""}`.trim() || tour.agentId.email
    : null;

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Tours" role={user?.role || "buyer"} />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/${user?.role || "buyer"}/tours`}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tours
          </Link>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Tour Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Info Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start gap-4 mb-6">
                {propertyImage ? (
                  <img
                    src={propertyImage}
                    alt={tour.propertyId?.title}
                    className="w-32 h-32 rounded-lg object-cover border border-border"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center border border-border">
                    <MapPin className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                    {tour.propertyId?.title || "Property"}
                  </h2>
                  <p className="text-muted-foreground mb-2">
                    {tour.propertyId?.location?.address}, {tour.propertyId?.location?.city},{" "}
                    {tour.propertyId?.location?.state}
                  </p>
                  <div className="text-xl font-bold text-primary">
                    ${Number(tour.propertyId?.price || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Tour Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Date</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {tour.date
                      ? new Date(tour.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "TBD"}
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Time</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {tour.startTime} - {tour.endTime}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                    tour.status === "pending" && "bg-yellow-500/10 text-yellow-600",
                    tour.status === "confirmed" && "bg-green-500/10 text-green-600",
                    tour.status === "reschedule_requested" && "bg-blue-500/10 text-blue-600",
                    tour.status === "reschedule_pending_buyer_approval" && "bg-blue-500/10 text-blue-600",
                    tour.status === "completed" && "bg-gray-500/10 text-gray-600",
                    (tour.status === "cancelled" || tour.status === "declined") &&
                      "bg-red-500/10 text-red-600"
                  )}
                >
                  {tour.status.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>

              {/* Message */}
              {tour.message && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">Your Message</span>
                  </div>
                  <p className="text-sm text-foreground">{tour.message}</p>
                </div>
              )}

              {/* Pending Reschedule Request */}
              {tour.pendingReschedule && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                        Reschedule Request
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        {tour.pendingReschedule.requestedByRole === "buyer"
                          ? "You"
                          : tour.pendingReschedule.requestedBy?.firstName ||
                            tour.pendingReschedule.requestedBy?.email ||
                            tour.pendingReschedule.requestedByRole}{" "}
                        has requested to reschedule this tour.
                      </p>
                      <div className="space-y-2 mb-4">
                        <div>
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            New Date:{" "}
                          </span>
                          <span className="text-sm text-blue-900 dark:text-blue-100">
                            {new Date(tour.pendingReschedule.newDate).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            New Time:{" "}
                          </span>
                          <span className="text-sm text-blue-900 dark:text-blue-100">
                            {tour.pendingReschedule.newStartTime} - {tour.pendingReschedule.newEndTime}
                          </span>
                        </div>
                        {tour.pendingReschedule.reason && (
                          <div>
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                              Reason:{" "}
                            </span>
                            <span className="text-sm text-blue-900 dark:text-blue-100">
                              {tour.pendingReschedule.reason}
                            </span>
                          </div>
                        )}
                        {tour.pendingReschedule.comment && (
                          <div>
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                              Comment:{" "}
                            </span>
                            <span className="text-sm text-blue-900 dark:text-blue-100">
                              {tour.pendingReschedule.comment}
                            </span>
                          </div>
                        )}
                      </div>
                      {canApprove() && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveRescheduleMutation.mutate()}
                            disabled={approveRescheduleMutation.isPending}
                            className="gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const reason = prompt("Reason for rejection (optional):");
                              if (reason !== null) {
                                rejectRescheduleMutation.mutate(reason);
                              }
                            }}
                            disabled={rejectRescheduleMutation.isPending}
                            className="gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Reschedule History */}
              {tour.rescheduleHistory && tour.rescheduleHistory.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-heading font-bold text-foreground mb-4">Reschedule History</h3>
                  <div className="space-y-4">
                    {tour.rescheduleHistory.map((history: TourRescheduleHistory, index: number) => (
                      <div
                        key={index}
                        className="bg-muted border border-border rounded-lg p-4 relative pl-8"
                      >
                        <div className="absolute left-2 top-4 w-1 h-full bg-primary/20 rounded-full" />
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              Requested by: {history.requestedBy.firstName || history.requestedBy.email} (
                              {history.requestedByRole})
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {history.createdAt
                                ? new Date(history.createdAt).toLocaleString()
                                : "Unknown date"}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              history.status === "approved" && "bg-green-500/10 text-green-600",
                              history.status === "rejected" && "bg-red-500/10 text-red-600",
                              history.status === "pending" && "bg-yellow-500/10 text-yellow-600"
                            )}
                          >
                            {history.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <div className="text-muted-foreground mb-1">Previous:</div>
                            <div className="font-medium text-foreground">
                              {new Date(history.oldDate).toLocaleDateString()} at {history.oldStartTime} -{" "}
                              {history.oldEndTime}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Requested:</div>
                            <div className="font-medium text-foreground">
                              {new Date(history.newDate).toLocaleDateString()} at {history.newStartTime} -{" "}
                              {history.newEndTime}
                            </div>
                          </div>
                        </div>
                        {history.reason && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Reason: </span>
                            <span className="text-foreground">{history.reason}</span>
                          </div>
                        )}
                        {history.comment && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Comment: </span>
                            <span className="text-foreground">{history.comment}</span>
                          </div>
                        )}
                        {history.approvedBy && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Approved by: {history.approvedBy.firstName || history.approvedBy.email} on{" "}
                            {history.approvedAt ? new Date(history.approvedAt).toLocaleDateString() : ""}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback/Review */}
              {tour.feedback && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Your Feedback
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-foreground mb-1">Property Rating</div>
                      <div className="flex items-center gap-1">
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
                        <span className="ml-2 text-sm text-muted-foreground">
                          {tour.feedback.propertyRating}/5
                        </span>
                      </div>
                    </div>
                    {tour.agentId && tour.feedback.agentRating && (
                      <div>
                        <div className="text-sm font-medium text-foreground mb-1">Agent Rating</div>
                        <div className="flex items-center gap-1">
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
                          <span className="ml-2 text-sm text-muted-foreground">
                            {tour.feedback.agentRating}/5
                          </span>
                        </div>
                      </div>
                    )}
                    {tour.feedback.propertyComment && (
                      <div>
                        <div className="text-sm font-medium text-foreground mb-1">Property Comment</div>
                        <p className="text-sm text-muted-foreground">{tour.feedback.propertyComment}</p>
                      </div>
                    )}
                    {tour.feedback.agentComment && (
                      <div>
                        <div className="text-sm font-medium text-foreground mb-1">Agent Comment</div>
                        <p className="text-sm text-muted-foreground">{tour.feedback.agentComment}</p>
                      </div>
                    )}
                    {tour.feedback.overallExperience && (
                      <div>
                        <div className="text-sm font-medium text-foreground mb-1">Overall Experience</div>
                        <span className="text-sm text-muted-foreground capitalize">
                          {tour.feedback.overallExperience}
                        </span>
                      </div>
                    )}
                    {tour.feedback.wouldRecommend !== undefined && (
                      <div className="flex items-center gap-2">
                        {tour.feedback.wouldRecommend ? (
                          <ThumbsUp className="w-5 h-5 text-green-500" />
                        ) : (
                          <ThumbsDown className="w-5 h-5 text-red-500" />
                        )}
                        <span className="text-sm text-foreground">
                          {tour.feedback.wouldRecommend ? "Would recommend" : "Would not recommend"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading font-bold text-foreground mb-4">Participants</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Buyer</div>
                  <div className="flex items-center gap-2">
                    {tour.buyerId.avatar ? (
                      <img
                        src={tour.buyerId.avatar}
                        alt={tour.buyerId.firstName || "Buyer"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {tour.buyerId.firstName && tour.buyerId.lastName
                          ? `${tour.buyerId.firstName} ${tour.buyerId.lastName}`
                          : tour.buyerId.email}
                      </div>
                      <div className="text-xs text-muted-foreground">{tour.buyerId.email}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Seller</div>
                  <div className="flex items-center gap-2">
                    {tour.sellerId.avatar ? (
                      <img
                        src={tour.sellerId.avatar}
                        alt={tour.sellerId.firstName || "Seller"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {tour.sellerId.firstName && tour.sellerId.lastName
                          ? `${tour.sellerId.firstName} ${tour.sellerId.lastName}`
                          : tour.sellerId.email}
                      </div>
                      <div className="text-xs text-muted-foreground">{tour.sellerId.email}</div>
                    </div>
                  </div>
                </div>
                {tour.agentId && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Agent</div>
                    <div className="flex items-center gap-2">
                      {tour.agentId.avatar ? (
                        <img
                          src={tour.agentId.avatar}
                          alt={agentName || "Agent"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-foreground">{agentName}</div>
                        <div className="text-xs text-muted-foreground">{tour.agentId.email}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading font-bold text-foreground mb-4">Actions</h3>
              <div className="space-y-2">
                {canApprove() && tour.status === "pending" && (
                  <>
                    <Button
                      className="w-full gap-2"
                      onClick={() => approveMutation.mutate()}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Tour
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        const reason = prompt("Reason for declining (optional):");
                        if (reason !== null) {
                          declineMutation.mutate(reason);
                        }
                      }}
                      disabled={declineMutation.isPending}
                    >
                      <XCircle className="w-4 h-4" />
                      Decline Tour
                    </Button>
                  </>
                )}
                {canReschedule() && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setRescheduleModalOpen(true)}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Request Reschedule
                  </Button>
                )}
                {canMarkComplete() && (
                  <Button
                    className="w-full gap-2"
                    onClick={() => markCompleteMutation.mutate()}
                    disabled={markCompleteMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Complete
                  </Button>
                )}
                {canReview() && (
                  <Button
                    className="w-full gap-2"
                    onClick={() => setReviewModalOpen(true)}
                  >
                    <Star className="w-4 h-4" />
                    Submit Review
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reschedule Modal */}
        <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request Reschedule</DialogTitle>
              <DialogDescription>
                Select a new date and time for this tour. The buyer will need to approve your request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <AnimatedCalendar
                selectedDate={rescheduleDate}
                onDateSelect={setRescheduleDate}
                minDate={new Date()}
              />
              {rescheduleDate && (
                <AnimatedTimePicker
                  selectedTime={rescheduleTime}
                  onTimeSelect={(start, end) => setRescheduleTime({ startTime: start, endTime: end })}
                  availableSlots={[]}
                />
              )}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Reason (optional)</label>
                <Textarea
                  placeholder="Why are you requesting to reschedule?"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Comment (optional)</label>
                <Textarea
                  placeholder="Any additional comments..."
                  value={rescheduleComment}
                  onChange={(e) => setRescheduleComment(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRescheduleModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => rescheduleMutation.mutate()}
                  disabled={!rescheduleDate || !rescheduleTime || rescheduleMutation.isPending}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Submit Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Review Modal */}
        <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Review & Feedback</DialogTitle>
              <DialogDescription>
                Help us improve by sharing your experience with this property and agent.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Property Rating */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Property Rating <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, propertyRating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "w-8 h-8 transition-colors",
                          star <= reviewForm.propertyRating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-300 hover:text-yellow-400"
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {reviewForm.propertyRating > 0 ? `${reviewForm.propertyRating}/5` : "Select rating"}
                  </span>
                </div>
              </div>

              {/* Agent Rating */}
              {tour.agentId && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Agent Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, agentRating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "w-8 h-8 transition-colors",
                            star <= reviewForm.agentRating
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-gray-300 hover:text-yellow-400"
                          )}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {reviewForm.agentRating > 0 ? `${reviewForm.agentRating}/5` : "Optional"}
                    </span>
                  </div>
                </div>
              )}

              {/* Property Comment */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Property Comment</label>
                <Textarea
                  placeholder="Share your thoughts about the property..."
                  value={reviewForm.propertyComment}
                  onChange={(e) => setReviewForm({ ...reviewForm, propertyComment: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Agent Comment */}
              {tour.agentId && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Agent Comment</label>
                  <Textarea
                    placeholder="Share your thoughts about the agent..."
                    value={reviewForm.agentComment}
                    onChange={(e) => setReviewForm({ ...reviewForm, agentComment: e.target.value })}
                    rows={4}
                  />
                </div>
              )}

              {/* Overall Experience */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Overall Experience</label>
                <select
                  value={reviewForm.overallExperience}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      overallExperience: e.target.value as "excellent" | "good" | "average" | "poor",
                    })
                  }
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground outline-none"
                >
                  <option value="">Select experience</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              {/* Would Recommend */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wouldRecommend"
                  checked={reviewForm.wouldRecommend}
                  onChange={(e) => setReviewForm({ ...reviewForm, wouldRecommend: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="wouldRecommend" className="text-sm text-foreground cursor-pointer">
                  I would recommend this property/agent to others
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => submitReviewMutation.mutate()}
                  disabled={reviewForm.propertyRating === 0 || submitReviewMutation.isPending}
                  className="gap-2"
                >
                  <Star className="w-4 h-4" />
                  Submit Review
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default TourDetail;
