import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import { Conversation, Message } from "@/types/models";

export const messageService = {
  conversations: () =>
    apiRequest<ApiResponse<Conversation[]>>("/messages/conversations", { auth: true }),

  getOrCreateConversation: (userId: string, propertyId?: string) => {
    const params = propertyId ? `?propertyId=${propertyId}` : "";
    return apiRequest<ApiResponse<Conversation>>(`/messages/conversations/${userId}${params}`, {
      auth: true,
    });
  },

  getMessages: (conversationId: string) =>
    apiRequest<ApiResponse<Message[]>>(`/messages/conversations/${conversationId}/messages`, {
      auth: true,
    }),

  send: (payload: {
    conversationId?: string;
    receiverId?: string;
    content: string;
    messageType?: string;
  }) =>
    apiRequest<ApiResponse<Message>>("/messages", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),

  markAsRead: (conversationId: string) =>
    apiRequest<ApiResponse<{ message: string }>>(`/messages/conversations/${conversationId}/read`, {
      method: "PUT",
      auth: true,
    }),
};

