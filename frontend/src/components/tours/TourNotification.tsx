import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tour } from "@/types/models";
import { cn } from "@/lib/utils";
import { formatTourCountdown, getTourDateString } from "@/lib/tourDate";
import { getPropertyPrimaryImage } from "@/lib/propertyImage";

interface TourNotificationProps {
  tour: Tour;
  onDismiss?: () => void;
  onView?: () => void;
  className?: string;
}

const TourNotification = ({ tour, onDismiss, onView, className }: TourNotificationProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      if (!tour.date || !tour.startTime) {
        setTimeRemaining("");
        return;
      }

      const countdown = formatTourCountdown(tour.date, tour.startTime);
      if (!countdown) {
        setTimeRemaining("");
        setIsExpired(false);
        return;
      }

      if (countdown === "Tour time has passed") {
        setIsExpired(true);
        setTimeRemaining(countdown);
        return;
      }

      setIsExpired(false);
      setTimeRemaining(countdown);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [tour.date, tour.startTime]);

  const getStatusColor = () => {
    switch (tour.status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "confirmed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "reschedule_requested":
      case "reschedule_pending_buyer_approval":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "completed":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      case "cancelled":
      case "declined":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const propertyImage = getPropertyPrimaryImage(tour.propertyId?.images);
  const propertyTitle = tour.propertyId?.title || "Property";
  const agentName = tour.agentId
    ? `${tour.agentId.firstName || ""} ${tour.agentId.lastName || ""}`.trim() || tour.agentId.email
    : null;

  return (
    <div
      className={cn(
        "bg-card border-2 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300",
        "animate-fade-in",
        getStatusColor(),
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Property Thumbnail */}
        {propertyImage ? (
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-border">
            <img
              src={propertyImage}
              alt={propertyTitle}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-muted flex items-center justify-center border-2 border-border">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-bold text-foreground truncate mb-1">
                {propertyTitle}
              </h4>
              {agentName && (
                <p className="text-xs text-muted-foreground truncate">
                  Agent: {agentName}
                </p>
              )}
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-background/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Date and Time */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-foreground">
                {getTourDateString(tour.date)
                  ? new Date(getTourDateString(tour.date) + "T12:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Date TBD"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-foreground">
                {tour.startTime} - {tour.endTime}
              </span>
            </div>
          </div>

          {/* Countdown Timer */}
          {timeRemaining && !isExpired && ["pending", "confirmed"].includes(tour.status) && (
            <div className="mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span className="text-xs font-bold text-primary">
                  {timeRemaining} remaining
                </span>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-full capitalize",
                getStatusColor()
              )}
            >
              {tour.status.replace(/_/g, " ")}
            </span>
            {onView && (
              <Button
                size="sm"
                variant="outline"
                onClick={onView}
                className="text-xs h-7"
              >
                View Details
              </Button>
            )}
          </div>

          {/* Reschedule Notice */}
          {tour.pendingReschedule && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  <div className="font-medium mb-1">Reschedule Requested</div>
                  <div>
                    New time: {new Date(tour.pendingReschedule.newDate).toLocaleDateString()} at{" "}
                    {tour.pendingReschedule.newStartTime} - {tour.pendingReschedule.newEndTime}
                  </div>
                  {tour.pendingReschedule.reason && (
                    <div className="mt-1 italic">"{tour.pendingReschedule.reason}"</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourNotification;
