import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Home, Building2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const saleTabs = ["Property", "Apartment", "Villa"];
const rentTabs = ["Apartments", "Houses", "Townhouses"];

const HeroSection = () => {
  const [listingMode, setListingMode] = useState<"sale" | "rent">("sale");
  const [activeTab, setActiveTab] = useState("Property");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");
  const navigate = useNavigate();

  const tabs = listingMode === "sale" ? saleTabs : rentTabs;

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (location.trim()) {
      params.append(listingMode === "rent" ? "location" : "city", location.trim());
    }

    const typeToUse = propertyType || (activeTab === "Property" ? "" : activeTab);
    if (typeToUse) {
      params.append("type", typeToUse === "Apartments" ? "Apartment" : typeToUse === "Houses" ? "House" : typeToUse);
    }

    if (listingMode === "sale" && budget) {
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

    if (listingMode === "rent" && budget) {
      const rentRanges: Record<string, { min: string; max: string }> = {
        "Under $1,500": { min: "", max: "1500" },
        "$1,500 - $2,500": { min: "1500", max: "2500" },
        "$2,500 - $4,000": { min: "2500", max: "4000" },
        "$4,000+": { min: "4000", max: "" },
      };

      const range = rentRanges[budget];
      if (range) {
        if (range.min) params.append("minPrice", range.min);
        if (range.max) params.append("maxPrice", range.max);
      }
    }

    const basePath = listingMode === "rent" ? "/rentals" : "/properties";
    const queryString = params.toString();
    navigate(`${basePath}${queryString ? `?${queryString}` : ""}`);
  };

  const handleModeChange = (mode: "sale" | "rent") => {
    setListingMode(mode);
    setActiveTab(mode === "sale" ? "Property" : "Apartments");
    setPropertyType("");
    setBudget("");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "Property") {
      setPropertyType("");
    } else {
      setPropertyType(tab);
    }
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center">
      <div className="absolute inset-0">
        <img src={heroBg} alt="Luxury home" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/50 to-secondary/80" />
      </div>

      <div className="relative z-10 container text-center py-16 md:py-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-dark-surface-foreground mb-6 leading-tight">
          Journey To Your Perfect Luxury{" "}
          <span className="block">Home</span>
        </h1>

        <div className="max-w-3xl mx-auto mt-10">
          <div className="flex justify-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => handleModeChange("sale")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                listingMode === "sale"
                  ? "bg-primary text-primary-foreground"
                  : "bg-dark-surface-muted text-dark-surface-foreground hover:bg-primary/20"
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("rent")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                listingMode === "rent"
                  ? "bg-primary text-primary-foreground"
                  : "bg-dark-surface-muted text-dark-surface-foreground hover:bg-primary/20"
              }`}
            >
              Rent
            </button>
          </div>

          <div className="flex justify-center gap-1 mb-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
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
                    placeholder="Enter city or neighborhood"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-transparent text-sm text-slate-900 outline-none w-full placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="text-left">
                <label className="text-xs font-medium text-slate-700 mb-1 block">Property Type</label>
                <div className="flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 bg-white">
                  {listingMode === "rent" ? (
                    <KeyRound className="w-4 h-4 text-slate-500" />
                  ) : (
                    <Home className="w-4 h-4 text-slate-500" />
                  )}
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="bg-transparent text-sm text-slate-900 outline-none w-full appearance-none cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {listingMode === "rent" ? (
                      <>
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Condo">Condo</option>
                        <option value="Townhouse">Townhouse</option>
                      </>
                    ) : (
                      <>
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="Commercial">Commercial</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div className="text-left">
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  {listingMode === "rent" ? "Monthly Budget" : "Budget"}
                </label>
                <div className="flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 bg-white">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="bg-transparent text-sm text-slate-900 outline-none w-full appearance-none cursor-pointer"
                  >
                    <option value="">Select Budget</option>
                    {listingMode === "rent" ? (
                      <>
                        <option value="Under $1,500">Under $1,500</option>
                        <option value="$1,500 - $2,500">$1,500 - $2,500</option>
                        <option value="$2,500 - $4,000">$2,500 - $4,000</option>
                        <option value="$4,000+">$4,000+</option>
                      </>
                    ) : (
                      <>
                        <option value="$100k - $300k">$100k - $300k</option>
                        <option value="$300k - $500k">$300k - $500k</option>
                        <option value="$500k - $1M">$500k - $1M</option>
                        <option value="$1M+">$1M+</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <Button className="w-full gap-2 py-5" type="submit">
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
