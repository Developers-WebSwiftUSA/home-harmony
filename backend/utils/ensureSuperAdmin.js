import User from '../models/User.model.js';

/** Hard-coded bootstrap admin (requested). Synced on server start and optional post-build seed. */
export const SUPERADMIN_EMAIL = 'superadmin@gmail.com';
export const SUPERADMIN_PASSWORD = 'admin321';

/**
 * Ensures the super admin exists with the fixed credentials above.
 * If the user already exists, password and role are reset to these values.
 */
export async function ensureSuperAdmin() {
  const email = SUPERADMIN_EMAIL.toLowerCase().trim();
  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    await User.create({
      email,
      password: SUPERADMIN_PASSWORD,
      role: 'admin',
      firstName: 'Super',
      lastName: 'Admin',
      status: 'active',
      emailVerified: true,
    });
    console.log(`[ensureSuperAdmin] Created admin: ${email}`);
    return;
  }

  user.password = SUPERADMIN_PASSWORD;
  user.role = 'admin';
  user.status = 'active';
  user.emailVerified = true;
  await user.save();
  console.log(`[ensureSuperAdmin] Synced admin credentials: ${email}`);
}
