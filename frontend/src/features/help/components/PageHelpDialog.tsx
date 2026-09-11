import { BookOpen } from "lucide-react";
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
        <DialogDescription>User guide for this page</DialogDescription>
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
    aria-label="Open user guide"
    title="User Guide"
    className={
      className ??
      "fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full bg-primary px-4 text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    }
  >
    <BookOpen className="w-5 h-5 shrink-0" />
    <span className="text-sm font-medium">User Guide</span>
  </button>
);
