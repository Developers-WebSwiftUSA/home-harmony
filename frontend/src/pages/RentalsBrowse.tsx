import { useCallback, useMemo, useState } from "react";
import { Map, List, Bookmark, MapPin, X, History } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRentalFilters } from "@/features/rentals/hooks/useRentalFilters";
import { useRentalListings } from "@/features/rentals/hooks/useRentalListings";
import { RentalSearchBar } from "@/features/rentals/components/RentalSearchBar";
import { RentalFilterBar } from "@/features/rentals/components/RentalFilterBar";
import { RentalSortSelect } from "@/features/rentals/components/RentalSortSelect";
import { RentalBrowseLayout } from "@/features/rentals/components/RentalBrowseLayout";
import { SavedRentalSearchesDialog } from "@/features/rentals/components/SavedRentalSearchesDialog";
import { RentalViewMode } from "@/features/rentals/types/rental.types";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapSearchDialog } from "@/components/MapSearchDialog";
import {
  DEFAULT_MAP_SEARCH_RADIUS_MILES,
  hasMapRadiusFilter,
  hasMapSearchCenter,
} from "@/lib/mapSearch";
import { useDistanceUnit } from "@/context/DistanceUnitContext";
import { saveRentalSearch } from "@/features/rentals/lib/savedSearches";
import {
  MapBounds,
  isValidMapBounds,
  shouldUseMapBoundsSearch,
} from "@/features/rentals/lib/mapBoundsSearch";

