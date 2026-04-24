import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const tabs = ["Property", "Apartment", "Villa"];

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState("Property");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    // Add location (city) if provided
    if (location.trim()) {
      params.append("city", location.trim());
    }
    
    // Add property type - use activeTab if propertyType is not selected
    const typeToUse = propertyType || (activeTab === "Property" ? "" : activeTab);
    if (typeToUse) {
      params.append("type", typeToUse);
    }
    
    // Add budget range if selected
    if (budget) {
      const budgetRanges: Record<string, { min: string; max: string }> = {
        "$100k - $300k": { min: "100000", max: "300000" },
        "$300k - $500k": { min: "300000", max: "500000" },
        "$500k - $1M": { min: "500000", max: "1000000" },
        "$1M+": { min: "1000000", max: "" },
      };
      
      const range = budgetRanges[budget];
      if (range) {
        if (range.min) params.append("minPrice", range.min);
        if (range.max) params.append("maxPrice", range.max);
      }
    }
    
    // Navigate to properties page with search params
    const queryString = params.toString();
    navigate(`/properties${queryString ? `?${queryString}` : ""}`);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Auto-update property type when tab changes
    if (tab === "Property") {
      setPropertyType("");
    } else {
      setPropertyType(tab);
    }
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Luxury home" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/50 to-secondary/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center pt-32 pb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-dark-surface-foreground mb-6 leading-tight">
          Journey To Your Perfect Luxury{" "}
          <span className="block">Home</span>
        </h1>

        {/* Search box */}
        <div className="max-w-3xl mx-auto mt-10">
          {/* Tabs */}
          <div className="flex justify-center gap-1 mb-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-2.5 rounded-t-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-dark-surface-muted text-dark-surface-foreground hover:bg-primary/20"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search form */}
          <div className="bg-white rounded-b-lg rounded-tr-lg p-4 md:p-6 shadow-2xl">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
            >
              <div className="text-left">
                <label className="text-xs font-medium text-slate-700 mb-1 block">Location</label>
                <div className="flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 bg-white">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter City"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-transparent text-sm text-slate-900 outline-none w-full placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="text-left">
                <label className="text-xs font-medium text-slate-700 mb-1 block">Property Type</label>
                <div className="flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 bg-white">
                  <Home className="w-4 h-4 text-slate-500" />
                  <select 
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="bg-transparent text-sm text-slate-900 outline-none w-full appearance-none cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>
              <div className="text-left">
                <label className="text-xs font-medium text-slate-700 mb-1 block">Budget</label>
                <div className="flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 bg-white">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <select 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="bg-transparent text-sm text-slate-900 outline-none w-full appearance-none cursor-pointer"
                  >
                    <option value="">Select Budget</option>
                    <option value="$100k - $300k">$100k - $300k</option>
                    <option value="$300k - $500k">$300k - $500k</option>
                    <option value="$500k - $1M">$500k - $1M</option>
                    <option value="$1M+">$1M+</option>
                  </select>
                </div>
              </div>
              <Button
                className="w-full gap-2 py-5"
                type="submit"
              >
                <Search className="w-4 h-4" />
                Search
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
