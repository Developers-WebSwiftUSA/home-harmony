/**
 * Safe user object for JWT clients (login / register / refresh-style responses).
 */
export function toAuthUserPayload(user) {
  const doc = user?.toObject ? user.toObject({ virtuals: true }) : user;
  if (!doc) return null;
  const base = {
    _id: doc._id,
    id: doc._id,
    email: doc.email,
    role: doc.role,
    firstName: doc.firstName,
    lastName: doc.lastName,
    phone: doc.phone,
    avatar: doc.avatar,
    status: doc.status,
  };
  if (doc.role === 'agent') {
    base.agentProfile = {
      verified: Boolean(doc.agentProfile?.verified),
      rating: {
        average: doc.agentProfile?.rating?.average ?? 0,
        count: doc.agentProfile?.rating?.count ?? 0,
      },
      ...(doc.agentProfile?.verified && doc.agentProfile?.licenseNumber
        ? { licenseNumber: doc.agentProfile.licenseNumber }
        : {}),
    };
  }
  return base;
}
