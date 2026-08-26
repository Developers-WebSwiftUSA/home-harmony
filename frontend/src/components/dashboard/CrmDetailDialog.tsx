import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl";
  className?: string;
  layer?: "base" | "nested";
};

const sizeClasses = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const layerClasses = {
  base: { overlay: "z-50", content: "z-50" },
  nested: { overlay: "z-[60]", content: "z-[60]" },
};

export const CrmDetailDialog = ({
  open,
  onOpenChange,
  children,
  size = "lg",
  className,
  layer = "base",
}: Props) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 bg-black/45 backdrop-blur-[3px]",
          layerClasses[layer].overlay,
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "duration-300 ease-out"
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2",
          layerClasses[layer].content,
          sizeClasses[size],
          "max-h-[min(90vh,880px)] overflow-hidden flex flex-col",
          "rounded-2xl border border-border/70 bg-card shadow-[0_24px_80px_-12px_rgba(0,0,0,0.35)]",
          "outline-none",
          "duration-300 ease-out",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-[0.96] data-[state=open]:zoom-in-[0.96]",
          "data-[state=closed]:slide-out-to-top-[3%] data-[state=open]:slide-in-from-top-[3%]",
          className
        )}
      >
        <div className="h-1 shrink-0 bg-gradient-to-r from-primary/80 via-primary to-primary/60" />
        <div className="flex-1 overflow-y-auto">{children}</div>
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-5 z-10 rounded-full p-1.5",
            "bg-muted/80 text-muted-foreground backdrop-blur-sm",
            "transition-all duration-200",
            "hover:bg-muted hover:text-foreground hover:scale-105",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-card"
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);
