import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize, Heart, Share2, Star, Calendar, Phone, Mail, ArrowLeft, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import { propertyService } from "@/services/property.service";
import { messageService } from "@/services/message.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const propertiesData: Record<string, any> = {
  "1": { image: property1, title: "Downtown Smart Apartments", location: "15 Maple Street, New York, NY 10001", price: "$450,000", beds: 3, baths: 2, sqft: "1,800", rating: 4.8, type: "Apartment", year: 2022, garage: 1, description: "Experience luxury urban living in this stunning downtown apartment. Features modern finishes throughout, floor-to-ceiling windows with breathtaking city views, a chef's kitchen with premium appliances, and a spacious open floor plan perfect for entertaining. Building amenities include a rooftop terrace, fitness center, and 24/7 concierge service." },
  "2": { image: property2, title: "West Square Apartments", location: "7 Hillcrest Drive, San Jose, CA 95112", price: "$320,000", beds: 2, baths: 2, sqft: "1,200", rating: 4.6, type: "House", year: 2020, garage: 2, description: "Charming townhouse in a quiet neighborhood with modern updates. Features include hardwood floors, updated kitchen, private backyard with garden, and attached two-car garage. Close to parks, schools, and shopping centers." },
  "3": { image: property3, title: "Peninsula Apartments", location: "22 Oakview Lane, Miami, FL 33101", price: "$680,000", beds: 4, baths: 3, sqft: "2,400", rating: 4.9, type: "Villa", year: 2023, garage: 2, description: "Luxurious penthouse with panoramic ocean and city views. This stunning residence features premium finishes, a private terrace, spa-like bathrooms, and a gourmet kitchen. Enjoy resort-style amenities including pool, spa, and private beach access." },
  "4": { image: property1, title: "Skyline Tower Penthouse", location: "100 River Rd, Chicago, IL 60601", price: "$1,200,000", beds: 5, baths: 4, sqft: "3,500", rating: 5.0, type: "Apartment", year: 2024, garage: 2, description: "The pinnacle of luxury living. This prestigious penthouse offers unmatched elegance with custom Italian marble, private elevator access, wine cellar, and a wrap-around terrace with stunning skyline views." },
  "5": { image: property2, title: "Garden View Residence", location: "45 Oak Avenue, Austin, TX 73301", price: "$275,000", beds: 2, baths: 1, sqft: "950", rating: 4.3, type: "House", year: 2019, garage: 1, description: "Cozy starter home with beautiful garden views. Updated kitchen, fresh paint throughout, and energy-efficient windows. Perfect for first-time buyers or investors." },
  "6": { image: property3, title: "Oceanfront Villa", location: "8 Coastal Blvd, Malibu, CA 90265", price: "$2,100,000", beds: 6, baths: 5, sqft: "4,800", rating: 4.9, type: "Villa", year: 2023, garage: 3, description: "Breathtaking oceanfront villa with direct beach access. Features include infinity pool, outdoor kitchen, home theater, smart home technology, and professionally landscaped grounds." },
};

const amenities = ["Air Conditioning", "Swimming Pool", "Gym", "Parking", "Security", "Garden", "Laundry", "Elevator"];

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const { data } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyService.getById(id || ""),
    enabled: Boolean(id),
  });

  const apiProperty = data?.data;
  const property = apiProperty
    ? {
        image: apiProperty.images?.[0]?.url || property1,
        title: apiProperty.title,
        location: [apiProperty.location?.address, apiProperty.location?.city, apiProperty.location?.state]
          .filter(Boolean)
          .join(", "),
        price: `$${Number(apiProperty.price || 0).toLocaleString()}`,
        beds: apiProperty.bedrooms || 0,
        baths: apiProperty.bathrooms || 0,
        sqft: Number(apiProperty.squareFeet || 0).toLocaleString(),
        rating: 4.8,
        type: apiProperty.type || "Property",
        year: 2024,
        description: apiProperty.description || "",
      }
    : propertiesData[id || "1"];

  // Get agent or seller to contact
  const contactUser = apiProperty?.agentId || apiProperty?.sellerId;
  const contactUserId = contactUser?._id || contactUser?.id;

  const startConversationMutation = useMutation({
    mutationFn: () => {
      if (!contactUserId) throw new Error("No agent or seller found");
      return messageService.getOrCreateConversation(contactUserId, apiProperty?._id);
    },
    onSuccess: (response) => {
      const conversation = response.data;
      // Navigate to messages page - determine role-based route
      const role = user?.role || "buyer";
      navigate(`/${role}/messages?conversation=${conversation._id}`);
      toast.success("Conversation started!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to start conversation");
    },
  });

  const handleContactAgent = () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/properties/" + id);
      return;
    }
    if (!contactUserId) {
      toast.error("No agent or seller available for this property");
      return;
    }
    startConversationMutation.mutate();
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-40 pb-20 text-center container">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-4">Property Not Found</h1>
          <Link to="/properties"><Button>Back to Properties</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-8">
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
                  <h1 className="text-3xl font-heading font-bold text-foreground mt-3">{property.title}</h1>
                  <p className="flex items-center gap-1 text-muted-foreground mt-2"><MapPin className="w-4 h-4" />{property.location}</p>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Agent/Seller Card */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-heading font-bold text-foreground mb-4">
                  {apiProperty?.agentId ? "Agent" : "Listed By"}
                </h3>
                {contactUser ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
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
                      {startConversationMutation.isPending ? "Starting..." : "Start Conversation"}
                    </Button>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No agent or seller information available
                  </div>
                )}
              </div>

              {/* Schedule Tour */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-heading font-bold text-foreground mb-4">Schedule a Tour</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Your Name" className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <input type="email" placeholder="Your Email" className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <input type="tel" placeholder="Phone Number" className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <input type="date" className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <textarea placeholder="Message (optional)" rows={3} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary resize-none" />
                  <Button className="w-full">Book Tour</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
