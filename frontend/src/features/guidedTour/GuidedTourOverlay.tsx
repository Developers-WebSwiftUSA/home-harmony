import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatedTourCursor } from "./AnimatedTourCursor";
import { TourProgress } from "./TourProgress";
import { coachmarkStyle, type Rect } from "./placement";
import type { TourStep } from "./types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MousePointerClick, Sparkles } from "lucide-react";

type Props = {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  tourTitle: string;
  onSkip: () => void;
  onNext: () => void;
  onTargetActivated: () => void;
};

const PAD = 10;

const visibleTourTargets = (target: string) =>
  Array.from(document.querySelectorAll(`[data-tour="${target}"]`)).filter((node) => {
    if (!(node instanceof HTMLElement)) return false;
    const r = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    if (style.visibility === "hidden" || style.display === "none") return false;
    return r.width >= 2 && r.height >= 2;
  }) as HTMLElement[];

const readTargetRect = (target: string): Rect | null => {
  const el = visibleTourTargets(target)[0];
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
};

export const GuidedTourOverlay = ({
  step,
  stepIndex,
  totalSteps,
  tourTitle,
  onSkip,
  onNext,
  onTargetActivated,
}: Props) => {
  const kind = step.kind || (step.target ? "spotlight" : "intro");
  const advanceMode = step.advanceMode || (kind === "spotlight" ? "click" : "next");
  const [rect, setRect] = useState<Rect | null>(null);
  const [missing, setMissing] = useState(false);
  const activatedRef = useRef(false);

  useEffect(() => {
    activatedRef.current = false;
  }, [step.id]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useLayoutEffect(() => {
    if (kind !== "spotlight" || !step.target) {
      setRect(null);
      setMissing(false);
      return;
    }

    let cancelled = false;
    let tries = 0;
    let openedMobile = false;

    const update = () => {
      if (cancelled || !step.target) return;
      const next = readTargetRect(step.target);
      if (next) {
        setRect(next);
        setMissing(false);
        if (tries === 0 || tries % 8 === 0) {
          visibleTourTargets(step.target)[0]?.scrollIntoView({
            block: "nearest",
            inline: "nearest",
            behavior: "smooth",
          });
        }
        return;
      }

      if (
        !openedMobile &&
        step.target.startsWith("nav-") &&
        step.target !== "nav-signin" &&
        window.matchMedia("(max-width: 1023px)").matches
      ) {
        openedMobile = true;
        window.dispatchEvent(new Event("htg-open-mobile-nav"));
      }

      tries += 1;
      if (tries > 40) {
        setMissing(true);
        setRect(null);
      }
    };

    update();
    const interval = window.setInterval(update, 100);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step.target, step.id, kind]);

  useEffect(() => {
    if (kind !== "spotlight" || !step.target || advanceMode !== "click") return;

    const targetAttr = step.target;

    const isTourChrome = (node: EventTarget | null) =>
      node instanceof Element && Boolean(node.closest("#guided-tour-ui"));

    const isTarget = (node: EventTarget | null) =>
      node instanceof Element && Boolean(node.closest(`[data-tour="${targetAttr}"]`));

    const block = (event: Event) => {
      if (isTourChrome(event.target) || isTarget(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const onTargetClick = (event: Event) => {
      if (!isTarget(event.target) || isTourChrome(event.target)) return;
      if (activatedRef.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      activatedRef.current = true;

      if (step.suppressTargetAction) {
        event.preventDefault();
        event.stopPropagation();
        onTargetActivated();
        return;
      }

      window.setTimeout(() => onTargetActivated(), 50);
    };

    document.addEventListener("pointerdown", block, true);
    document.addEventListener("mousedown", block, true);
    document.addEventListener("click", block, true);
    document.addEventListener("touchstart", block, true);
    document.addEventListener("click", onTargetClick, true);

    return () => {
      document.removeEventListener("pointerdown", block, true);
      document.removeEventListener("mousedown", block, true);
      document.removeEventListener("click", block, true);
      document.removeEventListener("touchstart", block, true);
      document.removeEventListener("click", onTargetClick, true);
    };
  }, [kind, step.target, step.suppressTargetAction, advanceMode, onTargetActivated, step.id]);

  useEffect(() => {
    if (kind !== "spotlight" || !step.target) return;
    const nodes = visibleTourTargets(step.target);
    nodes.forEach((el) => el.classList.add("guided-tour-target"));
    return () => nodes.forEach((el) => el.classList.remove("guided-tour-target"));
  }, [step.target, rect, kind]);

  // Informational spotlight: block outside clicks but allow Next
  useEffect(() => {
    if (kind !== "spotlight" || advanceMode !== "next") return;

    const block = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest("#guided-tour-ui")) return;
      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener("pointerdown", block, true);
    document.addEventListener("click", block, true);
    document.addEventListener("touchstart", block, true);
    return () => {
      document.removeEventListener("pointerdown", block, true);
      document.removeEventListener("click", block, true);
      document.removeEventListener("touchstart", block, true);
    };
  }, [kind, advanceMode, step.id]);

  const cursorX = rect ? rect.left + Math.min(rect.width * 0.75, rect.width - 8) : 0;
  const cursorY = rect ? rect.top + Math.min(rect.height * 0.65, rect.height - 8) : 0;

  if (kind === "intro" || kind === "outro") {
    return (
      <div id="guided-tour-ui" className="fixed inset-0 z-[10040] flex items-center justify-center p-4">
        <div className="guided-tour-shade absolute inset-0" />
        <div
          className="relative z-[10055] w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guided-tour-title"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <TourProgress index={stepIndex} total={totalSteps} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1">{tourTitle}</p>
          <h2 id="guided-tour-title" className="font-heading text-2xl font-bold text-foreground">
            {step.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.body}</p>
          <div className="flex flex-wrap items-center justify-end gap-2 mt-6">
            {kind === "intro" ? (
              <Button type="button" variant="ghost" onClick={onSkip}>
                Skip tutorial
              </Button>
            ) : null}
            <Button type="button" onClick={onNext}>
              {step.ctaLabel || (kind === "outro" ? "Finish" : "Continue")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="guided-tour-ui" className="contents">
      {rect ? (
        <>
          <div className="guided-tour-shade fixed inset-x-0 top-0 z-[10040]" style={{ height: Math.max(0, rect.top) }} />
          <div
            className="guided-tour-shade fixed inset-x-0 z-[10040]"
            style={{ top: rect.top + rect.height, bottom: 0 }}
          />
          <div
            className="guided-tour-shade fixed z-[10040]"
            style={{ top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.height }}
          />
          <div
            className="guided-tour-shade fixed z-[10040]"
            style={{
              top: rect.top,
              left: rect.left + rect.width,
              right: 0,
              height: rect.height,
            }}
          />
          <div
            className="guided-tour-spotlight pointer-events-none fixed z-[10045] rounded-xl"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }}
          />
          {advanceMode === "click" ? <AnimatedTourCursor x={cursorX} y={cursorY} visible /> : null}
        </>
      ) : (
        <div className="guided-tour-shade fixed inset-0 z-[10040]" />
      )}

      <div
        className={cn(
          "fixed z-[10055] rounded-2xl border border-border bg-card p-4 shadow-2xl",
          !rect && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(340px,90vw)]"
        )}
        style={rect ? coachmarkStyle(rect, step.placement || "auto") : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-tour-title"
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Step {stepIndex + 1} of {totalSteps}
          </p>
          <TourProgress index={stepIndex} total={totalSteps} />
        </div>
        <h2 id="guided-tour-title" className="font-heading text-lg font-bold text-foreground">
          {step.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{step.body}</p>

        {missing ? (
          <p className="text-xs text-destructive mt-3">
            That control isn&apos;t visible yet. Wait a moment, or skip this tutorial.
          </p>
        ) : advanceMode === "click" ? (
          <p className="text-xs text-primary mt-3 font-medium inline-flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5" />
            Click the highlighted control to continue
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
          <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
            Skip
          </Button>
          {advanceMode === "next" || missing ? (
            <Button type="button" size="sm" onClick={onNext}>
              {step.ctaLabel || "Next"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
