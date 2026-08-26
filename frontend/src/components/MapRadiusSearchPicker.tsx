import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  EMPTY_MAP_SEARCH,
  MapSearchArea,
  hasMapSearchCenter,
  milesToMeters,
  DEFAULT_MAP_SEARCH_RADIUS_MILES,
} from "@/lib/mapSearch";
import { leafletPinIcon } from "@/lib/leafletIcons";
import { useDistanceUnit } from "@/context/DistanceUnitContext";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { DistanceUnitToggle } from "@/components/DistanceUnitToggle";
import { useUserLocation } from "@/hooks/useUserLocation";

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795];

const MapClickHandler = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
};

const MapAreaSync = ({ area }: { area: MapSearchArea }) => {
  const map = useMap();

  useEffect(() => {
    if (!hasMapSearchCenter(area)) return;
    const zoom = area.radiusMiles && area.radiusMiles > 0 ? 10 : 12;
    map.setView([area.latitude!, area.longitude!], zoom, { animate: true });
  }, [area, map]);

  return null;
};

type Props = {
  value: MapSearchArea;
  onChange: (value: MapSearchArea) => void;
  className?: string;
  title?: string;
  description?: string;
  mapHeightClassName?: string;
};

export const MapRadiusSearchPicker = ({
  value,
  onChange,
  className,
  title = "Search by map area",
  description = "Search for a place, click the map to choose a center point, or set a radius to filter listings nearby.",
  mapHeightClassName = "h-56",
}: Props) => {
  const { formatRadiusLabel, formatDistance, toDisplayValue, fromDisplayValue, maxRadius, unitShort } =
    useDistanceUnit();
  const [placeQuery, setPlaceQuery] = useState("");
  const hasCenter = hasMapSearchCenter(value);
  const { location: userLocation } = useUserLocation(!hasCenter);
  const radiusMiles = value.radiusMiles && value.radiusMiles > 0 ? value.radiusMiles : null;

  const userCenter = useMemo<[number, number] | null>(() => {
    if (!userLocation) return null;
    return [userLocation.latitude, userLocation.longitude];
  }, [userLocation]);

  const center = useMemo<[number, number]>(() => {
    if (hasCenter) return [value.latitude!, value.longitude!];
    return userCenter || DEFAULT_CENTER;
  }, [hasCenter, value.latitude, value.longitude, userCenter]);

  const setCenter = useCallback(
    (lat: number, lng: number) => {
      onChange({
        ...value,
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
      });
    },
    [onChange, value]
  );

  const clearSearch = () => onChange(EMPTY_MAP_SEARCH);

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition((pos) =>
      setCenter(pos.coords.latitude, pos.coords.longitude)
    );
  };

  return (
    <div className={cn("bg-card border border-border rounded-xl p-4 space-y-4", className)}>
      {title ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {title}
            </h3>
            {description ? (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={useMyLocation}>
              <Crosshair className="w-4 h-4" />
              My location
            </Button>
            {hasCenter && (
              <Button type="button" size="sm" variant="ghost" onClick={clearSearch}>
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" size="sm" variant="outline" onClick={useMyLocation}>
            <Crosshair className="w-4 h-4" />
            My location
          </Button>
          {hasCenter && (
            <Button type="button" size="sm" variant="ghost" onClick={clearSearch}>
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      )}

      <PlaceSearchInput
        value={placeQuery}
        onChange={setPlaceQuery}
        onSelect={(place) => {
          setPlaceQuery(place.label);
          setCenter(place.latitude, place.longitude);
        }}
        placeholder="Search city, address, or landmark..."
      />

      <div className={cn("rounded-lg overflow-hidden border border-border relative", mapHeightClassName)}>
        <div className="absolute top-2 right-2 z-10 pointer-events-auto">
          <DistanceUnitToggle size="sm" />
        </div>
        <MapContainer
          center={center}
          zoom={hasCenter || userCenter ? 12 : 4}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPick={setCenter} />
          {hasCenter && <MapAreaSync area={value} />}
          {!hasCenter && userCenter && (
            <MapAreaSync
              area={{ latitude: userCenter[0], longitude: userCenter[1], radiusMiles: null }}
            />
          )}
          {(hasCenter || userCenter) && (
            <>
              <Marker
                position={hasCenter ? [value.latitude!, value.longitude!] : userCenter!}
                icon={leafletPinIcon}
                draggable
                eventHandlers={{
                  dragend: (event) => {
                    const pos = (event.target as L.Marker).getLatLng();
                    setCenter(pos.lat, pos.lng);
                  },
                }}
              />
              {hasCenter && value.radiusMiles != null && value.radiusMiles > 0 && (
                <Circle
                  center={[value.latitude!, value.longitude!]}
                  radius={milesToMeters(value.radiusMiles)}
                  pathOptions={{
                    color: "#e85d04",
                    fillColor: "#e85d04",
                    fillOpacity: 0.12,
                    weight: 2,
                  }}
                />
              )}
            </>
          )}
        </MapContainer>
      </div>

      {hasCenter && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Center: {value.latitude?.toFixed(4)}, {value.longitude?.toFixed(4)}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Search radius (optional)</Label>
              <span className="text-xs font-medium text-foreground">
                {formatRadiusLabel(value.radiusMiles)}
              </span>
            </div>
            <Slider
              min={0}
              max={maxRadius}
              step={1}
              value={[radiusMiles != null && radiusMiles > 0 ? toDisplayValue(radiusMiles) : 0]}
              onValueChange={([next]) =>
                onChange({
                  ...value,
                  radiusMiles: next > 0 ? fromDisplayValue(next) : null,
                })
              }
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span>Any distance</span>
              <span>
                {maxRadius} {unitShort}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Leave at &quot;Any distance&quot; to apply a default {DEFAULT_MAP_SEARCH_RADIUS_MILES}-mile
              radius when you search by map pin.
            </p>
          </div>

          {radiusMiles != null && radiusMiles > 0 && (
            <p className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
              Showing listings within {formatDistance(radiusMiles)} of the selected point.
            </p>
          )}
        </div>
      )}

      {!hasCenter && (
        <p className="text-xs text-muted-foreground">
          Optional — click the map to search around a specific area.
        </p>
      )}
    </div>
  );
};
