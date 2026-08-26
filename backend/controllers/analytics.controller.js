import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.model.js';
import Property from '../models/Property.model.js';
import Tour from '../models/Tour.model.js';
import PropertyView from '../models/PropertyView.model.js';
import Conversation from '../models/Conversation.model.js';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getRecentMonths = (count = 6) => {
  const months = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      label: MONTH_LABELS[date.getMonth()],
      start: new Date(date.getFullYear(), date.getMonth(), 1),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999),
    });
  }
  return months;
};

const percentChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const countInRange = async (model, query, start, end, dateField = 'createdAt') => {
  return model.countDocuments({
    ...query,
    [dateField]: { $gte: start, $lte: end },
  });
};

const getViewsByMonth = async (propertyIds, months) => {
  if (!propertyIds.length) {
    return months.map((m) => ({ month: m.label, views: 0 }));
  }

  const results = await Promise.all(
    months.map((m) =>
      PropertyView.countDocuments({
        propertyId: { $in: propertyIds },
        viewedAt: { $gte: m.start, $lte: m.end },
      })
    )
  );

  return months.map((m, index) => ({
    month: m.label,
    views: results[index],
  }));
};

// @desc    Admin platform analytics
// @route   GET /api/analytics/admin
// @access  Private/Admin
export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const months = getRecentMonths(6);
  const currentMonth = months[months.length - 1];
  const previousMonth = months[months.length - 2];

  const [
    totalUsers,
    totalProperties,
    activeProperties,
    pendingProperties,
    totalTours,
    confirmedTours,
    completedTours,
    totalReviews,
    totalViews,
    totalInquiries,
    usersByRole,
  ] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments(),
    Property.countDocuments({ status: 'active' }),
    Property.countDocuments({ status: 'pending' }),
    Tour.countDocuments(),
    Tour.countDocuments({ status: 'confirmed' }),
    Tour.countDocuments({ status: 'completed' }),
    Tour.countDocuments({ 'feedback.propertyRating': { $exists: true, $ne: null } }),
    Property.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Property.aggregate([{ $group: { _id: null, total: { $sum: '$inquiries' } } }]),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
  ]);

  const newUsersCurrent = await countInRange(User, {}, currentMonth.start, currentMonth.end);
  const newUsersPrevious = await countInRange(User, {}, previousMonth.start, previousMonth.end);
  const newPropertiesCurrent = await countInRange(Property, {}, currentMonth.start, currentMonth.end);
  const newPropertiesPrevious = await countInRange(Property, {}, previousMonth.start, previousMonth.end);
  const newToursCurrent = await countInRange(Tour, {}, currentMonth.start, currentMonth.end);
  const newToursPrevious = await countInRange(Tour, {}, previousMonth.start, previousMonth.end);

  const usersByMonth = await Promise.all(
    months.map((m) => countInRange(User, {}, m.start, m.end))
  );
  const propertiesByMonth = await Promise.all(
    months.map((m) => countInRange(Property, {}, m.start, m.end))
  );
  const toursByMonth = await Promise.all(
    months.map((m) => countInRange(Tour, {}, m.start, m.end))
  );

  const topProperties = await Property.find()
    .sort({ views: -1 })
    .limit(5)
    .select('title views inquiries price status')
    .populate('sellerId', 'firstName lastName email');

  const roleMap = usersByRole.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      overview: [
        {
          label: 'Total Users',
          value: totalUsers,
          change: percentChange(newUsersCurrent, newUsersPrevious),
        },
        {
          label: 'Active Listings',
          value: activeProperties,
          change: percentChange(newPropertiesCurrent, newPropertiesPrevious),
        },
        {
          label: 'Scheduled Tours',
          value: totalTours,
          change: percentChange(newToursCurrent, newToursPrevious),
        },
        {
          label: 'Tour Reviews',
          value: totalReviews,
          change: 0,
        },
      ],
      totals: {
        users: totalUsers,
        properties: totalProperties,
        activeProperties,
        pendingProperties,
        tours: totalTours,
        confirmedTours,
        completedTours,
        reviews: totalReviews,
        views: totalViews[0]?.total || 0,
        inquiries: totalInquiries[0]?.total || 0,
      },
      usersByRole: roleMap,
      growthByMonth: months.map((m, i) => ({
        month: m.label,
        users: usersByMonth[i],
        properties: propertiesByMonth[i],
        tours: toursByMonth[i],
      })),
      topProperties: topProperties.map((p) => ({
        id: p._id,
        name: p.title,
        views: p.views || 0,
        inquiries: p.inquiries || 0,
        conversion: p.views ? `${((p.inquiries / p.views) * 100).toFixed(1)}%` : '0%',
        price: p.price,
        status: p.status,
        seller: p.sellerId
          ? `${p.sellerId.firstName || ''} ${p.sellerId.lastName || ''}`.trim() || p.sellerId.email
          : '—',
      })),
    },
  });
});

