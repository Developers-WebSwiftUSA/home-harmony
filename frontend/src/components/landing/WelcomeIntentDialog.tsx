import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Tag, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "htg-welcome-intent-seen";

const isDashboardPath = (pathname: string) =>
  /^\/(admin|seller|agent|buyer)(\/|$)/.test(pathname);

const isAuthPath = (pathname: string) =>
  pathname === "/login" || pathname === "/forgot-password";

export const WelcomeIntentDialog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen || isDashboardPath(location.pathname) || isAuthPath(location.pathname)) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [location.pathname]);

  const markSeen = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) markSeen();
    else setOpen(true);
  };

  const handleBuy = () => {
    markSeen();
    navigate("/properties");
  };

  const handleSell = () => {
    markSeen();
    if (isAuthenticated && user?.role === "seller") {
      navigate("/seller/listings/new");
      return;
    }
    if (isAuthenticated && user?.role !== "seller") {
      toast.info("Seller accounts are required to list properties.", {
        description: "Contact us and we'll help you get set up as a seller.",
      });
      navigate("/contact");
      return;
    }
    navigate("/login?redirect=/seller/listings/new");
  };

  const handleBrowse = () => {
    markSeen();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden gap-0 border-0 shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background px-6 pt-8 pb-6 sm:px-8">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-2xl font-heading font-bold text-foreground">
              Welcome to House Tour Guide
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Tell us what you&apos;re here for — or close this and browse listings on your own.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 sm:px-8 space-y-3">
          <button
            type="button"
            onClick={handleBuy}
            className={cn(
              "w-full rounded-xl border border-border p-4 text-left transition-all",
              "hover:border-primary hover:bg-primary/5 hover:shadow-md group"
            )}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-foreground">Buy</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Browse homes and commercial properties for sale.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 group-hover:text-primary transition-colors" />
            </div>
          </button>

          <button
            type="button"
            onClick={handleSell}
            className={cn(
              "w-full rounded-xl border border-border p-4 text-left transition-all",
              "hover:border-primary hover:bg-primary/5 hover:shadow-md group"
            )}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-foreground">Sell</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  List your property and reach verified buyers.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 group-hover:text-primary transition-colors" />
            </div>
          </button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={handleBrowse}
          >
            Browse listings without choosing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
