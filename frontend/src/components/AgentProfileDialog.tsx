import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/UserAvatar";
import { userService } from "@/services/user.service";
import { getDisplayName } from "@/lib/userDisplay";
import {
  BadgeCheck,
  Home,
  Mail,
  MapPin,
  Phone,
  Star,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  agentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const StarRating = ({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={cn(
          size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
          star <= Math.round(rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"
        )}
      />
    ))}
  </div>
);

export const AgentProfileDialog = ({ agentId, open, onOpenChange }: Props) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["agent-public-profile", agentId],
    queryFn: () => userService.getAgentProfile(agentId!),
    enabled: open && Boolean(agentId),
  });

  const profile = data?.data;
  const agent = profile?.agent;
  const locationLabel = [agent?.location?.city, agent?.location?.state, agent?.location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading profile...</div>
        ) : isError || !profile || !agent ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Could not load agent profile</div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">{getDisplayName(agent)} profile</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col sm:flex-row gap-5">
              <UserAvatar user={agent} size="lg" className="w-20 h-20 text-xl" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-2xl font-heading font-bold text-foreground">
                    {getDisplayName(agent)}
                  </h2>
                  {agent.agentProfile?.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified Agent
                    </span>
                  )}
                </div>

                {agent.agentProfile?.yearsOfExperience ? (
                  <p className="text-sm text-muted-foreground mb-2">
                    {agent.agentProfile.yearsOfExperience}+ years experience
                    {agent.agentProfile.licenseNumber
                      ? ` · License ${agent.agentProfile.licenseNumber}`
                      : ""}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <StarRating rating={profile.averageRating} />
                    <span className="font-semibold text-foreground">{profile.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({profile.reviewCount} review{profile.reviewCount === 1 ? "" : "s"})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Home className="w-4 h-4" />
                    {profile.assignedProperties} assigned propert
                    {profile.assignedProperties === 1 ? "y" : "ies"}
                  </div>
                </div>
              </div>
            </div>

            {agent.agentProfile?.bio && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{agent.agentProfile.bio}</p>
              </div>
            )}

            {(agent.agentProfile?.specialization?.length || agent.agentProfile?.languages?.length) && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {agent.agentProfile?.specialization?.length ? (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {agent.agentProfile.specialization.map((item) => (
                        <span
                          key={item}
                          className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {agent.agentProfile?.languages?.length ? (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Languages</h3>
                    <p className="text-sm text-muted-foreground">
                      {agent.agentProfile.languages.join(", ")}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            <div className="mt-5 space-y-2 text-sm">
              {agent.phone && (
                <a href={`tel:${agent.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Phone className="w-4 h-4" /> {agent.phone}
                </a>
              )}
              {agent.email && (
                <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Mail className="w-4 h-4" /> {agent.email}
                </a>
              )}
              {locationLabel && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" /> {locationLabel}
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-heading font-bold text-foreground mb-4">Ratings & Reviews</h3>
              {profile.reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center bg-muted rounded-lg">
                  No reviews yet for this agent.
                </p>
              ) : (
                <div className="space-y-4">
                  {profile.reviews.map((review) => (
                    <div key={review._id} className="bg-muted/60 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-medium text-foreground text-sm">{review.propertyTitle}</p>
                          {review.propertyLocation && (
                            <p className="text-xs text-muted-foreground">{review.propertyLocation}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {review.submittedAt
                            ? new Date(review.submittedAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-xs text-muted-foreground">{review.rating}/5</span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-foreground mb-2">{review.comment}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>By {review.buyerName}</span>
                        {review.wouldRecommend && (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <ThumbsUp className="w-3 h-3" /> Recommends
                          </span>
                        )}
                        {review.overallExperience && (
                          <span className="capitalize">{review.overallExperience} experience</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
