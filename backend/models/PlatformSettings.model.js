import mongoose from 'mongoose';
import { DEFAULT_SLOT_PRICE, FREE_GALLERY_COUNT } from '../utils/galleryPricing.js';

const platformSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: 'default',
    },
    gallerySlotPrice: {
      type: Number,
      default: DEFAULT_SLOT_PRICE,
      min: 0,
    },
    advertisementDailyRate: {
      type: Number,
      default: 9.99,
      min: 0,
    },
    sponsoredDailyRate: {
      type: Number,
      default: 19.99,
      min: 0,
    },
    freeGalleryCount: {
      type: Number,
      default: FREE_GALLERY_COUNT,
      min: 0,
    },
    gallerySlotsBackfilled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);

export const getPlatformSettings = async () => {
  let settings = await PlatformSettings.findOne({ key: 'default' });
  if (!settings) {
    settings = await PlatformSettings.create({ key: 'default' });
  }
  return settings;
};

export default PlatformSettings;
