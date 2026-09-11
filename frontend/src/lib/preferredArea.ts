import { EMPTY_MAP_SEARCH, MapSearchArea, hasMapSearchCenter } from "@/lib/mapSearch";
import { AgentPreferredArea } from "@/types/models";

export type PreferredAreaDraft = MapSearchArea & {
  label?: string;
  city?: string;
  state?: string;
};

export const EMPTY_PREFERRED_AREA: PreferredAreaDraft = {
  ...EMPTY_MAP_SEARCH,
  label: "",
  city: "",
  state: "",
};

export const preferredAreaToDraft = (area?: AgentPreferredArea | null): PreferredAreaDraft => {
  const coords = area?.coordinates?.coordinates;
  if (!coords || coords.length < 2) return { ...EMPTY_PREFERRED_AREA };
  const longitude = Number(coords[0]);
  const latitude = Number(coords[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return { ...EMPTY_PREFERRED_AREA };
  return {
    latitude,
    longitude,
    radiusMiles: area.radiusMiles ?? null,
    label: area.label || "",
    city: area.city || "",
    state: area.state || "",
  };
};

export const draftToPreferredArea = (draft: PreferredAreaDraft): AgentPreferredArea | null => {
  if (!hasMapSearchCenter(draft)) return null;
  return {
    label: draft.label?.trim() || undefined,
    city: draft.city?.trim() || undefined,
    state: draft.state?.trim() || undefined,
    radiusMiles: draft.radiusMiles && draft.radiusMiles > 0 ? draft.radiusMiles : undefined,
    coordinates: {
      type: "Point",
      coordinates: [draft.longitude!, draft.latitude!],
    },
  };
};
