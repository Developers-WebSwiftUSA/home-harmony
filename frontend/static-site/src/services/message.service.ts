import { ApiResponse } from "@/types/api";
import { Conversation, Message } from "@/types/models";
import { mockConversations, mockMessages, mockUsers, mockProperties, delay } from "@/data/mockData";

export const messageService = {
  conversations: async (): Promise<ApiResponse<Conversation[]>> => {
    await delay(500);
    return {
      success: true,
      count: mockConversations.length,
      data: mockConversations,
    };
  },

  getOrCreateConversation: async (userId: string, propertyId?: string): Promise<ApiResponse<Conversation>> => {
    await delay(600);
    let conversation = mockConversations.find(
      (c) => c.participants.some((p) => p._id === userId) && (!propertyId || c.propertyId?._id === propertyId)
    );
    
    if (!conversation) {
      const otherUser = mockUsers.find((u) => u._id === userId);
      const property = propertyId ? mockProperties.find((p) => p._id === propertyId) : undefined;
      conversation = {
        _id: `conv_${Date.now()}`,
        participants: [mockUsers[1], otherUser!],
        propertyId: property,
        lastMessage: undefined,
        lastMessageAt: new Date().toISOString(),
        unreadCount: {},
      };
      mockConversations.push(conversation);
    }
    
    return {
      success: true,
      data: conversation,
    };
  },

  getMessages: async (conversationId: string): Promise<ApiResponse<Message[]>> => {
    await delay(400);
    const messages = mockMessages[conversationId] || [];
    return {
      success: true,
      count: messages.length,
      data: messages,
    };
  },

  send: async (payload: {
    conversationId?: string;
    receiverId?: string;
    content: string;
    messageType?: string;
  }): Promise<ApiResponse<Message>> => {
    await delay(500);
    const newMessage: Message = {
      _id: `msg_${Date.now()}`,
      senderId: mockUsers[1],
      receiverId: mockUsers.find((u) => u._id === payload.receiverId) || mockUsers[2],
      content: payload.content,
      messageType: (payload.messageType as any) || "text",
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    const convId = payload.conversationId || "1";
    if (!mockMessages[convId]) {
      mockMessages[convId] = [];
    }
    mockMessages[convId].push(newMessage);
    
    return {
      success: true,
      data: newMessage,
    };
  },

  markAsRead: async (conversationId: string): Promise<ApiResponse<{ message: string }>> => {
    await delay(300);
    const messages = mockMessages[conversationId] || [];
    messages.forEach((msg) => {
      msg.isRead = true;
    });
    return {
      success: true,
      data: { message: "Messages marked as read" },
    };
  },
};
