import User from '../models/User.model.js';

export const emitPendingActionsUpdated = (io, ...userIds) => {
  if (!io) return;
  userIds
    .flat()
    .filter(Boolean)
    .forEach((id) => {
      io.to(`user-${id}`).emit("pending-actions-updated");
    });
};

export const emitPendingActionsUpdatedForAdmins = async (io) => {
  if (!io) return;
  const admins = await User.find({ role: 'admin', status: 'active' }).select('_id');
  emitPendingActionsUpdated(io, admins.map((admin) => admin._id));
};
