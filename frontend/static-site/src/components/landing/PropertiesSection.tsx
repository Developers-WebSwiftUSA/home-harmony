import { Star, MapPin, Bed, Bath, Maximize, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const properties = [
  {
    id: 1,
    image: property1,
    title: "Downtown Smart Apartments",
    location: "15 Maple Street, New York",
    price: "$450,000",
    beds: 3,
    baths: 2,
    sqft: "1,800",
    rating: 4.8,
    badge: "For Sale",
  },
  {
    id: 2,
    image: property2,
    title: "West Square Apartments",
    location: "7 Hillcrest Drive, San Jose",
    price: "$320,000",
    beds: 2,
    baths: 2,
    sqft: "1,200",
    rating: 4.6,
    badge: "Hot",
  },
  {
    id: 3,
    image: property3,
    title: "Peninsula Apartments",
    location: "22 Oakview Lane, Miami",
    price: "$680,000",
    beds: 4,
    baths: 3,
    sqft: "2,400",
    rating: 4.9,
    badge: "For Sale",
  },
];

const PropertiesSection = () => {
  return (
    <section className="section-padding bg-muted">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Featured Properties</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
              Discover Verified Homes and
              <span className="block">Commercial Spaces</span>
            </h2>
          </div>
          <Link to="/properties">
          <Button className="mt-4 md:mt-0 w-fit">View More Properties</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop) => (
            <div
              key={prop.title}
              className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={prop.image}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  {prop.badge}
                </span>
                <button className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(prop.rating) ? "text-primary fill-primary" : "text-border"}`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">({prop.rating})</span>
                </div>
                <h3 className="font-heading font-bold text-foreground text-lg mb-1">{prop.title}</h3>
                <p className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {prop.location}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4 mb-4">
                  <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {prop.beds} Beds</span>
                  <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {prop.baths} Baths</span>
                  <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {prop.sqft} sqft</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold text-lg">{prop.price}</span>
                  <Link to={`/properties/${prop.id}`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    Details
                  </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertiesSection;
