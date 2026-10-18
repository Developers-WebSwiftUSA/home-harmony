import type { CSSProperties } from "react";
import type { TourPlacement } from "./types";

export type Rect = { top: number; left: number; width: number; height: number };

const CARD_W = 340;
const CARD_H = 220;
const GAP = 16;
const EDGE = 16;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type Candidate = { placement: TourPlacement; top: number; left: number };

const buildCandidates = (rect: Rect, cardW: number, cardH: number): Candidate[] => {
  const targetRight = rect.left + rect.width;
  const targetBottom = rect.top + rect.height;
  const targetCenterX = rect.left + rect.width / 2;

  return [
    // Above, right-aligned to target (best for bottom-right FAB)
    {
      placement: "top",
      top: rect.top - GAP - cardH,
      left: targetRight - cardW,
    },
    // Above, centered on target
    {
      placement: "top",
      top: rect.top - GAP - cardH,
      left: targetCenterX - cardW / 2,
    },
    // Left of target, bottom-aligned (second best for bottom-right FAB)
    {
      placement: "left",
      top: targetBottom - cardH,
      left: rect.left - GAP - cardW,
    },
    // Left of target, top-aligned
    {
      placement: "left",
      top: rect.top,
      left: rect.left - GAP - cardW,
    },
    // Above, left-aligned
    {
      placement: "top",
      top: rect.top - GAP - cardH,
      left: rect.left,
    },
    // Right of target, bottom-aligned
    {
      placement: "right",
      top: targetBottom - cardH,
      left: targetRight + GAP,
    },
    // Below, right-aligned
    {
      placement: "bottom",
      top: targetBottom + GAP,
      left: targetRight - cardW,
    },
    // Below, left-aligned
    {
      placement: "bottom",
      top: targetBottom + GAP,
      left: rect.left,
    },
  ];
};

const overflowScore = (top: number, left: number, cardW: number, cardH: number) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let score = 0;
  if (left < EDGE) score += EDGE - left;
  if (top < EDGE) score += EDGE - top;
  if (left + cardW > vw - EDGE) score += left + cardW - (vw - EDGE);
  if (top + cardH > vh - EDGE) score += top + cardH - (vh - EDGE);
  return score;
};

const preferredBonus = (placement: TourPlacement, preferred: TourPlacement) => {
  if (preferred === "auto") return 0;
  return placement === preferred ? -80 : 0;
};

/**
 * Places the coachmark near the spotlight, preferring on-screen positions.
 * Corner targets (e.g. bottom-right User Guide) anchor above / to the left.
 */
export const coachmarkStyle = (
  rect: Rect,
  preferred: TourPlacement = "auto"
): CSSProperties => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(CARD_W, vw - EDGE * 2);
  const cardH = Math.min(CARD_H, vh - EDGE * 2);

  const pref = preferred === "auto" ? "top" : preferred;
  const candidates = buildCandidates(rect, cardW, cardH);

  // Prefer the requested side first in the ranking.
  const ordered =
    pref === "left"
      ? [...candidates.filter((c) => c.placement === "left"), ...candidates]
      : pref === "right"
        ? [...candidates.filter((c) => c.placement === "right"), ...candidates]
        : pref === "bottom"
          ? [...candidates.filter((c) => c.placement === "bottom"), ...candidates]
          : [...candidates.filter((c) => c.placement === "top"), ...candidates];

  let best = ordered[0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of ordered) {
    const score =
      overflowScore(candidate.top, candidate.left, cardW, cardH) +
      preferredBonus(candidate.placement, pref);
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
    if (score <= 0) break;
  }

  return {
    position: "fixed",
    zIndex: 10055,
    width: cardW,
    maxWidth: `calc(100vw - ${EDGE * 2}px)`,
    top: clamp(best.top, EDGE, Math.max(EDGE, vh - EDGE - Math.min(cardH, 160))),
    left: clamp(best.left, EDGE, Math.max(EDGE, vw - EDGE - cardW)),
  };
};
