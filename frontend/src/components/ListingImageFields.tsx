import { useRef } from "react";
import { ImagePlus, Lock, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolvePropertyImageUrl } from "@/lib/propertyImage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/features/ads/lib/promotionDisplay";
import {
  FREE_GALLERY_COUNT,
  MAX_TOTAL_IMAGES,
  getGallerySlotState,
  getLockedGalleryCount,
} from "@/features/gallery-slots/lib/gallerySlots";

export type ListingImageDraft = {
  id: string;
  previewUrl: string;
  file?: File;
  remoteUrl?: string;
  isPrimary: boolean;
};

type PropertyImageInput = { url?: string; isPrimary?: boolean };

const MAX_IMAGES = MAX_TOTAL_IMAGES;
const MAX_BYTES = 5 * 1024 * 1024;

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const isAllowedImage = (file: File) => file.type.startsWith("image/");

const createDraftFromFile = (file: File, isPrimary: boolean): ListingImageDraft => ({
  id: makeId(),
  previewUrl: URL.createObjectURL(file),
  file,
  isPrimary,
});

const revokeIfBlob = (url?: string) => {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
};

export const draftsFromPropertyImages = (
  images?: PropertyImageInput[] | null
): ListingImageDraft[] => {
  const list = (images || []).filter((item) => item.url?.trim());
  const hasPrimary = list.some((item) => item.isPrimary);
  return list.map((item, index) => ({
    id: `existing-${index}-${item.url}`,
    previewUrl: resolvePropertyImageUrl(item.url) || item.url!,
    remoteUrl: item.url,
    isPrimary: hasPrimary ? Boolean(item.isPrimary) : index === 0,
  }));
};

type Props = {
  images: ListingImageDraft[];
  onChange: (images: ListingImageDraft[]) => void;
  disabled?: boolean;
  paidGallerySlots?: number;
  pricePerSlot?: number;
  canPay?: boolean;
  pendingPurchase?: boolean;
  onPayToGo?: () => void;
};

