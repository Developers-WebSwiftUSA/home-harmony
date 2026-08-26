import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Megaphone, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { propertyService } from "@/services/property.service";
import { adCampaignService } from "@/services/adCampaign.service";
import { AdType } from "@/features/ads/types/adCampaign.types";
import { formatCurrency } from "@/features/ads/lib/promotionDisplay";
import { Property } from "@/types/models";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "seller" | "agent";
};

export const AdCampaignRequestDialog = ({ open, onOpenChange, role }: Props) => {
  const queryClient = useQueryClient();
  const [propertyId, setPropertyId] = useState("");
  const [adType, setAdType] = useState<AdType>("advertisement");
  const [durationDays, setDurationDays] = useState(7);
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  const { data: pricingData, isLoading: pricingLoading } = useQuery({
    queryKey: ["ad-pricing"],
    queryFn: () => adCampaignService.pricing(),
    enabled: open,
  });

  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: [role === "seller" ? "seller-properties-ads" : "agent-properties-ads"],
    queryFn: () => (role === "seller" ? propertyService.mine() : propertyService.agent()),
    enabled: open,
  });

  const { data: existingCampaignsData } = useQuery({
    queryKey: ["ad-campaigns", role, "eligible-filter"],
    queryFn: () => adCampaignService.list({ limit: 100 }),
    enabled: open,
  });

  const busyPropertyIds = useMemo(() => {
    const ids = new Set<string>();
    (existingCampaignsData?.data || []).forEach((campaign) => {
      if (campaign.status !== "pending" && campaign.status !== "active") return;
      const id =
        typeof campaign.propertyId === "string"
          ? campaign.propertyId
          : campaign.propertyId?._id;
      if (id) ids.add(id);
    });
    return ids;
  }, [existingCampaignsData?.data]);

  const properties = (propertiesData?.data || []).filter(
    (property: Property) => property.status === "active" && !busyPropertyIds.has(property._id)
  );
  const pricing = pricingData?.data;

  const selectedPricing = useMemo(
    () => pricing?.adTypes.find((option) => option.type === adType),
    [pricing, adType]
  );

  const totalAmount = useMemo(() => {
    if (!selectedPricing) return 0;
    return Math.round(selectedPricing.dailyRate * durationDays * 100) / 100;
  }, [selectedPricing, durationDays]);

  const createMutation = useMutation({
    mutationFn: () =>
      adCampaignService.create({
        propertyId,
        adType,
        durationDays,
        cardHolderName,
        cardNumber,
        billingEmail,
        billingAddress: billingAddress || undefined,
      }),
    onSuccess: () => {
      toast.success("Promotion request submitted for admin review");
      queryClient.invalidateQueries({ queryKey: ["ad-campaigns"] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => toast.error(error.message || "Could not submit promotion request"),
  });

  const resetForm = () => {
    setPropertyId("");
    setAdType("advertisement");
    setDurationDays(7);
    setCardHolderName("");
    setCardNumber("");
    setBillingEmail("");
    setBillingAddress("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!propertyId) {
      toast.error("Select a property to promote");
      return;
    }
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) {
      toast.error("Enter a valid card number (13–19 digits)");
      return;
    }
    if (!cardHolderName.trim() || !billingEmail.trim()) {
      toast.error("Cardholder name and billing email are required");
      return;
    }
    createMutation.mutate();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) resetForm();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Request Property Promotion
          </DialogTitle>
          <DialogDescription>
            Choose a listing, promotion type, and payment details. Billing runs only after admin approval.
          </DialogDescription>
        </DialogHeader>

        {pricingLoading || propertiesLoading ? (
          <div className="py-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading promotion options...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Property</label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background"
                required
              >
                <option value="">Select an active listing</option>
                {properties.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.title} · {property.listingType || "sale"}
                  </option>
                ))}
              </select>
              {properties.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  No eligible listings. You need an active listing without a pending or live promotion.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Promotion type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(pricing?.adTypes || []).map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setAdType(option.type)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors",
                      adType === option.type
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <p className="font-medium text-foreground">{option.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                    <p className="text-sm font-semibold text-primary mt-3">
                      {formatCurrency(option.dailyRate)} / day
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Duration</label>
              <div className="flex flex-wrap gap-2">
                {(pricing?.durations || []).map((option) => (
                  <button
                    key={option.days}
                    type="button"
                    onClick={() => setDurationDays(option.days)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm border transition-colors",
                      durationDays === option.days
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Estimated total after approval</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(selectedPricing?.dailyRate || 0)} × {durationDays} days
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
            </div>

            <div className="space-y-4 rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CreditCard className="w-4 h-4 text-primary" />
                Payment details
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Only the last 4 digits are stored. You are charged after admin approval.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Cardholder name</label>
                  <input
                    value={cardHolderName}
                    onChange={(e) => setCardHolderName(e.target.value)}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Card number</label>
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    className="w-full border border-border rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Billing email</label>
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Billing address</label>
                  <input
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || properties.length === 0}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit for review"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
