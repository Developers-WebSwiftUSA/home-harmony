import { BookOpen, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HelpManualContent } from "@/features/help/components/HelpManualContent";
import type { HelpManual } from "@/features/help/types/help.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manual: HelpManual;
};

export const PageHelpDialog = ({ open, onOpenChange, manual }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 pr-6">
          <BookOpen className="w-5 h-5 text-primary shrink-0" />
          {manual.title}
        </DialogTitle>
        <DialogDescription>Step-by-step guide for this page</DialogDescription>
      </DialogHeader>
      <HelpManualContent manual={manual} />
    </DialogContent>
  </Dialog>
);

export const PageHelpButton = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Open page help guide"
    title="How to use this page"
    className={
      className ??
      "fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    }
  >
    <HelpCircle className="w-6 h-6" />
  </button>
);
