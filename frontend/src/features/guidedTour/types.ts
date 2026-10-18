export type TourPlacement = "top" | "bottom" | "left" | "right" | "auto";

export type TourStepKind = "intro" | "spotlight" | "outro";

export type TourAdvanceMode = "click" | "next";

export type TourStep = {
  id: string;
  kind?: TourStepKind;
  /** Matches `[data-tour="..."]` — required for spotlight */
  target?: string;
  title: string;
  body: string;
  /** Ensure this path before showing the step */
  route?: string;
  placement?: TourPlacement;
  /**
   * click = user must click the highlighted control (game style)
   * next = highlight for context; continue with the Next button
   */
  advanceMode?: TourAdvanceMode;
  /** After a forced click, wait until this path before the next step */
  advanceOnPath?: string;
  /** Prevent the target's default action (e.g. don't open User Guide mid-tour) */
  suppressTargetAction?: boolean;
  ctaLabel?: string;
};

export type TourId = "public" | "buyer" | "seller" | "agent" | "admin";

export type GuidedTourDefinition = {
  id: TourId;
  title: string;
  steps: TourStep[];
};
