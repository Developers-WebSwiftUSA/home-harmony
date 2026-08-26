import { Link } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import { HelpVisualMockup } from "@/features/help/components/HelpVisualMockup";
import type { HelpManual } from "@/features/help/types/help.types";

type Props = {
  manual: HelpManual;
  compact?: boolean;
};

export const HelpManualContent = ({ manual, compact = false }: Props) => (
  <div className="space-y-4">
    {!compact && (
      <p className="text-sm text-muted-foreground leading-relaxed">{manual.summary}</p>
    )}

    <ol className="space-y-5">
      {manual.steps.map((step, index) => (
        <li key={step.title} className="space-y-2">
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm">{step.title}</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
              {step.visual && <HelpVisualMockup type={step.visual} />}
              {step.tips && step.tips.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {step.tips.map((tip) => (
                    <li
                      key={tip}
                      className="flex gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-md px-2.5 py-1.5"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>

    {manual.relatedLinks && manual.relatedLinks.length > 0 && (
      <div className="pt-2 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground mb-2">Related</p>
        <div className="flex flex-wrap gap-2">
          {manual.relatedLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    )}
  </div>
);
