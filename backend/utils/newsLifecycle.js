import News from '../models/News.model.js';

export const activateScheduledNews = async () => {
  const now = new Date();
  const result = await News.updateMany(
    {
      status: 'scheduled',
      publishedAt: { $lte: now },
    },
    { $set: { status: 'active' } }
  );
  return result.modifiedCount || 0;
};
