import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Home, Mail, MapPin, Phone, Star, ThumbsUp } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { PropertyListCard } from "@/components/PropertyListCard";
import { userService } from "@/services/user.service";
import { getDisplayName } from "@/lib/userDisplay";
import { getListingPromotionBadge } from "@/features/ads/lib/promotionDisplay";
import { getPropertyRating } from "@/lib/ratings";
import { getPropertyDetailPath } from "@/lib/propertyRoutes";
import { formatRentPrice, isRentalListing } from "@/features/rentals/lib/rentalFormat";
import property1 from "@/assets/property-1.jpg";
import heroBg from "@/assets/hero-bg.jpg";

const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["agent-public-profile", id],
    queryFn: () => userService.getAgentProfile(id!),
    enabled: Boolean(id),
  });

  const profile = data?.data;
  const agent = profile?.agent;
  const properties = profile?.properties || [];
  const locationLabel = [agent?.location?.city, agent?.location?.state, agent?.location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative py-12 md:py-16">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-secondary/85" />
        </div>
        <div className="relative z-10 container">
          <Link
            to="/agents"
            className="inline-flex items-center gap-1 text-sm text-dark-surface-foreground/80 hover:text-dark-surface-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> All agents
          </Link>
          {agent ? (
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <UserAvatar user={agent} size="lg" className="w-28 h-28 text-3xl" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-heading font-bold text-dark-surface-foreground">
                    {getDisplayName(agent)}
                  </h1>
                  {agent.agentProfile?.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-100 bg-green-600/80 px-2 py-0.5 rounded-full">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-dark-surface-foreground/80">
                  {agent.agentProfile?.specialization?.[0] || "Property Expert"}
                  {agent.agentProfile?.yearsOfExperience
                    ? ` · ${agent.agentProfile.yearsOfExperience}+ years experience`
                    : ""}
                </p>
              </div>
              <Link to={`/contact-agent?agentId=${agent._id || agent.id}`}>
                <Button>Contact Agent</Button>
              </Link>
            </div>
          ) : (
            <h1 className="text-3xl font-heading font-bold text-dark-surface-foreground">Agent</h1>
          )}
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          {isLoading ? (
            <p className="text-muted-foreground">Loading agent profile...</p>
          ) : isError || !profile || !agent ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <p className="text-muted-foreground mb-4">This agent profile is not available.</p>
              <Link to="/agents">
                <Button variant="outline">Back to agents</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
                  <h2 className="font-heading font-bold text-foreground mb-3">About</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {agent.agentProfile?.bio ||
                      `${getDisplayName(agent)} helps clients buy, sell, and tour properties on House Tour Guide.`}
                  </p>
                  {(agent.agentProfile?.specialization?.length || agent.agentProfile?.languages?.length) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      {agent.agentProfile?.specialization?.length ? (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2">Specializations</h3>
                          <div className="flex flex-wrap gap-2">
                            {agent.agentProfile.specialization.map((item) => (
                              <span key={item} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {agent.agentProfile?.languages?.length ? (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2">Languages</h3>
                          <p className="text-sm text-muted-foreground">{agent.agentProfile.languages.join(", ")}</p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                <div className="bg-card border border-border rounded-xl p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold text-foreground">{profile.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({profile.reviewCount} review{profile.reviewCount === 1 ? "" : "s"})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Home className="w-4 h-4" />
                    {profile.assignedProperties} assigned propert
                    {profile.assignedProperties === 1 ? "y" : "ies"}
                  </div>
                  {locationLabel && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" /> {locationLabel}
                    </div>
                  )}
                  {agent.phone && (
                    <a href={`tel:${agent.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                      <Phone className="w-4 h-4" /> {agent.phone}
                    </a>
                  )}
                  {agent.email && (
                    <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                      <Mail className="w-4 h-4" /> {agent.email}
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Properties</h2>
                {properties.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-10 text-center bg-card border border-border rounded-xl">
                    No active listings for this agent yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((prop) => {
                      const promotion = getListingPromotionBadge(prop, isRentalListing(prop) ? "For Rent" : "For Sale");
                      return (
                        <PropertyListCard
                          key={prop._id}
                          id={prop._id}
                          to={getPropertyDetailPath(prop)}
                          image={prop.images?.[0]?.url || property1}
                          title={prop.title}
                          location={[prop.location?.address, prop.location?.city].filter(Boolean).join(", ")}
                          price={isRentalListing(prop) ? formatRentPrice(prop.price) : `$${Number(prop.price || 0).toLocaleString()}`}
                          beds={prop.bedrooms || 0}
                          baths={prop.bathrooms || 0}
                          sqft={Number(prop.squareFeet || 0).toLocaleString()}
                          rating={getPropertyRating(prop)}
                          badge={promotion.label}
                          badgeVariant={promotion.variant}
                          petPolicy={prop.rentalDetails?.petPolicy}
                          petFee={prop.rentalDetails?.petFee}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Reviews</h2>
                {profile.reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-10 text-center bg-card border border-border rounded-xl">
                    No reviews yet for this agent.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {profile.reviews.map((review) => (
                      <div key={review._id} className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <p className="font-medium text-foreground">{review.propertyTitle}</p>
                            {review.propertyLocation && (
                              <p className="text-xs text-muted-foreground">{review.propertyLocation}</p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {review.submittedAt ? new Date(review.submittedAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.round(review.rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{review.rating}/5</span>
                        </div>
                        {review.comment && <p className="text-sm text-foreground mb-2">{review.comment}</p>}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>By {review.buyerName}</span>
                          {review.wouldRecommend && (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <ThumbsUp className="w-3 h-3" /> Recommends
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AgentDetail;
