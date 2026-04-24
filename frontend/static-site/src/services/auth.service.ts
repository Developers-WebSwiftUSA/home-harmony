import { ApiResponse } from "@/types/api";
import { User } from "@/types/models";
import { mockUsers, delay } from "@/data/mockData";

type AuthPayload = {
  user: User;
  token: string;
};

export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthPayload>> => {
    await delay(800);
    const user = mockUsers.find((u) => u.email === email);
    if (!user) {
      throw new Error("Invalid email or password");
    }
    return {
      success: true,
      data: {
        user,
        token: `mock_token_${user._id}_${Date.now()}`,
      },
    };
  },

  register: async (payload: {
    email: string;
    password: string;
    role: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<ApiResponse<AuthPayload>> => {
    await delay(1000);
    const existingUser = mockUsers.find((u) => u.email === payload.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    const newUser: User = {
      _id: `user_${Date.now()}`,
      email: payload.email,
      role: payload.role as any,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      status: "active",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.email}`,
    };
    mockUsers.push(newUser);
    return {
      success: true,
      data: {
        user: newUser,
        token: `mock_token_${newUser._id}_${Date.now()}`,
      },
    };
  },

  me: async (): Promise<ApiResponse<User>> => {
    await delay(300);
    // Return first user as demo
    return {
      success: true,
      data: mockUsers[0],
    };
  },

  updatePassword: async (currentPassword: string, newPassword: string, newToken?: string): Promise<ApiResponse<AuthPayload>> => {
    await delay(600);
    const user = mockUsers[0];
    return {
      success: true,
      data: {
        user,
        token: `mock_token_${user._id}_${Date.now()}`,
      },
    };
  },
};
