import asyncHandler from '../middleware/asyncHandler.js';
import Notification from '../models/Notification.model.js';

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const { isRead, type, page = 1, limit = 20 } = req.query;

  const query = { userId: req.user.id };

  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }
  if (type) {
    query.type = type;
  }

  const notifications = await Notification.find(query)
    .populate('relatedId')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    userId: req.user.id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  if (notification.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      userId: req.user.id,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  if (notification.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted'
  });
});
