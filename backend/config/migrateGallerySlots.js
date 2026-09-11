import Property from '../models/Property.model.js';
import { getPlatformSettings } from '../models/PlatformSettings.model.js';
import { FREE_GALLERY_COUNT, splitImages } from '../utils/galleryPricing.js';

export const migrateGallerySlotAllowance = async () => {
  const settings = await getPlatformSettings();
  if (settings.gallerySlotsBackfilled) return;

  const properties = await Property.find({
    $or: [{ paidGallerySlots: { $exists: false } }, { paidGallerySlots: 0 }],
    'images.3': { $exists: true },
  }).select('images paidGallerySlots');

  let updated = 0;
  for (const property of properties) {
    const { gallery } = splitImages(property.images);
    const extras = Math.max(0, gallery.length - FREE_GALLERY_COUNT);
    if (!extras) continue;
    property.paidGallerySlots = extras;
    await property.save();
    updated += 1;
  }

  settings.gallerySlotsBackfilled = true;
  await settings.save();

  if (updated) {
    console.log(`Backfilled paid gallery slots on ${updated} existing listing(s)`);
  }
};
