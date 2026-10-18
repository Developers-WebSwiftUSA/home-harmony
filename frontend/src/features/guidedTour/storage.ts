import type { TourId } from "./types";

export const WELCOME_INTENT_SEEN_KEY = "htg-welcome-intent-seen";
export const WELCOME_INTENT_DISMISSED_EVENT = "htg-welcome-intent-dismissed";

const tourKey = (id: TourId) => `htg-guided-tour-${id}`;

export const isTourCompleted = (id: TourId) => {
  try {
    return localStorage.getItem(tourKey(id)) === "1";
  } catch {
    return true;
  }
};

export const markTourCompleted = (id: TourId) => {
  try {
    localStorage.setItem(tourKey(id), "1");
  } catch {
    /* ignore quota / private mode */
  }
};

export const clearTourCompleted = (id: TourId) => {
  try {
    localStorage.removeItem(tourKey(id));
  } catch {
    /* ignore */
  }
};

export const isWelcomeIntentSeen = () => {
  try {
    return Boolean(localStorage.getItem(WELCOME_INTENT_SEEN_KEY));
  } catch {
    return true;
  }
};

export const GUIDED_TOUR_REPLAY_EVENT = "htg-replay-guided-tour";
/** Fired after login/register so the role dashboard tour can start. */
export const AUTH_SESSION_STARTED_EVENT = "htg-auth-session-started";

export const requestGuidedTourReplay = (tourId?: TourId) => {
  window.dispatchEvent(
    new CustomEvent(GUIDED_TOUR_REPLAY_EVENT, { detail: { tourId: tourId || null } })
  );
};

export const notifyAuthSessionStarted = (role?: string) => {
  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_STARTED_EVENT, { detail: { role: role || null } })
  );
};

export const roleDashboardPath = (role?: string | null) => {
  if (role === "admin") return "/admin";
  if (role === "seller") return "/seller";
  if (role === "agent") return "/agent";
  if (role === "buyer") return "/buyer";
  return null;
};
