import { messageService } from "@/services/message.service";

export async function resolveConversationId(userId: string): Promise<string> {
  const response = await messageService.getOrCreateConversation(userId);
  const conversationId = response.data._id || response.data.id;
  if (!conversationId) {
    throw new Error("Could not open conversation");
  }
  return String(conversationId);
}

export function buildMessagesChatUrl(messagesBasePath: string, conversationId: string): string {
  const base = messagesBasePath.replace(/\/$/, "");
  return `${base}?conversation=${encodeURIComponent(conversationId)}`;
}

export async function openUserChatUrl(userId: string, messagesBasePath: string): Promise<string> {
  const conversationId = await resolveConversationId(userId);
  return buildMessagesChatUrl(messagesBasePath, conversationId);
}
