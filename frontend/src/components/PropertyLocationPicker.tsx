import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { leafletPinIcon } from "@/lib/leafletIcons";
import { Crosshair, Loader2, MapPin } from "lucide-react";
import { PlaceSuggestion, geocodeAddress, reverseGeocode } from "@/lib/geocoding";
import { isValidPropertyCoordinates } from "@/lib/listingLocation";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { toast } from "sonner";

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795];

const parseCoord = (value: string) => {
  if (value.trim() === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const MapClickHandler = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
};

const MapViewSync = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], Math.max(map.getZoom(), 14), { animate: true });
  }, [latitude, longitude, map]);

  return null;
};

const MapResizeFix = () => {
  const map = useMap();

  useEffect(() => {
    const fix = () => map.invalidateSize();
    fix();
    const t1 = window.setTimeout(fix, 120);
    const t2 = window.setTimeout(fix, 400);
    const t3 = window.setTimeout(fix, 700);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [map]);

  return null;
};

const DraggablePinMarker = ({
  position,
  onMove,
}: {
  position: [number, number];
  onMove: (lat: number, lng: number) => void;
}) => {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (!marker) return;
        const pos = marker.getLatLng();
        onMove(pos.lat, pos.lng);
      },
    }),
    [onMove]
  );

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={leafletPinIcon}
      draggable
      eventHandlers={eventHandlers}
    />
  );
};

