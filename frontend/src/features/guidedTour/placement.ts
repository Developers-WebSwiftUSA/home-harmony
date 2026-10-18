import type { CSSProperties } from "react";
import type { TourPlacement } from "./types";

export type Rect = { top: number; left: number; width: number; height: number };

const CARD_W = 340;
const CARD_H = 200;
const GAP = 16;
const EDGE = 16;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const fits = (top: number, left: number) =>
  top >= EDGE &&
  left >= EDGE &&
  top + CARD_H <= window.innerHeight - EDGE &&
  left + CARD_W <= window.innerWidth - EDGE;

const candidates = (rect: Rect, preferred: TourPlacement): Array<{ placement: TourPlacement; top: number; left: number }> => {
  const below = { placement: "bottom" as const, top: rect.top + rect.height + GAP, left: rect.left };
  const above = { placement: "top" as const, top: rect.top - GAP - CARD_H, left: rect.left };
  const right = { placement: "right" as const, top: rect.top, left: rect.left + rect.width + GAP };
  const left = { placement: "left" as const, top: rect.top, left: rect.left - GAP - CARD_W };

  const order =
    preferred === "top"
      ? [above, below, right, left]
      : preferred === "left"
        ? [left, right, below, above]
        : preferred === "right"
          ? [right, left, below, above]
          : [below, above, right, left];

  return order;
};

/** Places the coachmark card beside the spotlight without going off-screen. */
export const coachmarkStyle = (
  rect: Rect,
  preferred: TourPlacement = "auto"
): CSSProperties => {
  const pref = preferred === "auto" ? "bottom" : preferred;
  const list = candidates(rect, pref);
  const chosen = list.find((item) => fits(item.top, item.left)) || list[0];

  return {
    position: "fixed",
    zIndex: 10055,
    width: `min(${CARD_W}px, calc(100vw - ${EDGE * 2}px))`,
    top: clamp(chosen.top, EDGE, window.innerHeight - EDGE - 120),
    left: clamp(chosen.left, EDGE, window.innerWidth - EDGE - 200),
  };
};
