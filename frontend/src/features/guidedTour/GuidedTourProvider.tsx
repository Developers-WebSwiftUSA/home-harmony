import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { GuidedTourOverlay } from "./GuidedTourOverlay";
import {
  AUTH_SESSION_STARTED_EVENT,
  GUIDED_TOUR_REPLAY_EVENT,
  WELCOME_INTENT_DISMISSED_EVENT,
  clearTourCompleted,
  isTourCompleted,
  isWelcomeIntentSeen,
  markTourCompleted,
  roleDashboardPath,
} from "./storage";
import { GUIDED_TOURS, tourIdForRole } from "./tours";
import type { TourId, TourStep } from "./types";

type ActiveTour = {
  id: TourId;
  title: string;
  steps: TourStep[];
  index: number;
};

const isAuthPath = (pathname: string) =>
  pathname === "/login" || pathname === "/forgot-password";

const isDashboardPath = (pathname: string) =>
  /^\/(admin|seller|agent|buyer)(\/|$)/.test(pathname);

const pathMatches = (pathname: string, expected?: string) => {
  if (!expected) return true;
  if (expected === "/") return pathname === "/";
  return pathname === expected || pathname.startsWith(`${expected}/`);
};

export const GuidedTourProvider = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState<ActiveTour | null>(null);
  const [waitingForPath, setWaitingForPath] = useState<string | null>(null);
  const startedRef = useRef<string | null>(null);
  const advancingRef = useRef(false);
  const roleTourScheduledRef = useRef(false);
  const wasAuthenticatedRef = useRef(false);

  const stopActiveTour = useCallback((markComplete = false) => {
    if (markComplete && startedRef.current) {
      markTourCompleted(startedRef.current as TourId);
    }
    setActive(null);
    setWaitingForPath(null);
    startedRef.current = null;
    advancingRef.current = false;
  }, []);

  const finishTour = useCallback((tourId: TourId) => {
    markTourCompleted(tourId);
    setActive(null);
    setWaitingForPath(null);
    startedRef.current = null;
    advancingRef.current = false;
  }, []);

  const startTour = useCallback(
    (tourId: TourId, force = false) => {
      const def = GUIDED_TOURS[tourId];
      if (!def?.steps?.length) return false;
      if (!force && isTourCompleted(tourId)) return false;
      if (force) clearTourCompleted(tourId);

      // End any other tour (e.g. guest → dashboard handoff).
      if (startedRef.current && startedRef.current !== tourId) {
        if (startedRef.current === "public") {
          markTourCompleted("public");
        }
      }

      setWaitingForPath(null);
      advancingRef.current = false;
      startedRef.current = tourId;

      const home = roleDashboardPath(tourId === "public" ? null : tourId);
      const firstRoute =
        home && tourId !== "public"
          ? home
          : def.steps.find((s) => s.route)?.route;

      if (firstRoute && !pathMatches(location.pathname, firstRoute)) {
        navigate(firstRoute);
      }

      setActive({
        id: tourId,
        title: def.title,
        steps: def.steps,
        index: 0,
      });
      return true;
    },
    [location.pathname, navigate]
  );

  const scheduleRoleTour = useCallback(
    (role?: string | null, opts?: { forceNavigate?: boolean }) => {
      const tourId = tourIdForRole(role || undefined);
      if (!tourId) return;
      if (isTourCompleted(tourId)) {
        roleTourScheduledRef.current = true;
        return;
      }
      if (startedRef.current === tourId || roleTourScheduledRef.current) return;

      roleTourScheduledRef.current = true;

      // Close guest walkthrough so the dashboard tour can take over.
      if (startedRef.current === "public" || active?.id === "public") {
        markTourCompleted("public");
        stopActiveTour(false);
      }

      const home = roleDashboardPath(tourId);
      if (home && (opts?.forceNavigate || !isDashboardPath(location.pathname))) {
        navigate(home);
      }

      window.setTimeout(() => {
        const started = startTour(tourId);
        if (!started) roleTourScheduledRef.current = false;
      }, 600);
    },
    [active?.id, location.pathname, navigate, startTour, stopActiveTour]
  );

  // Guest public tour after welcome intent (never while logged in).
  useEffect(() => {
    if (isAuthenticated) return;

    const maybeStartPublic = () => {
      if (isLoading || isAuthenticated) return;
      if (isAuthPath(location.pathname) || isDashboardPath(location.pathname)) return;
      if (!isWelcomeIntentSeen() || isTourCompleted("public")) return;
      if (startedRef.current === "public" || active?.id === "public") return;
      if (location.pathname !== "/") {
        navigate("/");
      }
      window.setTimeout(() => startTour("public"), 400);
    };

    const timer = window.setTimeout(maybeStartPublic, 500);
    window.addEventListener(WELCOME_INTENT_DISMISSED_EVENT, maybeStartPublic);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(WELCOME_INTENT_DISMISSED_EVENT, maybeStartPublic);
    };
  }, [isLoading, isAuthenticated, location.pathname, active?.id, startTour, navigate]);

  // After login/register — always offer the role dashboard tour once.
  useEffect(() => {
    const onSessionStarted = (event: Event) => {
      const role =
        (event as CustomEvent<{ role?: string | null }>).detail?.role || user?.role;
      roleTourScheduledRef.current = false;
      scheduleRoleTour(role, { forceNavigate: true });
    };
    window.addEventListener(AUTH_SESSION_STARTED_EVENT, onSessionStarted);
    return () => window.removeEventListener(AUTH_SESSION_STARTED_EVENT, onSessionStarted);
  }, [scheduleRoleTour, user?.role]);

  // Detect auth flip (e.g. restored session already handled; login without event edge cases).
  useEffect(() => {
    if (isLoading) return;

    const wasAuth = wasAuthenticatedRef.current;
    wasAuthenticatedRef.current = isAuthenticated;

    if (!isAuthenticated) {
      roleTourScheduledRef.current = false;
      if (startedRef.current && startedRef.current !== "public") {
        stopActiveTour(false);
      }
      return;
    }

    // Fresh login transition: guest → authenticated
    if (!wasAuth && isAuthenticated && user?.role) {
      roleTourScheduledRef.current = false;
      scheduleRoleTour(user.role, { forceNavigate: true });
      return;
    }

    // Already logged in, first time on a dashboard this session without completing tour
    if (
      isAuthenticated &&
      user?.role &&
      isDashboardPath(location.pathname) &&
      !roleTourScheduledRef.current &&
      startedRef.current !== tourIdForRole(user.role)
    ) {
      scheduleRoleTour(user.role);
    }
  }, [
    isLoading,
    isAuthenticated,
    user?.role,
    location.pathname,
    scheduleRoleTour,
    stopActiveTour,
  ]);

  useEffect(() => {
    const onReplay = (event: Event) => {
      const detail = (event as CustomEvent<{ tourId?: TourId | null }>).detail;
      const roleTour = tourIdForRole(user?.role);
      const nextId = detail?.tourId || (isAuthenticated && roleTour ? roleTour : "public");
      roleTourScheduledRef.current = nextId !== "public";
      startTour(nextId, true);
    };
    window.addEventListener(GUIDED_TOUR_REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(GUIDED_TOUR_REPLAY_EVENT, onReplay);
  }, [user?.role, isAuthenticated, startTour]);

  const step = active ? active.steps[active.index] : null;

  useEffect(() => {
    if (!step?.route) return;
    if (pathMatches(location.pathname, step.route)) return;
    navigate(step.route);
  }, [step?.id, step?.route, location.pathname, navigate]);

  const goNext = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setWaitingForPath(null);
    setActive((prev) => {
      if (!prev) return null;
      const nextIndex = prev.index + 1;
      if (nextIndex >= prev.steps.length) {
        markTourCompleted(prev.id);
        startedRef.current = null;
        advancingRef.current = false;
        return null;
      }
      window.setTimeout(() => {
        advancingRef.current = false;
      }, 80);
      return { ...prev, index: nextIndex };
    });
  }, []);

  useEffect(() => {
    if (!active || !waitingForPath) return;
    if (!pathMatches(location.pathname, waitingForPath)) return;
    goNext();
  }, [location.pathname, waitingForPath, active, goNext]);

  const onTargetActivated = useCallback(() => {
    if (!step) return;
    if (step.advanceOnPath) {
      if (pathMatches(location.pathname, step.advanceOnPath)) {
        goNext();
        return;
      }
      setWaitingForPath(step.advanceOnPath);
      return;
    }
    goNext();
  }, [step, location.pathname, goNext]);

  const onSkip = useCallback(() => {
    if (!active) return;
    finishTour(active.id);
  }, [active, finishTour]);

  const waitingOnRoute =
    Boolean(step?.route) && !pathMatches(location.pathname, step?.route) && !waitingForPath;

  const ready = Boolean(step) && (Boolean(waitingForPath) || !waitingOnRoute);

  const overlayKey = useMemo(
    () => (active && step ? `${active.id}-${step.id}` : "idle"),
    [active, step]
  );

  if (!active || !step || !ready) return null;

  return (
    <GuidedTourOverlay
      key={overlayKey}
      step={step}
      stepIndex={active.index}
      totalSteps={active.steps.length}
      tourTitle={active.title}
      onSkip={onSkip}
      onNext={goNext}
      onTargetActivated={onTargetActivated}
    />
  );
};
