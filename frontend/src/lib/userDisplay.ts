import { User } from "@/types/models";

export const getDisplayName = (user?: User | null): string => {
  if (!user) return "User";
  const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return full || user.email || "User";
};

export const getUserInitials = (user?: User | null): string => {
  if (!user) return "U";
  const first = user.firstName?.[0] || "";
  const last = user.lastName?.[0] || "";
  if (first || last) return `${first}${last}`.toUpperCase();
  return (user.email?.[0] || "U").toUpperCase();
};

/** Normalize API user document for client state */
export const normalizeUser = (user: User): User => ({
  ...user,
  id: user.id || user._id,
  _id: user._id || user.id,
  avatar: user.avatar || getAvatarUrl(user),
});

export const getUserId = (user?: { _id?: string; id?: string } | null): string =>
  String(user?._id || user?.id || "");

export const isSameUser = (
  a?: { _id?: string; id?: string } | null,
  b?: { _id?: string; id?: string } | null
): boolean => {
  const idA = getUserId(a);
  const idB = getUserId(b);
  return Boolean(idA && idB && idA === idB);
};

export const getAvatarUrl = (user?: User | null): string => {
  if (!user) return "";
  if (user.avatar) return user.avatar;
  const seed = encodeURIComponent(
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "user"
  );
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};
