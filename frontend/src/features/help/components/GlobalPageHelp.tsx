import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getHelpForRoute } from "@/features/help/lib/helpRoutes";
import { USER_GUIDE_EVENT } from "@/features/help/lib/openUserGuide";
import { PageHelpButton, PageHelpDialog } from "@/features/help/components/PageHelpDialog";

const WELCOME_SEEN_KEY = "htg-welcome-intent-seen";

/** Floating User Guide control shown on every page — opens a contextual manual. */
export const GlobalPageHelp = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const manual = getHelpForRoute(location.pathname);

  const welcomePending =
    location.pathname === "/" && !localStorage.getItem(WELCOME_SEEN_KEY);

  useEffect(() => {
    const onOpen = () => {
      const welcomeOpen =
        location.pathname === "/" && !localStorage.getItem(WELCOME_SEEN_KEY);
      if (welcomeOpen) return;
      setOpen(true);
    };
    window.addEventListener(USER_GUIDE_EVENT, onOpen);
    return () => window.removeEventListener(USER_GUIDE_EVENT, onOpen);
  }, [location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      {welcomePending || open ? null : <PageHelpButton onClick={() => setOpen(true)} />}
      <PageHelpDialog open={open} onOpenChange={setOpen} manual={manual} />
    </>
  );
};
