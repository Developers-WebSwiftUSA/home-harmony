import asyncHandler from '../middleware/asyncHandler.js';
import { getPlatformSettings } from '../models/PlatformSettings.model.js';
import { FREE_GALLERY_COUNT, FREE_MAIN_COUNT } from '../utils/galleryPricing.js';
import { AD_DURATIONS } from '../utils/adPricing.js';

const roundMoney = (value, label) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    const error = new Error(`Enter a valid ${label}`);
    error.statusCode = 400;
    throw error;
  }
  return Math.round(amount * 100) / 100;
};

const moneyOrDefault = (value, fallback) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : fallback;
};

export const serializePlatformPricing = (settings) => ({
  gallerySlotPrice: moneyOrDefault(settings.gallerySlotPrice, 0),
  advertisementDailyRate: moneyOrDefault(settings.advertisementDailyRate, 9.99),
  sponsoredDailyRate: moneyOrDefault(settings.sponsoredDailyRate, 19.99),
  freeMainCount: FREE_MAIN_COUNT,
  freeGalleryCount: FREE_GALLERY_COUNT,
  adDurations: AD_DURATIONS,
});

export const getPlatformPricing = asyncHandler(async (req, res) => {
  const settings = await getPlatformSettings();
  res.status(200).json({ success: true, data: serializePlatformPricing(settings) });
});

export const updatePlatformPricing = asyncHandler(async (req, res) => {
  const settings = await getPlatformSettings();
  try {
    if (req.body.gallerySlotPrice != null) {
      settings.gallerySlotPrice = roundMoney(req.body.gallerySlotPrice, 'extra photo price');
    }
    if (req.body.advertisementDailyRate != null) {
      settings.advertisementDailyRate = roundMoney(req.body.advertisementDailyRate, 'advertisement daily rate');
    }
    if (req.body.sponsoredDailyRate != null) {
      settings.sponsoredDailyRate = roundMoney(req.body.sponsoredDailyRate, 'sponsored daily rate');
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  await settings.save();
  res.status(200).json({ success: true, data: serializePlatformPricing(settings) });
});
