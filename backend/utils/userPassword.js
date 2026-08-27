import crypto from 'crypto';
import User from '../models/User.model.js';

export const generateTemporaryPassword = () => crypto.randomBytes(8).toString('hex');

export const setUserPasswordById = async (userId) => {
  const id = userId?._id || userId;
  if (!id) return null;

  const user = await User.findById(id).select('+password');
  if (!user) return null;

  const newPassword = generateTemporaryPassword();
  user.password = newPassword;
  user.markModified('password');
  await user.save();

  return { user, newPassword };
};
