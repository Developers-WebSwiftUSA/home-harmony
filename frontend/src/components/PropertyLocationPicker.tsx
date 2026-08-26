import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { leafletPinIcon } from "@/lib/leafletIcons";
import { Crosshair, Loader2, MapPin } from "lucide-react";
import { PlaceSuggestion, geocodeAddress } from "@/lib/geocoding";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { toast } from "sonner";

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795];

export const isValidPropertyCoordinates = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180 &&
  !(lat === 0 && lng === 0);

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
    const t1 = window.setTimeout(fix, 100);
    const t2 = window.setTimeout(fix, 400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
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

  const latNum = parseCoord(latitude);
  const lngNum = parseCoord(longitude);
  const hasPin = latNum != null && lngNum != null && isValidPropertyCoordinates(latNum, lngNum);

  const center = useMemo<[number, number]>(() => {
    if (hasPin) return [latNum!, lngNum!];
    return DEFAULT_CENTER;
  }, [hasPin, latNum, lngNum]);

  const setCoordinates = useCallback(
    (lat: number, lng: number) => {
      onChange({
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      });
    },
    [onChange]
  );

  const applyPlace = useCallback(
    (place: PlaceSuggestion) => {
      setCoordinates(place.latitude, place.longitude);
      onPlaceSelect?.(place);
      setSearchQuery(place.label);
    },
    [onPlaceSelect, setCoordinates]
  );

  const handleManualChange = (field: "latitude" | "longitude", value: string) => {
    onChange({
      latitude: field === "latitude" ? value : latitude,
      longitude: field === "longitude" ? value : longitude,
    });
  };

  const locateFromAddress = async () => {
    const query = addressQuery?.trim();
    if (!query) {
      toast.error("Enter an address, city, and state first.");
      return;
    }
    setGeocoding(true);
    try {
      const place = await geocodeAddress(query);
      if (!place) {
        toast.error("Could not find that address on the map.");
        return;
      }
      applyPlace(place);
      toast.success("Location found on map");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Geocoding failed");
    } finally {
      setGeocoding(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates(position.coords.latitude, position.coords.longitude);
        toast.success("Using your current location");
      },
      () => toast.error("Could not access your location"),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label className="text-sm font-medium">Property location on map</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search for a place, click the map to drop a pin, or enter coordinates manually.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {addressQuery?.trim() ? (
            <Button type="button" size="sm" variant="outline" disabled={geocoding} onClick={locateFromAddress}>
              {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              Find address on map
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={useMyLocation}>
            <Crosshair className="w-4 h-4" />
            Use my location
          </Button>
        </div>
      </div>

      <PlaceSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onSelect={applyPlace}
        showLabel
        label="Search places"
        placeholder="Search city, address, or landmark..."
      />

      <div className="h-72 rounded-xl overflow-hidden border border-border relative z-0">
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
          <MapClickHandler onPick={setCoordinates} />
          {hasPin && (
            <>
              <MapViewSync latitude={latNum!} longitude={lngNum!} />
              <DraggablePinMarker
                key={`${latNum!.toFixed(6)}-${lngNum!.toFixed(6)}`}
                position={[latNum!, lngNum!]}
                onMove={setCoordinates}
              />
            </>
          )}
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="property-latitude" className="text-xs">
            Latitude
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
            Longitude
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
        <p className="text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          Search for a place or select a pin on the map so your listing appears on the rentals map.
        </p>
      )}
    </div>
  );
};
