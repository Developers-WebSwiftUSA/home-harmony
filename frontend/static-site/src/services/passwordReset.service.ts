import { ApiResponse } from "@/types/api";
import { delay } from "@/data/mockData";

export interface PasswordResetRequest {
  _id: string;
  userId: any;
  email: string;
  status: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: any;
  newPassword?: string;
  reason?: string;
}

export const passwordResetService = {
  list: async (status?: string, userId?: string): Promise<ApiResponse<PasswordResetRequest[]>> => {
    await delay(500);
    return {
      success: true,
      count: 0,
      data: [],
    };
  },
  
  approve: async (id: string, newPassword?: string): Promise<ApiResponse<PasswordResetRequest>> => {
    await delay(600);
    return {
      success: true,
      data: {} as PasswordResetRequest,
    };
  },
  
  reject: async (id: string, reason?: string): Promise<ApiResponse<PasswordResetRequest>> => {
    await delay(600);
    return {
      success: true,
      data: {} as PasswordResetRequest,
    };
  },
  
  adminReset: async (userId: string, newPassword?: string): Promise<ApiResponse<{ newPassword?: string; userId?: string; message: string }>> => {
    await delay(600);
    const generatedPassword = newPassword || `DemoPass${Math.random().toString(36).slice(2, 10)}`;
    return {
      success: true,
      data: { newPassword: generatedPassword, userId, message: "Password reset successfully" },
    };
  },
  
  requestReset: async (email: string, reason?: string): Promise<ApiResponse<any>> => {
    await delay(800);
    return {
      success: true,
      data: { message: "Password reset request submitted" },
    };
  },
};
