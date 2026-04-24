import { useState } from "react";
import { Search, MapPin, Bed, Bath, Maximize, Heart, Star, SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import heroBg from "@/assets/hero-bg.jpg";
import property1 from "@/assets/property-1.jpg";
import { propertyService } from "@/services/property.service";

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get filters from URL params
  const urlCity = searchParams.get("city") || "";
  const urlType = searchParams.get("type") || "";
  const urlMinPrice = searchParams.get("minPrice") || "";
  const urlMaxPrice = searchParams.get("maxPrice") || "";
  
  // Initialize type filter from URL or default to "All"
  const typeFilter = urlType || "All";
  
  // Build query params for API
  const queryParams: Record<string, string | number> = { status: "active" };
  if (urlCity) queryParams.city = urlCity;
  if (urlType && urlType !== "All") queryParams.type = urlType;
  if (urlMinPrice) queryParams.minPrice = parseInt(urlMinPrice);
  if (urlMaxPrice) queryParams.maxPrice = parseInt(urlMaxPrice);
  
  const { data, isLoading } = useQuery({
    queryKey: ["properties", queryParams],
    queryFn: () => propertyService.list(queryParams),
  });
  
  // Handle type filter change
  const handleTypeFilterChange = (newType: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (newType === "All") {
      newParams.delete("type");
    } else {
      newParams.set("type", newType);
    }
    setSearchParams(newParams);
  };

  const allProperties = (data?.data || []).map((p) => ({
    id: p._id,
    image: p.images?.[0]?.url || property1,
    title: p.title,
    location: [p.location?.address, p.location?.city, p.location?.state].filter(Boolean).join(", "),
    price: `$${Number(p.price || 0).toLocaleString()}`,
    beds: p.bedrooms || 0,
    baths: p.bathrooms || 0,
    sqft: Number(p.squareFeet || 0).toLocaleString(),
    rating: 4.8,
    badge: p.status === "active" ? "For Sale" : p.status,
    type: p.type || "Property",
  }));

  // Filter by search term only (type is already filtered by API)
  const filtered = allProperties.filter((p) => {
    const matchesSearch = searchTerm === "" || 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Page Header */}
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-secondary/85" />
        </div>
        <div className="relative z-10 container text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-dark-surface-foreground mb-4">Our Properties</h1>
          <p className="text-dark-surface-foreground/70">Browse verified homes and commercial spaces</p>
        </div>
      </section>

      {/* Filters & Listing */}
      <section className="section-padding">
        <div className="container">
          {/* Filter bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2 flex-1 md:w-72">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
                className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground outline-none cursor-pointer"
              >
                <option value="All">All</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{filtered.length} results</span>
              <button onClick={() => setView("grid")} className={`p-2 rounded ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setView("list")} className={`p-2 rounded ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading properties...</div>
          ) : null}

          {/* Grid view */}
          {view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((prop) => (
                <Link to={`/properties/${prop.id}`} key={prop.id} className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative h-56 overflow-hidden">
                    <img src={prop.image} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">{prop.badge}</span>
                    <button className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" onClick={(e) => e.preventDefault()}>
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(prop.rating) ? "text-primary fill-primary" : "text-border"}`} />
                      ))}
                    </div>
                    <h3 className="font-heading font-bold text-foreground text-lg mb-1">{prop.title}</h3>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground mb-4"><MapPin className="w-3.5 h-3.5" />{prop.location}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4 mb-4">
                      <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {prop.beds} Beds</span>
                      <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {prop.baths} Baths</span>
                      <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {prop.sqft} sqft</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold text-lg">{prop.price}</span>
                      <Button size="sm" variant="outline" className="text-xs">Details</Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((prop) => (
                <Link to={`/properties/${prop.id}`} key={prop.id} className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow flex flex-col md:flex-row group">
                  <div className="relative w-full md:w-72 h-48 md:h-auto overflow-hidden flex-shrink-0">
                    <img src={prop.image} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">{prop.badge}</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-foreground text-lg mb-1">{prop.title}</h3>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground mb-3"><MapPin className="w-3.5 h-3.5" />{prop.location}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {prop.beds} Beds</span>
                        <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {prop.baths} Baths</span>
                        <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {prop.sqft} sqft</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-primary font-bold text-xl">{prop.price}</span>
                      <Button size="sm">View Details</Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;