const RentalsBrowse = () => {
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  const { formatDistance } = useDistanceUnit();
  const { filters, setFilters, resetFilters, activeFilterCount } = useRentalFilters();
  const [viewMode, setViewMode] = useState<RentalViewMode>(isMobile ? "list" : "map");
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [savedSearchesOpen, setSavedSearchesOpen] = useState(false);
  const [searchAsMapMoves, setSearchAsMapMoves] = useState(true);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

  const mapVisible = viewMode === "map" || isMobile;
  const validBounds = isValidMapBounds(mapBounds) ? mapBounds : null;

  const useBounds = shouldUseMapBoundsSearch(filters, searchAsMapMoves, validBounds, {
    mapVisible,
  });
  const { data, isLoading, isError } = useRentalListings(filters, useBounds ? validBounds : null);

  const handleMapBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds);
  }, []);

  const handleViewModeChange = useCallback((mode: RentalViewMode) => {
    setViewMode(mode);
    if (mode === "list") {
      // List-only unmounts the map — don't keep filtering by a stale viewport.
      setMapBounds(null);
    }
  }, []);

  const properties = data?.data || [];

  const mapSearchArea = {
    latitude: filters.searchLat,
    longitude: filters.searchLng,
    radiusMiles: filters.searchRadius,
  };

  const locationLabel = useMemo(() => {
    if (useBounds) return "in map area";
    if (hasMapRadiusFilter(mapSearchArea)) {
      return `within ${formatDistance(mapSearchArea.radiusMiles!)} of selected area`;
    }
    if (hasMapSearchCenter(mapSearchArea)) {
      return `within ${formatDistance(DEFAULT_MAP_SEARCH_RADIUS_MILES)} of selected area`;
    }
    return (
      filters.city ||
      filters.location ||
      [filters.city, filters.state].filter(Boolean).join(", ") ||
      undefined
    );
  }, [useBounds, filters, formatDistance, mapSearchArea]);

  const mapSearchLabel = hasMapRadiusFilter(mapSearchArea)
    ? `Within ${formatDistance(mapSearchArea.radiusMiles!)} of map pin`
    : hasMapSearchCenter(mapSearchArea)
      ? `Within ${formatDistance(DEFAULT_MAP_SEARCH_RADIUS_MILES)} of map pin`
      : null;

  const handleSaveSearch = () => {
    if (!isAuthenticated) {
      toast.error("Sign in to save searches");
      return;
    }
    saveRentalSearch(filters);
    toast.success("Search saved");
  };

  const applyMapSearch = (area: typeof mapSearchArea) => {
    setFilters({
      ...filters,
      location: "",
      city: "",
      state: "",
      zipCode: "",
      searchLat: area.latitude,
      searchLng: area.longitude,
      searchRadius: area.radiusMiles,
    });
    setSearchAsMapMoves(false);
  };

  const clearMapSearch = () => {
    setFilters({
      ...filters,
      searchLat: null,
      searchLng: null,
      searchRadius: null,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-8 pb-6 border-b border-border bg-muted/30">
        <div className="container">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
              Rentals
            </h1>
            <p className="text-muted-foreground">
              Find your next home — browse apartments, houses, and more for rent
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 lg:items-center mb-4">
            <RentalSearchBar
              filters={filters}
              onSearch={(patch) => {
                setFilters({ ...filters, ...patch });
                if (patch.searchLat != null) setSearchAsMapMoves(false);
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <RentalFilterBar
                filters={filters}
                onApply={setFilters}
                onReset={resetFilters}
                activeFilterCount={activeFilterCount}
              />
              <Button
                type="button"
                variant={hasMapSearchCenter(mapSearchArea) ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setMapDialogOpen(true)}
              >
                <MapPin className="w-4 h-4" />
                Search by map
              </Button>
              <RentalSortSelect
                value={filters.sort}
                onChange={(sort) => setFilters({ ...filters, sort })}
              />
              <Button variant="outline" size="sm" className="gap-2" onClick={handleSaveSearch}>
                <Bookmark className="w-4 h-4" />
                Save search
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setSavedSearchesOpen(true)}
              >
                <History className="w-4 h-4" />
                Saved searches
              </Button>
              <div className="hidden md:flex gap-1 border border-border rounded-lg p-1 bg-background">
                <Button
                  size="sm"
                  variant={viewMode === "map" ? "default" : "ghost"}
                  className="gap-1.5 h-8"
                  onClick={() => handleViewModeChange("map")}
                >
                  <Map className="w-4 h-4" /> Map
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  className="gap-1.5 h-8"
                  onClick={() => handleViewModeChange("list")}
                >
                  <List className="w-4 h-4" /> List
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Switch
                checked={searchAsMapMoves}
                onCheckedChange={(checked) => {
                  setSearchAsMapMoves(checked);
                  if (checked) {
                    clearMapSearch();
                    if (viewMode === "list") handleViewModeChange("map");
                  } else {
                    setMapBounds(null);
                  }
                }}
                id="search-as-map-moves"
                disabled={!mapVisible && !isMobile}
              />
              <Label htmlFor="search-as-map-moves" className="cursor-pointer font-normal">
                Search as I move the map
              </Label>
            </label>
            {useBounds && (
              <span className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                Showing rentals in visible map area
              </span>
            )}
            {!mapVisible && searchAsMapMoves && (
              <span className="text-xs text-muted-foreground">
                Switch to Map view to search by viewport
              </span>
            )}
          </div>

          {mapSearchLabel && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
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
            </div>
          )}

          <MapSearchDialog
            open={mapDialogOpen}
            onOpenChange={setMapDialogOpen}
            value={mapSearchArea}
            onApply={applyMapSearch}
            description="Pick a map location and optional radius. Use Filters to narrow by rooms, pets, rating, and more."
          />

          <SavedRentalSearchesDialog
            open={savedSearchesOpen}
            onOpenChange={setSavedSearchesOpen}
            onLoad={setFilters}
          />

          {isAuthenticated && (
            <p className="text-xs text-muted-foreground flex flex-wrap gap-3">
              <Link to="/buyer/saved-rentals" className="text-primary hover:underline">
                View saved rentals
              </Link>
              <Link to="/buyer/applications" className="text-primary hover:underline">
                My applications
              </Link>
            </p>
          )}
        </div>
      </section>

      <section className="py-6">
        <div className="container">
          <RentalBrowseLayout
            properties={properties}
            total={data?.total}
            isLoading={isLoading}
            isError={isError}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            locationLabel={locationLabel}
            searchArea={mapSearchArea}
            searchAsMapMoves={searchAsMapMoves}
            onMapBoundsChange={handleMapBoundsChange}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RentalsBrowse;
