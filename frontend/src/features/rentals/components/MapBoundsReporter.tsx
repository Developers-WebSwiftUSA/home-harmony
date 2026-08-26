import { useEffect, useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { MapBounds } from "@/features/rentals/lib/mapBoundsSearch";

type Props = {
  enabled: boolean;
  onBoundsChange: (bounds: MapBounds) => void;
};

export const MapBoundsReporter = ({ enabled, onBoundsChange }: Props) => {
  const map = useMap();
  const timerRef = useRef<number | null>(null);
  const onBoundsChangeRef = useRef(onBoundsChange);

  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange;
  }, [onBoundsChange]);

  const reportBounds = () => {
    if (!enabled) return;
    const bounds = map.getBounds();
    onBoundsChangeRef.current({
      swLng: bounds.getWest(),
      swLat: bounds.getSouth(),
      neLng: bounds.getEast(),
      neLat: bounds.getNorth(),
    });
  };

  const scheduleReport = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(reportBounds, 400);
  };

  useMapEvents({
    moveend: scheduleReport,
    zoomend: scheduleReport,
  });

  useEffect(() => {
    if (!enabled) return;
    scheduleReport();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [enabled, map]);

  return null;
};
