import { useState } from "react";
import { useLocation } from "react-router-dom";
import { getHelpForRoute } from "@/features/help/lib/helpRoutes";
import { PageHelpButton, PageHelpDialog } from "@/features/help/components/PageHelpDialog";

const WELCOME_SEEN_KEY = "htg-welcome-intent-seen";

/** Floating help button shown on every page — opens a contextual manual. */
export const GlobalPageHelp = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const manual = getHelpForRoute(location.pathname);

  const welcomePending =
    location.pathname === "/" && !localStorage.getItem(WELCOME_SEEN_KEY);

  if (welcomePending) return null;

  return (
    <>
      <PageHelpButton onClick={() => setOpen(true)} />
      <PageHelpDialog open={open} onOpenChange={setOpen} manual={manual} />
    </>
  );
};