const LocationMap = ({
  latitude,
  longitude,
  onPick,
  className,
}: {
  latitude: string;
  longitude: string;
  onPick: (lat: number, lng: number) => void;
  className?: string;
}) => {
  const latNum = parseCoord(latitude);
  const lngNum = parseCoord(longitude);
  const hasPin = latNum != null && lngNum != null && isValidPropertyCoordinates(latNum, lngNum);
  const center = hasPin ? ([latNum, lngNum] as [number, number]) : DEFAULT_CENTER;

  return (
    <div className={cn("rounded-xl overflow-hidden border border-border relative z-0", className)}>
      <MapContainer
        center={center}
        zoom={hasPin ? 14 : 4}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizeFix />
        <MapClickHandler onPick={onPick} />
        {hasPin && (
          <>
            <MapViewSync latitude={latNum} longitude={lngNum} />
            <DraggablePinMarker
              key={`${latNum.toFixed(6)}-${lngNum.toFixed(6)}`}
              position={[latNum, lngNum]}
              onMove={onPick}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

const formatCoords = (lat: number, lng: number) => ({
  latitude: lat.toFixed(6),
  longitude: lng.toFixed(6),
});

export type PlaceSelection = PlaceSuggestion;

export type PropertyLocationPickerProps = {
  latitude: string;
  longitude: string;
  onChange: (coords: { latitude: string; longitude: string }) => void;
  onPlaceSelect?: (place: PlaceSelection) => void;
  addressQuery?: string;
  className?: string;
};

export const PropertyLocationPicker = ({
  latitude,
  longitude,
  onChange,
  onPlaceSelect,
  addressQuery,
  className,
}: PropertyLocationPickerProps) => {
  const [geocoding, setGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [draftLat, setDraftLat] = useState(latitude);
  const [draftLng, setDraftLng] = useState(longitude);
  const [draftQuery, setDraftQuery] = useState("");
  const [draftPlace, setDraftPlace] = useState<PlaceSuggestion | null>(null);
  const lookupId = useRef(0);

  const latNum = parseCoord(latitude);
  const lngNum = parseCoord(longitude);
  const hasPin = latNum != null && lngNum != null && isValidPropertyCoordinates(latNum, lngNum);
  const draftHasPin = (() => {
    const lat = parseCoord(draftLat);
    const lng = parseCoord(draftLng);
    return lat != null && lng != null && isValidPropertyCoordinates(lat, lng);
  })();

  const applyPlace = useCallback(
    (place: PlaceSuggestion) => {
      onChange(formatCoords(place.latitude, place.longitude));
      onPlaceSelect?.(place);
      setSearchQuery(place.label);
    },
    [onChange, onPlaceSelect]
  );

  const lookupAddress = useCallback(
    async (lat: number, lng: number, target: "form" | "draft") => {
      const id = ++lookupId.current;
      setGeocoding(true);
      try {
        const place = await reverseGeocode(lat, lng);
        if (id !== lookupId.current) return;
        if (!place) {
          toast.error("Could not find an address for that pin.");
          return;
        }
        if (target === "draft") {
          setDraftPlace(place);
          setDraftQuery(place.label);
          return;
        }
        applyPlace(place);
        toast.success("Address filled from the map");
      } catch (error) {
        if (id !== lookupId.current) return;
        toast.error(error instanceof Error ? error.message : "Could not look up that address.");
      } finally {
        if (id === lookupId.current) setGeocoding(false);
      }
    },
    [applyPlace]
  );

  const handleManualChange = (field: "latitude" | "longitude", value: string) => {
    onChange({
      latitude: field === "latitude" ? value : latitude,
      longitude: field === "longitude" ? value : longitude,
    });
  };

  const pickOnFormMap = (lat: number, lng: number) => {
    onChange(formatCoords(lat, lng));
    void lookupAddress(lat, lng, "form");
  };

  const pickOnDraftMap = (lat: number, lng: number) => {
    const next = formatCoords(lat, lng);
    setDraftLat(next.latitude);
    setDraftLng(next.longitude);
    void lookupAddress(lat, lng, "draft");
  };

  const openFinder = async () => {
    setDraftLat(latitude);
    setDraftLng(longitude);
    setDraftQuery(searchQuery);
    setDraftPlace(null);
    setMapOpen(true);

    if (hasPin) {
      void lookupAddress(latNum!, lngNum!, "draft");
      return;
    }

    const query = addressQuery?.trim();
    if (!query) return;
    setGeocoding(true);
    try {
      const place = await geocodeAddress(query);
      if (!place) return;
      setDraftLat(place.latitude.toFixed(6));
      setDraftLng(place.longitude.toFixed(6));
      setDraftPlace(place);
      setDraftQuery(place.label);
    } catch {
      // User can still drop a pin in the popup.
    } finally {
      setGeocoding(false);
    }
  };

  const applyDraft = () => {
    const lat = parseCoord(draftLat);
    const lng = parseCoord(draftLng);
    if (lat == null || lng == null || !isValidPropertyCoordinates(lat, lng)) {
      toast.error("Drop a pin on the map first.");
      return;
    }
    onChange(formatCoords(lat, lng));
    if (draftPlace) {
      onPlaceSelect?.(draftPlace);
      setSearchQuery(draftPlace.label);
    }
    setMapOpen(false);
    toast.success("Address added from the map");
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        pickOnFormMap(position.coords.latitude, position.coords.longitude);
      },
      () => toast.error("Could not access your location"),
      { enableHighAccuracy: true }
    );
  };

  const draftSummary = [draftPlace?.address, draftPlace?.city, draftPlace?.state, draftPlace?.zipCode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label className="text-sm font-medium">Property location on map</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Open the map to drop a pin, or click the map below. Address fields fill automatically.
            Latitude and longitude are optional.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => void openFinder()}>
            <MapPin className="w-4 h-4" />
            Find address on map
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={useMyLocation}>
            <Crosshair className="w-4 h-4" />
            Use my location
          </Button>
        </div>
      </div>

      <div className="relative z-[20]">
        <PlaceSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSelect={applyPlace}
          showLabel
          label="Search places"
          placeholder="Search city, address, or landmark..."
        />
      </div>

      <LocationMap
        latitude={latitude}
        longitude={longitude}
        onPick={pickOnFormMap}
        className="h-72"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="property-latitude" className="text-xs">
            Latitude (optional)
          </Label>
          <Input
            id="property-latitude"
            type="number"
            step="any"
            placeholder="e.g. 40.7128"
            value={latitude}
            onChange={(e) => handleManualChange("latitude", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="property-longitude" className="text-xs">
            Longitude (optional)
          </Label>
          <Input
            id="property-longitude"
            type="number"
            step="any"
            placeholder="e.g. -74.0060"
            value={longitude}
            onChange={(e) => handleManualChange("longitude", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {!hasPin && (
        <p className="text-xs text-muted-foreground bg-muted/60 border border-border rounded-lg px-3 py-2">
          A map pin is optional. Add one if you want this listing to appear in map searches.
        </p>
      )}

      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Find address on map
            </DialogTitle>
            <DialogDescription>
              Search a place or click the map to drop a pin. We will fill the listing address from
              that location.
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-[20]">
            <PlaceSearchInput
              id="map-finder-search"
              value={draftQuery}
              onChange={setDraftQuery}
              onSelect={(place) => {
                setDraftLat(place.latitude.toFixed(6));
                setDraftLng(place.longitude.toFixed(6));
                setDraftPlace(place);
                setDraftQuery(place.label);
              }}
              placeholder="Search city, address, or landmark..."
            />
          </div>

          {mapOpen ? (
            <LocationMap
              latitude={draftLat}
              longitude={draftLng}
              onPick={pickOnDraftMap}
              className="h-80"
            />
          ) : null}

          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm min-h-[3rem]">
            {geocoding ? (
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Looking up address...
              </span>
            ) : draftSummary ? (
              <p>
                <span className="text-xs text-muted-foreground block mb-0.5">Selected address</span>
                {draftSummary}
              </p>
            ) : (
              <p className="text-muted-foreground">Click the map to choose a pin.</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setMapOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyDraft} disabled={!draftHasPin || geocoding}>
              Use this location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
