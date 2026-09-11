export const FREE_MAIN_COUNT = 1;
export const FREE_GALLERY_COUNT = 3;
export const MAX_TOTAL_IMAGES = 50;

export type GallerySlotState = "free" | "paid" | "locked";

export const getAllowedGalleryCount = (paidGallerySlots = 0) =>
  FREE_GALLERY_COUNT + Math.max(0, Number(paidGallerySlots) || 0);

export const getLockedGalleryCount = (galleryCount: number, paidGallerySlots = 0) =>
  Math.max(0, galleryCount - getAllowedGalleryCount(paidGallerySlots));

export const getGallerySlotState = (
  galleryIndex: number,
  paidGallerySlots = 0
): GallerySlotState => {
  if (galleryIndex < FREE_GALLERY_COUNT) return "free";
  if (galleryIndex < getAllowedGalleryCount(paidGallerySlots)) return "paid";
  return "locked";
};
