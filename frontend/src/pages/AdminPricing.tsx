import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Images, Loader2, Megaphone, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardSidebar } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { platformSettingsService } from "@/services/platformSettings.service";
import { formatCurrency } from "@/features/ads/lib/promotionDisplay";
import { toast } from "sonner";

const AdminPricing = () => {
  const queryClient = useQueryClient();
  const [gallerySlotPrice, setGallerySlotPrice] = useState("");
  const [advertisementDailyRate, setAdvertisementDailyRate] = useState("");
  const [sponsoredDailyRate, setSponsoredDailyRate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["platform-pricing"],
    queryFn: () => platformSettingsService.getPricing(),
  });

  const pricing = data?.data;

  useEffect(() => {
    if (!pricing) return;
    setGallerySlotPrice(String(pricing.gallerySlotPrice));
    setAdvertisementDailyRate(String(pricing.advertisementDailyRate));
    setSponsoredDailyRate(String(pricing.sponsoredDailyRate));
  }, [pricing]);

  const saveMutation = useMutation({
    mutationFn: () =>
      platformSettingsService.updatePricing({
        gallerySlotPrice: Number(gallerySlotPrice),
        advertisementDailyRate: Number(advertisementDailyRate),
        sponsoredDailyRate: Number(sponsoredDailyRate),
      }),
    onSuccess: (response) => {
      toast.success("Pricing updated");
      queryClient.setQueryData(["platform-pricing"], response);
      queryClient.invalidateQueries({ queryKey: ["gallery-slot-pricing"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-slot-settings"] });
      queryClient.invalidateQueries({ queryKey: ["ad-pricing"] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not update pricing"),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Pricing" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            Pricing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set rates for extra gallery photos and listing promotions. Billing and approvals stay on
            their own pages.
          </p>
        </div>

        {isLoading || !pricing ? (
          <div className="py-16 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading pricing...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
            <section className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
                    <Images className="w-5 h-5 text-primary" />
                    Extra gallery photos
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    The main photo and the first {pricing.freeGalleryCount} gallery photos are free.
                    This rate applies to each extra photo.
                  </p>
                </div>
                <Link to="/admin/gallery-photos" className="text-xs text-primary hover:underline flex-shrink-0">
                  Open approvals
                </Link>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Price per extra gallery photo
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gallerySlotPrice}
                  onChange={(e) => setGallerySlotPrice(e.target.value)}
                  className="w-full max-w-xs border border-border rounded-md px-3 py-2.5 text-sm bg-background"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Current: {formatCurrency(pricing.gallerySlotPrice)}
                </p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    Ad campaigns
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Daily rates for Advertisement and Sponsored promotions. Totals use the selected
                    duration ({pricing.adDurations.join(", ")} days).
                  </p>
                </div>
                <Link to="/admin/ad-campaigns" className="text-xs text-primary hover:underline flex-shrink-0">
                  Open approvals
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Advertisement — per day
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={advertisementDailyRate}
                    onChange={(e) => setAdvertisementDailyRate(e.target.value)}
                    className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Current: {formatCurrency(pricing.advertisementDailyRate)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Sponsored — per day
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={sponsoredDailyRate}
                    onChange={(e) => setSponsoredDailyRate(e.target.value)}
                    className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Current: {formatCurrency(pricing.sponsoredDailyRate)}
                  </p>
                </div>
              </div>
            </section>

            <Button type="submit" className="gap-2" disabled={saveMutation.isPending}>
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "Saving..." : "Save pricing"}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
};

export default AdminPricing;
