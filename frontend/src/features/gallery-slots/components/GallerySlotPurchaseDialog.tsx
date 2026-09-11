import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Images, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { gallerySlotService } from "@/services/gallerySlot.service";
import { formatCurrency } from "@/features/ads/lib/promotionDisplay";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId?: string;
  propertyTitle?: string;
  lockedCount: number;
};

export const GallerySlotPurchaseDialog = ({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
  lockedCount,
}: Props) => {
  const queryClient = useQueryClient();
  const [slotsRequested, setSlotsRequested] = useState(Math.max(1, lockedCount));
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  const { data: pricingData, isLoading: pricingLoading } = useQuery({
    queryKey: ["gallery-slot-pricing"],
    queryFn: () => gallerySlotService.pricing(),
    enabled: open,
  });

  const pricing = pricingData?.data;
  const pricePerSlot = pricing?.pricePerSlot || 0;
  const totalAmount = useMemo(
    () => Math.round(slotsRequested * pricePerSlot * 100) / 100,
    [slotsRequested, pricePerSlot]
  );

  useEffect(() => {
    if (open) setSlotsRequested(Math.max(1, lockedCount));
  }, [open, lockedCount]);

  const resetForm = () => {
    setCardHolderName("");
    setCardNumber("");
    setBillingEmail("");
    setBillingAddress("");
    setSlotsRequested(Math.max(1, lockedCount));
  };

  const createMutation = useMutation({
    mutationFn: () =>
      gallerySlotService.create({
        propertyId: propertyId || "",
        slotsRequested,
        cardHolderName,
        cardNumber,
        billingEmail,
        billingAddress: billingAddress || undefined,
      }),
    onSuccess: () => {
      toast.success("Pay to Go request submitted for admin review");
      queryClient.invalidateQueries({ queryKey: ["gallery-slot-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["seller-listing"] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => toast.error(error.message || "Could not submit Pay to Go request"),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!propertyId) {
      toast.error("Save the listing first, then unlock extra photos");
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Images className="w-5 h-5 text-primary" />
            Pay to Go — extra gallery photos
          </DialogTitle>
          <DialogDescription>
            The main photo and the first 3 gallery photos are free. Extra photos stay private until
            admin approves this payment.
          </DialogDescription>
        </DialogHeader>

        {pricingLoading ? (
          <div className="py-10 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading pricing...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium text-foreground">{propertyTitle || "This listing"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {lockedCount > 0
                  ? `${lockedCount} extra photo${lockedCount === 1 ? "" : "s"} currently locked.`
                  : "Buy extra slots to publish more gallery photos later."}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Extra photo slots
              </label>
              <input
                type="number"
                min={Math.max(1, lockedCount)}
                value={slotsRequested}
                onChange={(e) => setSlotsRequested(Math.max(1, Number(e.target.value) || 1))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                {formatCurrency(pricePerSlot)} per extra gallery photo
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Total after approval</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {slotsRequested} × {formatCurrency(pricePerSlot)}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <Button type="submit" disabled={createMutation.isPending || !propertyId}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Pay to Go"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
