import { ApiResponse } from "@/types/api";
import { User } from "@/types/models";
import { mockUsers, delay } from "@/data/mockData";

export const userService = {
  list: async (params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<User[]>> => {
    await delay(500);
    let filtered = [...mockUsers];
    
    if (params?.role) {
      filtered = filtered.filter((u) => u.role === params.role);
    }
    if (params?.status) {
      filtered = filtered.filter((u) => u.status === params.status);
    }
    
    return {
      success: true,
      count: filtered.length,
      data: filtered,
    };
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    await delay(400);
    const user = mockUsers.find((u) => u._id === id);
    if (!user) {
      throw new Error("User not found");
    }
    return {
      success: true,
      data: user,
    };
  },

  update: async (id: string, payload: Partial<User>, newToken?: string): Promise<ApiResponse<User>> => {
    await delay(600);
    const user = mockUsers.find((u) => u._id === id || id === "me");
    if (user) {
      Object.assign(user, payload);
    }
    return {
      success: true,
      data: user!,
    };
  },

  remove: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    await delay(500);
    const index = mockUsers.findIndex((u) => u._id === id);
    if (index > -1) {
      mockUsers.splice(index, 1);
    }
    return {
      success: true,
      data: { message: "User deleted successfully" },
    };
  },
};
