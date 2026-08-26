/**
 * Default avatar from registration name (or email) until user uploads a custom one.
 */
export const buildDefaultAvatar = ({ firstName, lastName, email }) => {
  const seed = encodeURIComponent(
    `${firstName || ''} ${lastName || ''}`.trim() || email || 'user'
  );
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

export const formatAuthUser = (user) => {
  if (!user) return null;

  const doc = user.toObject ? user.toObject() : user;

  return {
    id: doc._id?.toString?.() || doc._id || doc.id,
    _id: doc._id?.toString?.() || doc._id,
    email: doc.email,
    role: doc.role,
    firstName: doc.firstName,
    lastName: doc.lastName,
    phone: doc.phone,
    avatar: doc.avatar || buildDefaultAvatar(doc),
    status: doc.status,
    agentProfile: doc.agentProfile,
    preferences: doc.preferences,
  };
};
