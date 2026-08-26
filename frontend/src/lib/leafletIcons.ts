import L from "leaflet";
import { formatRentPriceShort } from "@/features/rentals/lib/rentalFormat";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/** Pin marker for search center / property location */
export const leafletPinIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** Price bubble markers — CSS classes in index.css (inline hsl(var()) fails in Leaflet divIcon) */
export const createPriceMarkerIcon = (price: number, active = false) =>
  L.divIcon({
    className: "leaflet-price-marker-icon",
    html: `<div class="leaflet-price-marker-label${active ? " is-active" : ""}">${formatRentPriceShort(price)}</div>`,
    iconSize: [80, 32],
    iconAnchor: [40, 16],
  });

export const setupLeafletDefaults = () => {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
};
