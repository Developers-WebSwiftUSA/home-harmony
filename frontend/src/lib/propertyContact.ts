import { Property, User } from "@/types/models";

const resolveUserId = (user?: User | string | null) => {
  if (!user) return null;
  if (typeof user === "string") return user;
  return user._id || user.id || null;
};

export const hasAssignedAgent = (property?: Property | null) => Boolean(resolveUserId(property?.agentId));

export const getPropertyContactUser = (property: Property) => {
  const agentId = resolveUserId(property.agentId);
  if (agentId) {
    const agentUser = typeof property.agentId === "object" ? property.agentId : null;
    return {
      user: agentUser,
      userId: String(agentId),
      isAgent: true as const,
    };
  }

  const sellerId = resolveUserId(property.sellerId);
  const sellerUser = typeof property.sellerId === "object" ? property.sellerId : null;
  return {
    user: sellerUser,
    userId: sellerId ? String(sellerId) : null,
    isAgent: false as const,
  };
};
