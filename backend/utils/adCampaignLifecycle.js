import AdCampaign from '../models/AdCampaign.model.js';
import Property from '../models/Property.model.js';

export const expireAdCampaigns = async () => {
  const now = new Date();
  const expiredCampaigns = await AdCampaign.find({
    status: 'active',
    endDate: { $lte: now },
  });

  if (!expiredCampaigns.length) return 0;

  const propertyIds = expiredCampaigns.map((campaign) => campaign.propertyId);

  await AdCampaign.updateMany(
    { _id: { $in: expiredCampaigns.map((campaign) => campaign._id) } },
    { $set: { status: 'expired' } }
  );

  await Property.updateMany(
    { _id: { $in: propertyIds } },
    {
      $set: { promotionPriority: 0, featured: false },
      $unset: { promotion: '' },
    }
  );

  return expiredCampaigns.length;
};

export const applyCampaignToProperty = async (campaign) => {
  const priority = campaign.adType === 'sponsored' ? 2 : 1;
  await Property.findByIdAndUpdate(campaign.propertyId, {
    promotion: {
      type: campaign.adType,
      campaignId: campaign._id,
      expiresAt: campaign.endDate,
    },
    promotionPriority: priority,
    featured: campaign.adType === 'sponsored',
  });
};

export const clearPropertyPromotion = async (propertyId) => {
  await Property.findByIdAndUpdate(propertyId, {
    $set: { promotionPriority: 0, featured: false },
    $unset: { promotion: '' },
  });
};
