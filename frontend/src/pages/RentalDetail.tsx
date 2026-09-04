import { useMemo, useState } from "react";
import { useParams, Link, useNavigate, useSearchParams, Navigate } from "react-router-dom";
import {
  MapPin, Bed, Bath, Maximize, Share2, Calendar, Phone, Mail, ArrowLeft,
  Check, MessageSquare, DollarSign, PawPrint, Sofa,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import property1 from "@/assets/property-1.jpg";
import { getAllPropertyImageUrls } from "@/lib/propertyImage";
import { propertyService } from "@/services/property.service";
import { messageService } from "@/services/message.service";
import { rentalApplicationService } from "@/services/rentalApplication.service";
import { useAuth } from "@/context/AuthContext";
import { getPropertyContactUser, hasAssignedAgent } from "@/lib/propertyContact";
import { getAgentRating, getPropertyRating } from "@/lib/ratings";
import { RatingStars } from "@/components/RatingStars";
import { toast } from "sonner";
import TourBookingModal from "@/components/tours/TourBookingModal";
import { RentalFavoriteButton } from "@/features/rentals/components/RentalFavoriteButton";
import { RentalCardCarousel } from "@/features/rentals/components/RentalCardCarousel";
import {
  estimateMonthlyCost,
  formatRentPrice,
  getMonthlyFeesTotal,
  getPropertyLocationLabel,
} from "@/features/rentals/lib/rentalFormat";
import { formatPetPolicy } from "@/lib/petPolicy";
import { isRentalListing } from "@/features/rentals/lib/rentalFormat";
import { buildLoginRedirect } from "@/lib/propertyRoutes";
import { getListingPromotionBadge } from "@/features/ads/lib/promotionDisplay";
import { cn } from "@/lib/utils";
import { RentalCard } from "@/features/rentals/components/RentalCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RentalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(searchParams.get("apply") === "1");
  const [includePets, setIncludePets] = useState(false);
  const [applyForm, setApplyForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    moveInDate: "",
    message: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["rental", id, isAuthenticated],
    queryFn: () => propertyService.getById(id || "", isAuthenticated),
    enabled: Boolean(id),
  });

  const apiProperty = data?.data;

  const { data: similarData } = useQuery({
    queryKey: ["similar-rentals", apiProperty?.location?.city],
    queryFn: () =>
      propertyService.list({
        listingType: "rent",
        status: "active",
        city: apiProperty?.location?.city,
        limit: 4,
      }),
    enabled: Boolean(apiProperty?.location?.city),
  });

  const similar = (similarData?.data || []).filter((p) => p._id !== id).slice(0, 3);

  const images = useMemo(() => {
    const urls = getAllPropertyImageUrls(apiProperty?.images);
    return urls.length ? urls : [property1];
  }, [apiProperty]);

  const amenities = useMemo(() => {
    const list = [...(apiProperty?.amenities || [])];
    const features = apiProperty?.features || {};
    if (features.pool) list.push("Swimming Pool");
    if (features.gym) list.push("Gym");
    if (features.parking) list.push("Parking");
    if (features.airConditioning) list.push("Air Conditioning");
    if (features.elevator) list.push("Elevator");
    if (features.balcony) list.push("Balcony");
    return [...new Set(list)];
  }, [apiProperty]);

  const propertyContact = apiProperty ? getPropertyContactUser(apiProperty) : null;
  const contactUser = propertyContact?.user;
  const assignedAgent = apiProperty ? hasAssignedAgent(apiProperty) : false;

  const startConversationMutation = useMutation({
    mutationFn: () => messageService.getPropertyConversation(apiProperty!._id),
    onSuccess: (response) => {
      navigate(`/buyer/messages?conversation=${response.data._id}`);
      toast.success("Conversation started");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to contact"),
  });

  const applyMutation = useMutation({
    mutationFn: (payload: {
      fullName: string;
      email: string;
      phone?: string;
      moveInDate?: string;
      message?: string;
    }) =>
      rentalApplicationService.create({
        propertyId: id!,
        ...payload,
      }),
    onSuccess: () => {
      toast.success("Application submitted! We'll be in touch soon.");
      setApplyOpen(false);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to submit application"),
  });

  const handleApply = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate(buildLoginRedirect(`/rentals/${id}?apply=1`));
      return;
    }
    applyMutation.mutate({
      fullName: applyForm.fullName,
      email: applyForm.email,
      phone: applyForm.phone,
      moveInDate: applyForm.moveInDate,
      message: applyForm.message,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-16 container text-center text-muted-foreground">Loading rental...</div>
      </div>
    );
  }

  if (!apiProperty) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-16 text-center container">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-4">Rental Not Found</h1>
          <Link to="/rentals"><Button>Browse Rentals</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isRentalListing(apiProperty)) {
    return <Navigate to={`/properties/${apiProperty._id}`} replace />;
  }

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

  const monthlyEstimate = estimateMonthlyCost(apiProperty, { pets: includePets });
  const feesTotal = getMonthlyFeesTotal(apiProperty);
  const promotionBadge = getListingPromotionBadge(apiProperty, "For Rent");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-8 pb-8">
        <div className="container">
          <Link to="/rentals" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Rentals
          </Link>

          <div className="rounded-xl overflow-hidden h-[300px] md:h-[450px] mb-8 border border-border">
            <RentalCardCarousel images={images} alt={apiProperty.title} className="h-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                    For Rent · {apiProperty.type}
                  </span>
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
                  <h1 className="text-3xl font-heading font-bold text-foreground mt-3">{apiProperty.title}</h1>
                  <RatingStars rating={getPropertyRating(apiProperty)} />
                  <p className="flex items-center gap-1 text-muted-foreground mt-2">
                    <MapPin className="w-4 h-4" />
                    {getPropertyLocationLabel(apiProperty)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <RentalFavoriteButton propertyId={apiProperty._id} />
                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Share rental"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-3xl font-bold text-primary mb-2">{formatRentPrice(apiProperty.price)}</div>
              {apiProperty.availabilityDate && (
                <p className="text-sm text-muted-foreground mb-6">
                  Available from {new Date(apiProperty.availabilityDate).toLocaleDateString()}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Bed, label: "Bedrooms", value: apiProperty.bedrooms },
                  { icon: Bath, label: "Bathrooms", value: apiProperty.bathrooms },
                  { icon: Maximize, label: "Sq Ft", value: Number(apiProperty.squareFeet || 0).toLocaleString() },
                  { icon: Calendar, label: "Listed", value: apiProperty.createdAt ? new Date(apiProperty.createdAt).toLocaleDateString() : "—" },
                ].map((s) => (
                  <div key={s.label} className="bg-muted rounded-lg p-4 text-center">
                    <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{apiProperty.description}</p>
              </div>

              {amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-heading font-bold text-foreground mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((a) => (
                      <div key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary" />{a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8 bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Fees & monthly cost
                </h2>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between"><span>Base rent</span><span>{formatRentPrice(apiProperty.price)}</span></div>
                  {(apiProperty.rentalDetails?.monthlyFees || []).map((fee) => (
                    <div key={fee.label} className="flex justify-between text-muted-foreground">
                      <span>{fee.label}</span><span>${fee.amount}/mo</span>
                    </div>
                  ))}
                  {feesTotal > 0 && (
                    <div className="flex justify-between font-medium border-t border-border pt-2">
                      <span>Fees subtotal</span><span>${feesTotal}/mo</span>
                    </div>
                  )}
                  {apiProperty.rentalDetails?.deposit ? (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Security deposit</span><span>${apiProperty.rentalDetails.deposit.toLocaleString()}</span>
                    </div>
                  ) : null}
                </div>
                <div className="border-t border-border pt-4">
                  <label className="flex items-center gap-2 text-sm mb-3">
                    <Checkbox checked={includePets} onCheckedChange={(v) => setIncludePets(Boolean(v))} />
                    Include pet fee (${apiProperty.rentalDetails?.petFee || 0}/mo)
                  </label>
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>Estimated monthly</span>
                    <span>${monthlyEstimate.toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                {apiProperty.rentalDetails?.furnished && (
                  <span className="inline-flex items-center gap-1 text-xs bg-muted px-3 py-1.5 rounded-full">
                    <Sofa className="w-3.5 h-3.5" /> Furnished
                  </span>
                )}
                {apiProperty.rentalDetails?.petPolicy && (
                  <span className="inline-flex items-center gap-1 text-xs bg-muted px-3 py-1.5 rounded-full">
                    <PawPrint className="w-3.5 h-3.5" /> {formatPetPolicy(apiProperty.rentalDetails.petPolicy)}
                  </span>
                )}
                {apiProperty.rentalDetails?.laundry && apiProperty.rentalDetails.laundry !== "none" && (
                  <span className="text-xs bg-muted px-3 py-1.5 rounded-full capitalize">
                    Laundry: {apiProperty.rentalDetails.laundry.replace("_", " ")}
                  </span>
                )}
              </div>

              {similar.length > 0 && (
                <div>
                  <h2 className="text-xl font-heading font-bold text-foreground mb-4">Similar rentals</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {similar.map((property) => (
                      <RentalCard key={property._id} property={property} layout="grid" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 space-y-3">
                <Button className="w-full" onClick={() => setApplyOpen(true)}>Apply Now</Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate(buildLoginRedirect(`/rentals/${id}`));
                      return;
                    }
                    if (user?.role !== "buyer") {
                      toast.error("Please log in as a buyer to contact");
                      return;
                    }
                    startConversationMutation.mutate();
                  }}
                  disabled={startConversationMutation.isPending}
                >
                  <MessageSquare className="w-4 h-4" /> Contact
                </Button>
                {(!isAuthenticated || user?.role === "buyer") && (
                  <Button variant="secondary" className="w-full gap-2" onClick={() => {
                    if (!isAuthenticated) {
                      navigate(buildLoginRedirect(`/rentals/${id}`));
                      return;
                    }
                    setBookingModalOpen(true);
                  }}>
                    <Calendar className="w-4 h-4" /> Schedule Tour
                  </Button>
                )}
              </div>

              {contactUser && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-heading font-bold text-foreground mb-4">
                    {assignedAgent ? "Leasing Agent" : "Property Contact"}
                  </h3>
                  <div className="font-bold text-foreground mb-1">
                    {contactUser.firstName} {contactUser.lastName}
                  </div>
                  {contactUser.phone && (
                    <a href={`tel:${contactUser.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2">
                      <Phone className="w-4 h-4" /> {contactUser.phone}
                    </a>
                  )}
                  {contactUser.email && (
                    <a href={`mailto:${contactUser.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                      <Mail className="w-4 h-4" /> {contactUser.email}
                    </a>
                  )}
                  {assignedAgent && <RatingStars rating={getAgentRating(contactUser)} size="xs" />}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for this rental</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <Label>Full name</Label>
              <Input required value={applyForm.fullName} onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" required value={applyForm.email} onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={applyForm.phone} onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })} />
            </div>
            <div>
              <Label>Desired move-in date</Label>
              <Input type="date" value={applyForm.moveInDate} onChange={(e) => setApplyForm({ ...applyForm, moveInDate: e.target.value })} />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={applyForm.message} onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={applyMutation.isPending}>
              {applyMutation.isPending ? "Submitting..." : "Submit application"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {apiProperty && (
        <TourBookingModal
          open={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          property={apiProperty}
          onSuccess={() => navigate("/buyer/tours")}
        />
      )}
    </div>
  );
};

export default RentalDetail;
