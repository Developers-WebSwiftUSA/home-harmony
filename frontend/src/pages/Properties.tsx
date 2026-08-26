import { useState, useEffect } from "react";
import { Grid3X3, List, MapPin, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import heroBg from "@/assets/hero-bg.jpg";
import property1 from "@/assets/property-1.jpg";
import { propertyService } from "@/services/property.service";
import { getPropertyRating } from "@/lib/ratings";
import { getListingPromotionBadge } from "@/features/ads/lib/promotionDisplay";
import { PropertyListCard } from "@/components/PropertyListCard";
import { MapSearchDialog } from "@/components/MapSearchDialog";
import { PropertyFiltersDialog } from "@/components/PropertyFiltersDialog";
import { BrowseLocationSearchBar } from "@/components/PlaceSearchInput";
import { useLocationAutocomplete } from "@/features/rentals/hooks/useLocationAutocomplete";
import { usePropertyFilters } from "@/features/properties/hooks/usePropertyFilters";
import { propertyFiltersToApiParams } from "@/features/properties/lib/propertyQueryParams";
import {
  EMPTY_MAP_SEARCH,
  hasMapRadiusFilter,
  hasMapSearchCenter,
  parseMapSearchFromParams,
  mapSearchToParams,
  DEFAULT_MAP_SEARCH_RADIUS_MILES,
} from "@/lib/mapSearch";
import { Button } from "@/components/ui/button";
import { useDistanceUnit } from "@/context/DistanceUnitContext";

const Properties = () => {
  const { filters, setFilters, resetFilters, activeFilterCount, searchParams, setSearchParams } =
    usePropertyFilters();

  const urlCity = searchParams.get("city") || "";
  const urlState = searchParams.get("state") || "";
  const urlZip = searchParams.get("zipCode") || "";
  const urlSearch = searchParams.get("search") || "";

  const [view, setView] = useState<"grid" | "list">("grid");
  const [locationQuery, setLocationQuery] = useState(urlCity || urlSearch);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const { formatDistance } = useDistanceUnit();

  const { data: locationSuggestions = [] } = useLocationAutocomplete(locationQuery, "sale");
  const mapSearch = parseMapSearchFromParams(searchParams);

  useEffect(() => {
    setLocationQuery(urlCity || urlSearch);
  }, [urlCity, urlSearch]);

  const queryParams: Record<string, string | number> = {
    ...propertyFiltersToApiParams(filters, mapSearch),
  };
  if (!filters.keyword) {
    if (urlCity && !hasMapSearchCenter(mapSearch)) queryParams.city = urlCity;
    if (urlState && !hasMapSearchCenter(mapSearch)) queryParams.state = urlState;
    if (urlZip && !hasMapSearchCenter(mapSearch)) queryParams.zipCode = urlZip;
    if (urlSearch && !hasMapSearchCenter(mapSearch)) queryParams.search = urlSearch;
  }

  const { data, isLoading } = useQuery({
    queryKey: ["properties", queryParams],
    queryFn: () => propertyService.list(queryParams),
  });

  const updateParams = (mutate: (params: URLSearchParams) => void) => {
    const newParams = new URLSearchParams(searchParams);
    mutate(newParams);
    setSearchParams(newParams);
  };

  const updateMapSearch = (area: typeof mapSearch) => {
    updateParams((params) => {
      mapSearchToParams(params, area);
      if (hasMapSearchCenter(area)) {
        params.delete("city");
        params.delete("state");
        params.delete("zipCode");
        params.delete("search");
      }
    });
  };

  const clearMapSearch = () => updateMapSearch(EMPTY_MAP_SEARCH);

  const handleLocationSearch = (result: {
    term: string;
    city?: string;
    state?: string;
    zipCode?: string;
    searchLat?: number | null;
    searchLng?: number | null;
  }) => {
    updateParams((params) => {
      params.delete("city");
      params.delete("state");
      params.delete("zipCode");
      params.delete("search");
      params.delete("searchLat");
      params.delete("searchLng");
      params.delete("searchRadius");

      if (result.searchLat != null && result.searchLng != null) {
        params.set("searchLat", String(result.searchLat));
        params.set("searchLng", String(result.searchLng));
        params.set("searchRadius", String(DEFAULT_MAP_SEARCH_RADIUS_MILES));
        return;
      }

      if (result.city) params.set("city", result.city);
      if (result.state) params.set("state", result.state);
      if (result.zipCode) params.set("zipCode", result.zipCode);
      if (result.term && !result.city && !result.zipCode) {
        params.set("search", result.term);
      }
    });
  };

  const allProperties = (data?.data || []).map((p) => ({
    id: p._id,
    raw: p,
    image: p.images?.[0]?.url || property1,
    title: p.title,
    location: [p.location?.address, p.location?.city, p.location?.state].filter(Boolean).join(", "),
    price: `$${Number(p.price || 0).toLocaleString()}`,
    beds: p.bedrooms || 0,
    baths: p.bathrooms || 0,
    sqft: Number(p.squareFeet || 0).toLocaleString(),
    rating: getPropertyRating(p),
    ...(() => {
      const promotion = getListingPromotionBadge(p, p.status === "active" ? "For Sale" : p.status);
      return { badge: promotion.label, badgeVariant: promotion.variant };
    })(),
    type: p.type || "Property",
    petPolicy: p.rentalDetails?.petPolicy,
    petFee: p.rentalDetails?.petFee,
  }));

  const properties = allProperties;

  const mapSearchLabel = hasMapRadiusFilter(mapSearch)
    ? `Within ${formatDistance(mapSearch.radiusMiles!)} of map pin`
    : hasMapSearchCenter(mapSearch)
      ? `Within ${formatDistance(DEFAULT_MAP_SEARCH_RADIUS_MILES)} of map pin`
      : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative py-16 md:py-20">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-secondary/85" />
        </div>
        <div className="relative z-10 container text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-dark-surface-foreground mb-4">
            Our Properties
          </h1>
          <p className="text-dark-surface-foreground/70">Browse verified homes and commercial spaces</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <div className="bg-card border border-border rounded-xl p-4 space-y-4 mb-8">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
              <BrowseLocationSearchBar
                value={locationQuery}
                onValueChange={setLocationQuery}
                listingSuggestions={locationSuggestions}
                onSearch={handleLocationSearch}
                placeholder="City, neighborhood, address, or ZIP"
                className="w-full"
              />
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <PropertyFiltersDialog
                  open={filtersDialogOpen}
                  onOpenChange={setFiltersDialogOpen}
                  value={filters}
                  onApply={setFilters}
                  onReset={resetFilters}
                  activeFilterCount={activeFilterCount}
                />
                <Button
                  type="button"
                  variant={hasMapSearchCenter(mapSearch) ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setMapDialogOpen(true)}
                >
                  <MapPin className="w-4 h-4" />
                  Search by map
                </Button>
              </div>
            </div>

            {(mapSearchLabel || activeFilterCount > 0) && (
              <div className="flex flex-wrap items-center gap-2">
                {mapSearchLabel && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {mapSearchLabel}
                    <button
                      type="button"
                      onClick={clearMapSearch}
                      className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                      aria-label="Clear map search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {activeFilterCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <span className="text-sm text-muted-foreground mr-auto">{properties.length} results</span>
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`p-2 rounded ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`p-2 rounded ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <MapSearchDialog
            open={mapDialogOpen}
            onOpenChange={setMapDialogOpen}
            value={mapSearch.latitude != null ? mapSearch : EMPTY_MAP_SEARCH}
            onApply={updateMapSearch}
            description="Pick a map location and optional radius. Use Filters to narrow by rooms, pets, rating, and more."
          />

          {isLoading ? (
            <div className="text-sm text-muted-foreground mb-6">Loading properties...</div>
          ) : null}

          {view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {properties.map((prop) => (
                <PropertyListCard
                  key={prop.id}
                  id={prop.id}
                  image={prop.image}
                  title={prop.title}
                  location={prop.location}
                  price={prop.price}
                  beds={prop.beds}
                  baths={prop.baths}
                  sqft={prop.sqft}
                  rating={prop.rating}
                  badge={prop.badge}
                  badgeVariant={prop.badgeVariant}
                  layout="grid"
                  petPolicy={prop.petPolicy}
                  petFee={prop.petFee}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {properties.map((prop) => (
                <PropertyListCard
                  key={prop.id}
                  id={prop.id}
                  image={prop.image}
                  title={prop.title}
                  location={prop.location}
                  price={prop.price}
                  beds={prop.beds}
                  baths={prop.baths}
                  sqft={prop.sqft}
                  rating={prop.rating}
                  badge={prop.badge}
                  badgeVariant={prop.badgeVariant}
                  layout="list"
                  petPolicy={prop.petPolicy}
                  petFee={prop.petFee}
                />
              ))}
            </div>
          )}

          {!isLoading && properties.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">
              No properties match your search. Try adjusting your filters or map area.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;
