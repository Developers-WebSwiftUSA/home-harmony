export const AD_TYPES = ['advertisement', 'sponsored'];

export const AD_DURATIONS = [7, 14, 30];

export const DAILY_RATES = {
  advertisement: 9.99,
  sponsored: 19.99,
};

export const getDailyRate = (adType) => DAILY_RATES[adType] ?? DAILY_RATES.advertisement;

export const calculateTotalAmount = (adType, durationDays) => {
  const days = Number(durationDays);
  if (!AD_DURATIONS.includes(days)) {
    throw new Error('Invalid campaign duration');
  }
  return Math.round(getDailyRate(adType) * days * 100) / 100;
};

export const getPromotionPriority = (adType) => {
  if (adType === 'sponsored') return 2;
  if (adType === 'advertisement') return 1;
  return 0;
};

export const getPricingCatalog = () => ({
  adTypes: AD_TYPES.map((type) => ({
    type,
    label: type === 'sponsored' ? 'Sponsored' : 'Advertisement',
    description:
      type === 'sponsored'
        ? 'Premium placement with a Sponsored label and top-of-list boost.'
        : 'Standard promotion with an Ad label and visibility boost.',
    dailyRate: getDailyRate(type),
  })),
  durations: AD_DURATIONS.map((days) => ({ days, label: `${days} days` })),
});
