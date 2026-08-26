import Tour from '../models/Tour.model.js';
import Property from '../models/Property.model.js';
import User from '../models/User.model.js';

const roundRating = (value) => Number(Number(value).toFixed(1));

export const refreshPropertyRating = async (propertyId) => {
  const tours = await Tour.find({
    propertyId,
    status: 'completed',
    'feedback.propertyRating': { $exists: true, $ne: null }
  }).select('feedback.propertyRating');

  const count = tours.length;
  const average =
    count > 0
      ? roundRating(
          tours.reduce((sum, tour) => sum + tour.feedback.propertyRating, 0) / count
        )
      : 0;

  await Property.findByIdAndUpdate(propertyId, {
    rating: { average, count }
  });

  return { average, count };
};

export const refreshAgentRating = async (agentId) => {
  const tours = await Tour.find({
    agentId,
    status: 'completed',
    'feedback.agentRating': { $exists: true, $ne: null }
  }).select('feedback.agentRating');

  const count = tours.length;
  const average =
    count > 0
      ? roundRating(
          tours.reduce((sum, tour) => sum + tour.feedback.agentRating, 0) / count
        )
      : 0;

  await User.findByIdAndUpdate(agentId, {
    'agentProfile.rating.average': average,
    'agentProfile.rating.count': count
  });

  return { average, count };
};