export const ListingImageFields = ({
  images,
  onChange,
  disabled,
  paidGallerySlots = 0,
  pricePerSlot,
  canPay = false,
  pendingPurchase = false,
  onPayToGo,
}: Props) => {
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const primary = images.find((item) => item.isPrimary) || images[0] || null;
  const gallery = images.filter((item) => item.id !== primary?.id);
  const lockedCount = getLockedGalleryCount(gallery.length, paidGallerySlots);

  const applyFiles = (files: File[], asPrimary: boolean) => {
    const valid: File[] = [];
    files.forEach((file) => {
      if (!isAllowedImage(file)) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} is larger than 5MB`);
        return;
      }
      valid.push(file);
    });
    if (!valid.length) return;

    let next = [...images];
    if (asPrimary) {
      const [mainFile, ...extra] = valid;
      const newMain = createDraftFromFile(mainFile, true);
      if (primary) {
        next = next.map((item) =>
          item.id === primary.id ? { ...item, isPrimary: false } : item
        );
      } else {
        next = next.map((item) => ({ ...item, isPrimary: false }));
      }
      next = [newMain, ...next];
      extra.forEach((file) => next.push(createDraftFromFile(file, false)));
    } else {
      if (!primary) {
        const [mainFile, ...extra] = valid;
        next = [createDraftFromFile(mainFile, true), ...extra.map((file) => createDraftFromFile(file, false))];
      } else {
        valid.forEach((file) => next.push(createDraftFromFile(file, false)));
      }
    }

    if (next.length > MAX_IMAGES) {
      const overflow = next.slice(MAX_IMAGES);
      overflow.forEach((item) => revokeIfBlob(item.previewUrl));
      next = next.slice(0, MAX_IMAGES);
      toast.error(`You can add up to ${MAX_IMAGES} photos`);
    }

    if (!next.some((item) => item.isPrimary) && next[0]) {
      next[0] = { ...next[0], isPrimary: true };
    }

    onChange(next);
  };

  const removeImage = (id: string) => {
    const target = images.find((item) => item.id === id);
    revokeIfBlob(target?.previewUrl);
    let next = images.filter((item) => item.id !== id);
    if (target?.isPrimary && next[0]) {
      next = next.map((item, index) => ({ ...item, isPrimary: index === 0 }));
    }
    onChange(next);
  };

  const setAsMain = (id: string) => {
    onChange(images.map((item) => ({ ...item, isPrimary: item.id === id })));
  };

  return (
    <div className="space-y-5 p-4 bg-muted/50 rounded-xl border border-border">
      <div>
        <h2 className="text-sm font-heading font-semibold text-foreground">Property photos</h2>
        <p className="text-xs text-muted-foreground mt-1">
          The main photo is always free. The first {FREE_GALLERY_COUNT} gallery photos are free.
          Extra gallery photos use Pay to Go and stay private until payment is approved.
        </p>
      </div>

      {lockedCount > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              {lockedCount} extra photo{lockedCount === 1 ? "" : "s"} need Pay to Go
            </p>
            <p className="text-xs text-amber-800 mt-0.5">
              {pendingPurchase
                ? "A payment request is waiting for admin approval. Extra photos will go live after approval."
                : canPay
                  ? `Unlock extra gallery photos${pricePerSlot != null ? ` for ${formatCurrency(pricePerSlot)} each` : ""}.`
                  : "Save this listing first, then unlock extra photos with Pay to Go."}
            </p>
          </div>
          {pendingPurchase ? null : (
            <Button
              type="button"
              size="sm"
              className="flex-shrink-0"
              disabled={disabled || !canPay}
              onClick={() => {
                if (!canPay) {
                  toast.error("Save the listing first, then unlock extra photos");
                  return;
                }
                onPayToGo?.();
              }}
            >
              Pay to Go
            </Button>
          )}
        </div>
      ) : null}

      <div>
        <label className="text-xs text-muted-foreground block mb-2">Main image</label>
        <div className="rounded-xl border border-dashed border-border bg-background overflow-hidden">
          {primary ? (
            <div className="relative">
              <img
                src={primary.previewUrl}
                alt="Main property"
                className="w-full max-h-72 object-cover"
              />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[11px] font-medium bg-primary text-primary-foreground px-2 py-1 rounded-full">
                <Star className="w-3 h-3 fill-current" /> Main
              </span>
            </div>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => mainInputRef.current?.click()}
              className="w-full h-44 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:bg-muted/40 transition-colors"
            >
              <ImagePlus className="w-8 h-8" />
              <span className="text-sm font-medium">Choose a main photo</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => mainInputRef.current?.click()}
          >
            {primary ? "Replace main image" : "Add main image"}
          </Button>
          {primary ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={disabled}
              onClick={() => removeImage(primary.id)}
            >
              Remove main
            </Button>
          ) : null}
        </div>
        <input
          ref={mainInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            event.target.value = "";
            applyFiles(files, true);
          }}
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-2">Image gallery</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {gallery.map((item, index) => {
            const slotState = getGallerySlotState(index, paidGallerySlots);
            return (
            <div key={item.id} className="relative group rounded-lg overflow-hidden border border-border bg-background">
              <img src={item.previewUrl} alt="Gallery" className="w-full h-28 object-cover" />
              {slotState === "locked" ? (
                <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white text-[11px] font-medium gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Pay to Go
                </div>
              ) : (
                <span
                  className={cn(
                    "absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                    slotState === "paid"
                      ? "bg-sky-600 text-white"
                      : "bg-card/90 text-foreground"
                  )}
                >
                  {slotState === "paid" ? "Paid" : "Free"}
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors" />
              <div className="absolute top-1.5 right-1.5 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  title="Set as main image"
                  disabled={disabled}
                  onClick={() => setAsMain(item.id)}
                  className={cn(
                    "w-7 h-7 rounded-full bg-card text-foreground flex items-center justify-center hover:text-primary"
                  )}
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Remove photo"
                  disabled={disabled}
                  onClick={() => removeImage(item.id)}
                  className="w-7 h-7 rounded-full bg-card text-destructive flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            );
          })}
          <button
            type="button"
            disabled={disabled || images.length >= MAX_IMAGES}
            onClick={() => galleryInputRef.current?.click()}
            className="h-28 rounded-lg border border-dashed border-border bg-background flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-50"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-xs font-medium">Add photos</span>
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          {images.length}/{MAX_IMAGES} photos · JPG, PNG, or WebP · first {FREE_GALLERY_COUNT} gallery photos free
        </p>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            event.target.value = "";
            applyFiles(files, false);
          }}
        />
      </div>
    </div>
  );
};
