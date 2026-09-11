export const FREE_MAIN_COUNT = 1;
export const FREE_GALLERY_COUNT = 3;
export const DEFAULT_SLOT_PRICE = 4.99;
export const MAX_TOTAL_IMAGES = 50;

export const normalizeImages = (images = []) => {
  if (!Array.isArray(images)) return [];
  return images
    .map((item) => (typeof item === 'string' ? { url: item } : item))
    .filter((item) => Boolean(item?.url?.trim?.() || item?.url));
};

export const splitImages = (images = []) => {
  const list = normalizeImages(images);
  const primary = list.find((item) => item.isPrimary) || list[0] || null;
  const gallery = list.filter((item) => item !== primary);
  return { primary, gallery, all: primary ? [primary, ...gallery] : gallery };
};

export const getAllowedGalleryCount = (paidGallerySlots = 0) =>
  FREE_GALLERY_COUNT + Math.max(0, Number(paidGallerySlots) || 0);

export const getAllowedImageCount = (paidGallerySlots = 0) =>
  FREE_MAIN_COUNT + getAllowedGalleryCount(paidGallerySlots);

export const getLockedGalleryCount = (images, paidGallerySlots = 0) => {
  const { gallery } = splitImages(images);
  return Math.max(0, gallery.length - getAllowedGalleryCount(paidGallerySlots));
};

export const limitImagesForPublic = (images, paidGallerySlots = 0) => {
  const { primary, gallery } = splitImages(images);
  const allowed = gallery.slice(0, getAllowedGalleryCount(paidGallerySlots));
  return primary ? [primary, ...allowed] : allowed;
};

export const calculateSlotTotal = (slots, pricePerSlot) => {
  const count = Math.max(0, Math.floor(Number(slots) || 0));
  const price = Number(pricePerSlot);
  if (count < 1) {
    const error = new Error('Select at least one extra photo slot');
    error.statusCode = 400;
    throw error;
  }
  if (!(price >= 0)) {
    const error = new Error('Invalid extra photo price');
    error.statusCode = 400;
    throw error;
  }
  return Math.round(count * price * 100) / 100;
};

export const getGallerySlotState = (galleryIndex, paidGallerySlots = 0) => {
  if (galleryIndex < FREE_GALLERY_COUNT) return 'free';
  if (galleryIndex < getAllowedGalleryCount(paidGallerySlots)) return 'paid';
  return 'locked';
};
