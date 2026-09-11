import { useEffect, useRef, useState } from "react";
import { MapRadiusSearchPicker } from "@/components/MapRadiusSearchPicker";
import { DEFAULT_MAP_SEARCH_RADIUS_MILES, MapSearchArea } from "@/lib/mapSearch";
import { reverseGeocode } from "@/lib/geocoding";
import {
  EMPTY_PREFERRED_AREA,
  PreferredAreaDraft,
} from "@/lib/preferredArea";
import { useDistanceUnit } from "@/context/DistanceUnitContext";
import { cn } from "@/lib/utils";

type Props = {
  value: PreferredAreaDraft;
  onChange: (value: PreferredAreaDraft) => void;
  className?: string;
  compact?: boolean;
  title?: string;
  description?: string;
};

export const AgentPreferredAreaPicker = ({
  value,
  onChange,
  className,
  compact,
  title = "Preferred area",
  description = "Search a city or neighborhood, drop a pin, and optionally set a service radius. This is optional.",
}: Props) => {
  const { formatDistance } = useDistanceUnit();
  const [geocoding, setGeocoding] = useState(false);
  const lastLookup = useRef("");
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  valueRef.current = value;
  onChangeRef.current = onChange;

  useEffect(() => {
    const current = valueRef.current;
    if (current.latitude == null || current.longitude == null) return;
    if (current.city || current.state || current.label) return;
    const key = `${current.latitude.toFixed(5)},${current.longitude.toFixed(5)}`;
    if (lastLookup.current === key) return;
    lastLookup.current = key;
    let cancelled = false;
    setGeocoding(true);
    reverseGeocode(current.latitude, current.longitude)
      .then((place) => {
        if (cancelled || !place) return;
        onChangeRef.current({
          ...valueRef.current,
          label: place.label,
          city: place.city || "",
          state: place.state || "",
        });
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setGeocoding(false);
      });
    return () => {
      cancelled = true;
    };
  }, [value.latitude, value.longitude, value.city, value.state, value.label]);

  const handleAreaChange = (area: MapSearchArea) => {
    if (area.latitude == null || area.longitude == null) {
      onChange({ ...EMPTY_PREFERRED_AREA });
      return;
    }
    const samePoint = area.latitude === value.latitude && area.longitude === value.longitude;
    onChange({
      ...value,
      ...area,
      ...(samePoint ? {} : { label: "", city: "", state: "" }),
    });
  };

  return (
    <div className={cn(className)}>
      <MapRadiusSearchPicker
        value={value}
        onChange={handleAreaChange}
        onPlaceSelect={(place) =>
          onChange({
            ...value,
            latitude: place.latitude,
            longitude: place.longitude,
            radiusMiles: value.radiusMiles ?? DEFAULT_MAP_SEARCH_RADIUS_MILES,
            label: place.label,
            city: place.city || "",
            state: place.state || "",
          })
        }
        title={title}
        description={description}
        mapHeightClassName={compact ? "h-48" : "h-56"}
        className={compact ? "p-0 border-0 bg-transparent rounded-none" : undefined}
        radiusHelpText="Leave at Any distance to use the pin for ranking without a radius cap."
        selectedAreaHint={
          value.radiusMiles
            ? `Listings in this radius (${formatDistance(value.radiusMiles)}) will rank you higher in agent selection.`
            : undefined
        }
      />
      {geocoding ? (
        <p className="text-[11px] text-muted-foreground mt-2">Looking up that map location…</p>
      ) : value.label ? (
        <p className="text-xs text-muted-foreground mt-2">{value.label}</p>
      ) : null}
    </div>
  );
};
