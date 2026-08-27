import { useState } from "react";
import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize, Heart, Share2, Star, Calendar, Phone, Mail, ArrowLeft, Check, MessageSquare, Sparkles, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import property1 from "@/assets/property-1.jpg";
import agent1 from "@/assets/agent-1.jpg";
import { propertyService } from "@/services/property.service";
import { messageService } from "@/services/message.service";
import { useAuth } from "@/context/AuthContext";
import { getPropertyContactUser, hasAssignedAgent } from "@/lib/propertyContact";
import { getAgentRating, getPropertyRating } from "@/lib/ratings";
import { RatingStars } from "@/components/RatingStars";
import { toast } from "sonner";
import TourBookingModal from "@/components/tours/TourBookingModal";
import { formatPetPolicy } from "@/lib/petPolicy";
import { buildLoginRedirect, getPropertyDetailPath } from "@/lib/propertyRoutes";
import { favoriteService } from "@/services/favorite.service";
import { getListingPromotionBadge } from "@/features/ads/lib/promotionDisplay";
import { cn } from "@/lib/utils";
import { isRentalListing } from "@/features/rentals/lib/rentalFormat";

const amenities = ["Air Conditioning", "Swimming Pool", "Gym", "Parking", "Security", "Garden", "Laundry", "Elevator"];

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["property", id, isAuthenticated],
    queryFn: () => propertyService.getById(id || "", isAuthenticated),
    enabled: Boolean(id),
  });

  const apiProperty = data?.data;
  const isSaleListing = Boolean(apiProperty && !isRentalListing(apiProperty));

  const { data: favoriteData } = useQuery({
    queryKey: ["favorite-check", apiProperty?._id],
    queryFn: () => favoriteService.check(apiProperty!._id),
    enabled: isAuthenticated && Boolean(apiProperty?._id) && isSaleListing,
  });
  const isFavorited = favoriteData?.isFavorited ?? false;

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!apiProperty?._id) throw new Error("Property not found");
      if (isFavorited) {
        return favoriteService.removeByProperty(apiProperty._id);
      }
      return favoriteService.add(apiProperty._id);
    },
    onSuccess: () => {
      if (!apiProperty?._id) return;
      queryClient.invalidateQueries({ queryKey: ["favorite-check", apiProperty._id] });
      queryClient.invalidateQueries({ queryKey: ["buyer-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["buyer-favorites-page"] });
      toast.success(isFavorited ? "Removed from favorites" : "Saved to favorites");
    },
    onError: (error: Error) => toast.error(error.message || "Could not update favorites"),
  });

  const startConversationMutation = useMutation({
    mutationFn: () => {
      if (!apiProperty?._id) throw new Error("Property not found");
      return messageService.getPropertyConversation(apiProperty._id);
    },
    onSuccess: (response) => {
      const conversation = response.data;
      navigate(`/buyer/messages?conversation=${conversation._id}`);
      toast.success(
        response.contactedRole === "agent"
          ? "Connected with the assigned agent!"
          : "Conversation started!"
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to start conversation");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-24 container text-center text-muted-foreground">Loading property...</div>
        <Footer />
      </div>
    );
  }

  if (isError || !apiProperty) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-16 container text-center">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-4">Property Not Found</h1>
          <Link to="/properties"><Button>Back to Properties</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (isRentalListing(apiProperty)) {
    return <Navigate to={getPropertyDetailPath(apiProperty)} replace />;
  }

  const property = {
    image: apiProperty.images?.[0]?.url || property1,
    title: apiProperty.title,
    location: [apiProperty.location?.address, apiProperty.location?.city, apiProperty.location?.state]
      .filter(Boolean)
      .join(", "),
    price: `$${Number(apiProperty.price || 0).toLocaleString()}`,
    beds: apiProperty.bedrooms || 0,
    baths: apiProperty.bathrooms || 0,
    sqft: Number(apiProperty.squareFeet || 0).toLocaleString(),
    rating: getPropertyRating(apiProperty),
    type: apiProperty.type || "Property",
    year: 2024,
    description: apiProperty.description || "",
  };

  const promotionBadge = getListingPromotionBadge(apiProperty, property.type);
  const propertyContact = getPropertyContactUser(apiProperty);
  const contactUser = propertyContact?.user;
  const assignedAgent = hasAssignedAgent(apiProperty);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: apiProperty.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Unable to share this listing");
    }
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      navigate(buildLoginRedirect(getPropertyDetailPath(apiProperty)));
      return;
    }
    favoriteMutation.mutate();
  };

  const handleContactAgent = () => {
    if (!isAuthenticated) {
      navigate(`/login?chatProperty=${id}`);
      return;
    }
    if (user?.role !== "buyer") {
      toast.error("Please log in as a buyer to inquire about this property");
      return;
    }
    if (!propertyContact?.userId) {
      toast.error("No agent or seller available for this property");
      return;
    }
    startConversationMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-8 pb-8">
        <div className="container">
          <Link to="/properties" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Properties
          </Link>

          {/* Hero Image */}
          <div className="rounded-xl overflow-hidden h-[300px] md:h-[450px] mb-8">
            <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">{property.type}</span>
                  {(promotionBadge.variant === "sponsored" || promotionBadge.variant === "advertised") && (
                    <span
                      className={cn(
                        "text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ml-2",
                        promotionBadge.variant === "sponsored"
                          ? "bg-amber-500 text-white"
                          : "bg-sky-600 text-white"
                      )}
                    >
                      {promotionBadge.label}
                    </span>
                  )}
                  <h1 className="text-3xl font-heading font-bold text-foreground mt-3">{property.title}</h1>
                  <div className="mt-2">
                    <RatingStars rating={property.rating} />
                  </div>
                  <p className="flex items-center gap-1 text-muted-foreground mt-2"><MapPin className="w-4 h-4" />{property.location}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleFavorite}
                    disabled={favoriteMutation.isPending}
                    className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors disabled:opacity-50"
                    aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
                  >
                    <Heart className={cn("w-4 h-4", isFavorited && "fill-red-500 text-red-500")} />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                    aria-label="Share property"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-3xl font-bold text-primary mb-8">{property.price}</div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Bed, label: "Bedrooms", value: property.beds },
                  { icon: Bath, label: "Bathrooms", value: property.baths },
                  { icon: Maximize, label: "Sq Ft", value: property.sqft },
                  { icon: Calendar, label: "Year Built", value: property.year },
                ].map((s) => (
                  <div key={s.label} className="bg-muted rounded-lg p-4 text-center">
                    <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />{a}
                    </div>
                  ))}
                </div>
              </div>

              {apiProperty?.rentalDetails?.petPolicy && (
                <div className="mb-8">
                  <h2 className="text-xl font-heading font-bold text-foreground mb-4">Pet Policy</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                      <PawPrint className="w-4 h-4 text-primary" />
                      {formatPetPolicy(apiProperty.rentalDetails.petPolicy)}
                    </span>
                    {apiProperty.rentalDetails.petFee != null && apiProperty.rentalDetails.petFee > 0 && (
                      <span className="text-sm text-muted-foreground">
                        Pet fee: ${apiProperty.rentalDetails.petFee}/month
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Agent/Seller Card */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-heading font-bold text-foreground mb-4">
                  {assignedAgent ? "Assigned Agent" : "Listed By"}
                </h3>
                {contactUser ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      {assignedAgent && propertyContact?.userId ? (
                        <Link to={`/agents/${propertyContact.userId}`} className="flex items-center gap-3 min-w-0 hover:opacity-90">
                          {contactUser.avatar ? (
                            <img src={contactUser.avatar} alt={contactUser.firstName || "User"} className="w-14 h-14 rounded-full object-cover" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-bold text-lg">
                                {contactUser.firstName?.[0]?.toUpperCase() || contactUser.email?.[0]?.toUpperCase() || "U"}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-foreground">
                              {contactUser.firstName && contactUser.lastName
                                ? `${contactUser.firstName} ${contactUser.lastName}`
                                : contactUser.email || "User"}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {contactUser.role || "User"}
                            </div>
                            <div className="mt-2">
                              <RatingStars rating={getAgentRating(contactUser)} size="xs" />
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <>
                      {contactUser.avatar ? (
                        <img src={contactUser.avatar} alt={contactUser.firstName || "User"} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-lg">
                            {contactUser.firstName?.[0]?.toUpperCase() || contactUser.email?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-foreground">
                          {contactUser.firstName && contactUser.lastName
                            ? `${contactUser.firstName} ${contactUser.lastName}`
                            : contactUser.email || "User"}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {contactUser.role || "User"}
                        </div>
                      </div>
                        </>
                      )}
                    </div>
                    {contactUser.phone && (
                      <div className="space-y-2 mb-4">
                        <a href={`tel:${contactUser.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Phone className="w-4 h-4" /> {contactUser.phone}
                        </a>
                        {contactUser.email && (
                          <a href={`mailto:${contactUser.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <Mail className="w-4 h-4" /> {contactUser.email}
                          </a>
                        )}
                      </div>
                    )}
                    <Button 
                      className="w-full gap-2"
                      onClick={handleContactAgent}
                      disabled={startConversationMutation.isPending}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {startConversationMutation.isPending
                        ? "Starting..."
                        : assignedAgent
                          ? "Chat with Agent"
                          : "Start Conversation"}
                    </Button>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No agent or seller information available
                  </div>
                )}
              </div>

              {/* Schedule Tour — buyers only */}
              {(!isAuthenticated || user?.role === "buyer") && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-bold text-foreground">Schedule a Tour</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Book a personalized tour of this property with our interactive booking system.
                  </p>
                  <Button
                    className="w-full gap-2"
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate(buildLoginRedirect(getPropertyDetailPath(apiProperty)));
                        return;
                      }
                      if (!apiProperty) {
                        toast.error("Property information not available");
                        return;
                      }
                      setBookingModalOpen(true);
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                    Book Tour Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Tour Booking Modal */}
      {apiProperty && (
        <TourBookingModal
          open={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          property={apiProperty}
          onSuccess={() => {
            navigate("/buyer/tours");
          }}
        />
      )}
    </div>
  );
};

export default PropertyDetail;