// @desc    Seller analytics
// @route   GET /api/analytics/seller
// @access  Private/Seller
export const getSellerAnalytics = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  const months = getRecentMonths(5);
  const currentMonth = months[months.length - 1];
  const previousMonth = months[months.length - 2];

  const properties = await Property.find({ sellerId }).select(
    'title views inquiries price status createdAt'
  );
  const propertyIds = properties.map((p) => p._id);

  const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalInquiries = properties.reduce((sum, p) => sum + (p.inquiries || 0), 0);
  const avgPrice =
    properties.length > 0
      ? properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length
      : 0;

  const [tourCount, toursCurrent, toursPrevious, messageConversations] = await Promise.all([
    Tour.countDocuments({ sellerId }),
    countInRange(Tour, { sellerId }, currentMonth.start, currentMonth.end),
    countInRange(Tour, { sellerId }, previousMonth.start, previousMonth.end),
    propertyIds.length
      ? Conversation.countDocuments({ propertyId: { $in: propertyIds } })
      : 0,
  ]);

  const viewsCurrent = propertyIds.length
    ? await PropertyView.countDocuments({
        propertyId: { $in: propertyIds },
        viewedAt: { $gte: currentMonth.start, $lte: currentMonth.end },
      })
    : 0;
  const viewsPrevious = propertyIds.length
    ? await PropertyView.countDocuments({
        propertyId: { $in: propertyIds },
        viewedAt: { $gte: previousMonth.start, $lte: previousMonth.end },
      })
    : 0;

  const viewsByMonth = await getViewsByMonth(propertyIds, months);

  const topProperties = [...properties]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map((p) => ({
      id: p._id,
      name: p.title,
      views: p.views || 0,
      inquiries: p.inquiries || 0,
      conversion: p.views ? `${((p.inquiries / p.views) * 100).toFixed(1)}%` : '0%',
    }));

  const inquiryTotal = totalInquiries + tourCount + messageConversations;
  const inquiriesBySource = [
    {
      source: 'Property Inquiries',
      count: totalInquiries,
      percentage: inquiryTotal ? Math.round((totalInquiries / inquiryTotal) * 100) : 0,
    },
    {
      source: 'Tour Requests',
      count: tourCount,
      percentage: inquiryTotal ? Math.round((tourCount / inquiryTotal) * 100) : 0,
    },
    {
      source: 'Messages',
      count: messageConversations,
      percentage: inquiryTotal ? Math.round((messageConversations / inquiryTotal) * 100) : 0,
    },
  ].filter((item) => item.count > 0);

  res.status(200).json({
    success: true,
    data: {
      overview: [
        {
          label: 'Total Views',
          value: totalViews,
          change: percentChange(viewsCurrent, viewsPrevious),
        },
        {
          label: 'Inquiries',
          value: totalInquiries,
          change: 0,
        },
        {
          label: 'Tour Requests',
          value: tourCount,
          change: percentChange(toursCurrent, toursPrevious),
        },
        {
          label: 'Avg. Price',
          value: avgPrice,
          change: 0,
          formatted: `$${Math.round(avgPrice / 1000)}K`,
        },
      ],
      viewsByMonth,
      topProperties,
      inquiriesBySource:
        inquiriesBySource.length > 0
          ? inquiriesBySource
          : [{ source: 'No activity yet', count: 0, percentage: 0 }],
      listingBreakdown: {
        active: properties.filter((p) => p.status === 'active').length,
        pending: properties.filter((p) => p.status === 'pending').length,
        sold: properties.filter((p) => p.status === 'sold').length,
        rented: properties.filter((p) => p.status === 'rented').length,
      },
    },
  });
});

// @desc    Agent performance analytics
// @route   GET /api/analytics/agent
// @access  Private/Agent
export const getAgentAnalytics = asyncHandler(async (req, res) => {
  const agentId = req.user.id;
  const months = getRecentMonths(5);

  const [tours, assignedProperties, reviews] = await Promise.all([
    Tour.find({ agentId }).select('status date feedback createdAt'),
    Property.countDocuments({ agentId }),
    Tour.countDocuments({
      agentId,
      'feedback.agentRating': { $exists: true, $ne: null },
    }),
  ]);

  const pending = tours.filter((t) => t.status === 'pending').length;
  const confirmed = tours.filter((t) => t.status === 'confirmed').length;
  const completed = tours.filter((t) => t.status === 'completed').length;
  const cancelled = tours.filter((t) => t.status === 'cancelled' || t.status === 'declined').length;

  const agentReviews = tours.filter((t) => t.feedback?.agentRating);
  const averageRating =
    agentReviews.length > 0
      ? Number(
          (
            agentReviews.reduce((sum, t) => sum + (t.feedback?.agentRating || 0), 0) /
            agentReviews.length
          ).toFixed(1)
        )
      : 0;

  const toursByMonth = await Promise.all(
    months.map((m) =>
      Tour.countDocuments({
        agentId,
        createdAt: { $gte: m.start, $lte: m.end },
      })
    )
  );

  res.status(200).json({
    success: true,
    data: {
      overview: [
        { label: 'Assigned Properties', value: assignedProperties },
        { label: 'Pending Tours', value: pending },
        { label: 'Confirmed Tours', value: confirmed },
        { label: 'Completed Tours', value: completed },
      ],
      totals: {
        tours: tours.length,
        pending,
        confirmed,
        completed,
        cancelled,
        reviews,
        averageRating,
      },
      toursByMonth: months.map((m, i) => ({
        month: m.label,
        tours: toursByMonth[i],
      })),
    },
  });
});
