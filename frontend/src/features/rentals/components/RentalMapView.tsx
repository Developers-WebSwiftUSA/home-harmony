import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { Property } from "@/types/models";
import { RentalMapPreviewCard } from "@/features/rentals/components/RentalMapPreviewCard";
import { MapSearchArea, hasMapSearchCenter, milesToMeters } from "@/lib/mapSearch";
import { createPriceMarkerIcon, leafletPinIcon } from "@/lib/leafletIcons";
import { DistanceUnitToggle } from "@/components/DistanceUnitToggle";
import { useUserLocation } from "@/hooks/useUserLocation";
import { MapBoundsReporter } from "@/features/rentals/components/MapBoundsReporter";
import { MapBounds } from "@/features/rentals/lib/mapBoundsSearch";

const FALLBACK_CENTER: [number, number] = [39.8283, -98.5795]; // US centroid — not used for querying until origin is ready

const hasCoordinates = (property: Property) => {
  const coords = property.location?.coordinates?.coordinates;
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    Number.isFinite(coords[0]) &&
    Number.isFinite(coords[1]) &&
    !(coords[0] === 0 && coords[1] === 0)
  );
};

const listingCenters = (properties: Property[]): [number, number][] =>
  properties
    .map((p) => p.location?.coordinates?.coordinates)
    .filter(
      (c): c is [number, number] =>
        Array.isArray(c) &&
        c.length === 2 &&
        Number.isFinite(c[0]) &&
        Number.isFinite(c[1]) &&
        !(c[0] === 0 && c[1] === 0)
    )
    .map(([lng, lat]) => [lat, lng] as [number, number]);

/** One-shot: center map on pin, user, or listings before bounds search starts. */
const InitialMapOrigin = ({
  searchArea,
  userCenter,
  properties,
  locationSettled,
  onReady,
}: {
  searchArea?: MapSearchArea | null;
  userCenter: [number, number] | null;
  properties: Property[];
  locationSettled: boolean;
  onReady: () => void;
}) => {
  const map = useMap();
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;

    const hasSearch = Boolean(searchArea && hasMapSearchCenter(searchArea));
    if (hasSearch) {
      map.setView(
        [searchArea!.latitude!, searchArea!.longitude!],
        searchArea!.radiusMiles && searchArea!.radiusMiles > 0 ? 11 : 12,
        { animate: false }
      );
      doneRef.current = true;
      onReady();
      return;
    }

    if (userCenter) {
      map.setView(userCenter, 12, { animate: false });
      doneRef.current = true;
      onReady();
      return;
    }

    const coords = listingCenters(properties);
    if (coords.length === 1) {
      map.setView(coords[0], 13, { animate: false });
      doneRef.current = true;
      onReady();
      return;
    }
    if (coords.length > 1) {
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], animate: false });
      doneRef.current = true;
      onReady();
      return;
    }

    // No pin, no user, no listings yet — wait until geolocation settles
    if (locationSettled) {
      doneRef.current = true;
      onReady();
    }
  }, [searchArea, userCenter, properties, locationSettled, map, onReady]);

  return null;
};

type Props = {
  properties: Property[];
  highlightedId?: string | null;
  onSelect?: (property: Property) => void;
  searchArea?: MapSearchArea | null;
  searchAsMapMoves?: boolean;
  onBoundsChange?: (bounds: MapBounds) => void;
};

export const RentalMapView = ({
  properties,
  highlightedId,
  onSelect,
  searchArea,
  searchAsMapMoves = false,
  onBoundsChange,
}: Props) => {
  const mappable = properties.filter(hasCoordinates);
  const hasSearch = Boolean(searchArea && hasMapSearchCenter(searchArea));
  // Always resolve user location when there's no pin (including search-as-I-move)
  const { location: userLocation, status: locationStatus } = useUserLocation(!hasSearch);
  const locationSettled =
    locationStatus === "ready" ||
    locationStatus === "denied" ||
    locationStatus === "unsupported" ||
    locationStatus === "error";

  const userCenter: [number, number] | null = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : null;

  const pinCenter: [number, number] | null = hasSearch
    ? [searchArea!.latitude!, searchArea!.longitude!]
    : null;

  const firstListingCenter = listingCenters(mappable)[0] || null;

  const defaultCenter: [number, number] =
    pinCenter || userCenter || firstListingCenter || FALLBACK_CENTER;

  const [originReady, setOriginReady] = useState(false);
  const handleOriginReady = useCallback(() => setOriginReady(true), []);

  // Reset readiness when pin search changes so we re-center
  useEffect(() => {
    setOriginReady(false);
  }, [searchArea?.latitude, searchArea?.longitude, searchArea?.radiusMiles]);

  const boundsEnabled =
    searchAsMapMoves && Boolean(onBoundsChange) && originReady && !hasSearch;

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-border relative">
      <div className="absolute top-2 right-2 z-10 pointer-events-auto">
        <DistanceUnitToggle size="sm" />
      </div>
      {!originReady && searchAsMapMoves && (
        <div className="absolute bottom-3 left-3 z-10 rounded-md bg-background/90 border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground shadow-sm">
          Centering map…
        </div>
      )}
      <MapContainer center={defaultCenter} zoom={11} className="h-full w-full min-h-[300px]" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <InitialMapOrigin
          searchArea={searchArea}
          userCenter={userCenter}
          properties={mappable}
          locationSettled={locationSettled}
          onReady={handleOriginReady}
        />
        {onBoundsChange && (
          <MapBoundsReporter enabled={boundsEnabled} onBoundsChange={onBoundsChange} />
        )}

        {pinCenter && (
          <>
            <Marker position={pinCenter} icon={leafletPinIcon} />
            {hasSearch && searchArea!.radiusMiles != null && searchArea!.radiusMiles > 0 && (
              <Circle
                center={pinCenter}
                radius={milesToMeters(searchArea!.radiusMiles)}
                pathOptions={{
                  color: "#e85d04",
                  fillColor: "#e85d04",
                  fillOpacity: 0.1,
                  weight: 2,
                  dashArray: "6 4",
                }}
              />
            )}
          </>
        )}

        {mappable.map((property) => {
          const [lng, lat] = property.location!.coordinates!.coordinates;
          const active = highlightedId === property._id;
          return (
            <Marker
              key={property._id}
              position={[lat, lng]}
              icon={createPriceMarkerIcon(property.price, active)}
              eventHandlers={{ click: () => onSelect?.(property) }}
            >
              <Popup closeButton={false}>
                <RentalMapPreviewCard property={property} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
