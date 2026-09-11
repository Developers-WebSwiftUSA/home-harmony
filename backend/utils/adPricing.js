import { getPlatformSettings } from '../models/PlatformSettings.model.js';

export const AD_TYPES = ['advertisement', 'sponsored'];

export const AD_DURATIONS = [7, 14, 30];

export const DEFAULT_DAILY_RATES = {
  advertisement: 9.99,
  sponsored: 19.99,
};

const rateFromSettings = (settings, adType) => {
  if (adType === 'sponsored') return Number(settings.sponsoredDailyRate);
  return Number(settings.advertisementDailyRate);
};

export const getDailyRate = async (adType) => {
  const settings = await getPlatformSettings();
  const rate = rateFromSettings(settings, adType);
  return Number.isFinite(rate) && rate >= 0 ? rate : DEFAULT_DAILY_RATES[adType] ?? DEFAULT_DAILY_RATES.advertisement;
};

export const calculateTotalAmount = async (adType, durationDays) => {
  const days = Number(durationDays);
  if (!AD_DURATIONS.includes(days)) {
    throw new Error('Invalid campaign duration');
  }
  const dailyRate = await getDailyRate(adType);
  return Math.round(dailyRate * days * 100) / 100;
};

export const getPromotionPriority = (adType) => {
  if (adType === 'sponsored') return 2;
  if (adType === 'advertisement') return 1;
  return 0;
};

export const getPricingCatalog = async () => {
  const settings = await getPlatformSettings();
  return {
    adTypes: AD_TYPES.map((type) => ({
      type,
      label: type === 'sponsored' ? 'Sponsored' : 'Advertisement',
      description:
        type === 'sponsored'
          ? 'Premium placement with a Sponsored label and top-of-list boost.'
          : 'Standard promotion with an Ad label and visibility boost.',
      dailyRate: rateFromSettings(settings, type),
    })),
    durations: AD_DURATIONS.map((days) => ({ days, label: `${days} days` })),
  };
};
