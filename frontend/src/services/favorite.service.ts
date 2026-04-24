import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import { Favorite } from "@/types/models";

export const favoriteService = {
  list: () => apiRequest<ApiResponse<Favorite[]>>("/favorites", { auth: true }),

  add: (propertyId: string) =>
    apiRequest<ApiResponse<Favorite>>("/favorites", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ propertyId }),
    }),

  remove: (id: string) =>
    apiRequest<ApiResponse<{ message: string }>>(`/favorites/${id}`, {
      method: "DELETE",
      auth: true,
    }),
};

