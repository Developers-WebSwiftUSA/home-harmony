import User from '../models/User.model.js';
import { buildDefaultAvatar } from '../utils/formatAuthUser.js';

export const SUPER_ADMIN_EMAIL = (
  process.env.SUPER_ADMIN_EMAIL || 'superadmin@gmail.com'
).toLowerCase().trim();

const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'admin321';

/**
 * Ensures the built-in super admin exists on database initialization.
 * Creates the account only if it is missing; does not reset an existing password.
 */
export const seedSuperAdmin = async () => {
  const existing = await User.findOne({ email: SUPER_ADMIN_EMAIL });

  if (existing) {
    let changed = false;
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      changed = true;
    }
    if (existing.status !== 'active') {
      existing.status = 'active';
      changed = true;
    }
    if (changed) {
      await existing.save();
      console.log('Super admin account updated (role/status).');
    } else {
      console.log('Super admin account already exists.');
    }
    return;
  }

  await User.create({
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
    role: 'admin',
    status: 'active',
    firstName: 'Super',
    lastName: 'Admin',
    avatar: buildDefaultAvatar({
      firstName: 'Super',
      lastName: 'Admin',
      email: SUPER_ADMIN_EMAIL,
    }),
  });

  console.log(`Super admin account created (${SUPER_ADMIN_EMAIL}).`);
};

export default seedSuperAdmin;
