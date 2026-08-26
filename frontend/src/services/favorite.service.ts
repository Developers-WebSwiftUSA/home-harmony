import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import { Favorite } from "@/types/models";

export const favoriteService = {
  list: () => apiRequest<ApiResponse<Favorite[]>>("/favorites", { auth: true }),

  check: (propertyId: string) =>
    apiRequest<ApiResponse<Favorite> & { isFavorited: boolean }>(
      `/favorites/check/${propertyId}`,
      { auth: true }
    ),

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

  removeByProperty: async (propertyId: string) => {
    const check = await favoriteService.check(propertyId);
    if (!check.isFavorited || !check.data?._id) {
      return { success: true, message: "Not favorited" };
    }
    return favoriteService.remove(check.data._id);
  },
};

