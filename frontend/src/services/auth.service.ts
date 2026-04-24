import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import { User } from "@/types/models";

type AuthPayload = {
  user: User;
  token: string;
};

export const authService = {
  login: (email: string, password: string) =>
    apiRequest<ApiResponse<AuthPayload>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: {
    email: string;
    password: string;
    role: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) =>
    apiRequest<ApiResponse<AuthPayload>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => apiRequest<ApiResponse<User>>("/auth/me", { auth: true }),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<ApiResponse<AuthPayload>>("/auth/updatepassword", {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

