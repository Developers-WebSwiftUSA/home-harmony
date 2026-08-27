export const getMessagesPathForRole = (role?: string | null) => {
  if (role === "admin") return "/admin/messages";
  if (role === "seller") return "/seller/messages";
  if (role === "agent") return "/agent/messages";
  return "/buyer/messages";
};

export const buildUserChatPath = (userId: string, role?: string | null) =>
  `${getMessagesPathForRole(role)}?userId=${encodeURIComponent(userId)}`;

export const buildLoginForAgentChat = (agentId: string) =>
  `/login?chatUser=${encodeURIComponent(agentId)}`;

export const rewriteMessagesPathForRole = (path: string, role?: string | null) => {
  const match = path.match(/^\/(buyer|seller|agent|admin)\/messages(\?.*)?$/);
  if (!match) return null;
  return `${getMessagesPathForRole(role)}${match[2] || ""}`;
};
