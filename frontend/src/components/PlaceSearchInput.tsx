import { useEffect, useRef, useState } from "react";
import { Globe, Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { usePlaceSearch } from "@/hooks/usePlaceSearch";
import { PlaceSuggestion } from "@/lib/geocoding";

export type PlaceSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: PlaceSuggestion) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
  showLabel?: boolean;
  label?: string;
};

export const PlaceSearchInput = ({
  value,
  onChange,
  onSelect,
  placeholder = "Search city, address, or landmark...",
  id = "place-search",
  className,
  inputClassName,
  showLabel = false,
  label = "Search places",
}: PlaceSearchInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { data: placeResults = [], isFetching } = usePlaceSearch(value, open);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (place: PlaceSuggestion) => {
    onChange(place.label);
    onSelect(place);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {showLabel && (
        <Label htmlFor={id} className="text-xs">
          {label}
        </Label>
      )}
      <div className={cn("relative", showLabel && "mt-1")}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn("pl-9", inputClassName)}
          autoComplete="off"
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && value.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
          {placeResults.length === 0 && !isFetching ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No places found</p>
          ) : (
            <ul className="max-h-56 overflow-y-auto">
              {placeResults.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors flex items-start gap-2 border-b border-border last:border-b-0"
                    onClick={() => handleSelect(place)}
                  >
                    <Globe className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{place.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export type ListingSuggestion = {
  label: string;
  city?: string;
  state?: string;
  zipCode?: string;
};

export type BrowseLocationSearchResult = {
  term: string;
  city?: string;
  state?: string;
  zipCode?: string;
  searchLat?: number | null;
  searchLng?: number | null;
};

type BrowseLocationSearchBarProps = {
  value: string;
  onValueChange: (value: string) => void;
  listingSuggestions?: ListingSuggestion[];
  onSearch: (result: BrowseLocationSearchResult) => void;
  placeholder?: string;
  className?: string;
};

export const BrowseLocationSearchBar = ({
  value,
  onValueChange,
  listingSuggestions = [],
  onSearch,
  placeholder = "City, neighborhood, address, or ZIP",
  className,
}: BrowseLocationSearchBarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { data: placeResults = [], isFetching } = usePlaceSearch(value, open);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyTextSearch = (term: string, suggestion?: ListingSuggestion) => {
    const trimmed = term.trim();
    const zipMatch = /^\d{5}$/.test(trimmed);

    if (suggestion) {
      onSearch({
        term: suggestion.label,
        city: suggestion.city || "",
        state: suggestion.state || "",
        zipCode: suggestion.zipCode || "",
        searchLat: null,
        searchLng: null,
      });
    } else if (zipMatch) {
      onSearch({
        term: trimmed,
        city: "",
        state: "",
        zipCode: trimmed,
        searchLat: null,
        searchLng: null,
      });
    } else {
      onSearch({
        term: trimmed,
        city: "",
        state: "",
        zipCode: "",
        searchLat: null,
        searchLng: null,
      });
    }
    setOpen(false);
  };

  const applyPlaceSearch = (place: PlaceSuggestion) => {
    onValueChange(place.label);
    onSearch({
      term: place.label,
      city: place.city || "",
      state: place.state || "",
      zipCode: place.zipCode || "",
      searchLat: place.latitude,
      searchLng: place.longitude,
    });
    setOpen(false);
  };

  const hasSuggestions =
    open && value.trim().length >= 2 && (placeResults.length > 0 || listingSuggestions.length > 0 || isFetching);

  return (
    <div ref={containerRef} className={cn("relative flex-1 min-w-[240px]", className)}>
      <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-background">
        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Input
          value={value}
          onChange={(event) => {
            onValueChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") applyTextSearch(value);
          }}
          placeholder={placeholder}
          className="border-0 shadow-none focus-visible:ring-0 px-0 h-9"
          autoComplete="off"
        />
        {isFetching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />}
        <Button type="button" size="sm" className="gap-1.5" onClick={() => applyTextSearch(value)}>
          <Search className="w-4 h-4" />
          Search
        </Button>
      </div>

      {hasSuggestions && (
        <div className="absolute z-30 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          {placeResults.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground bg-muted/50">
                Places
              </p>
              {placeResults.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors flex items-start gap-2 border-b border-border"
                  onClick={() => applyPlaceSearch(place)}
                >
                  <Globe className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{place.label}</span>
                </button>
              ))}
            </div>
          )}

          {listingSuggestions.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground bg-muted/50">
                From our listings
              </p>
              {listingSuggestions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors flex items-center gap-2 border-b border-border last:border-b-0"
                  onClick={() => {
                    onValueChange(item.label);
                    applyTextSearch(item.label, item);
                  }}
                >
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {!isFetching && placeResults.length === 0 && listingSuggestions.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">No results found</p>
          )}
        </div>
      )}
    </div>
  );
};
