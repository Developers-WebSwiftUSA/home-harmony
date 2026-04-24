import { ApiResponse } from "@/types/api";
import { Favorite } from "@/types/models";
import { mockFavorites, delay } from "@/data/mockData";

export const favoriteService = {
  list: async (): Promise<ApiResponse<Favorite[]>> => {
    await delay(500);
    return {
      success: true,
      count: mockFavorites.length,
      data: mockFavorites,
    };
  },

  add: async (propertyId: string): Promise<ApiResponse<Favorite>> => {
    await delay(600);
    const newFavorite: Favorite = {
      _id: `fav_${Date.now()}`,
      propertyId: mockFavorites[0].propertyId, // Use first property as demo
    };
    mockFavorites.push(newFavorite);
    return {
      success: true,
      data: newFavorite,
    };
  },

  remove: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    await delay(500);
    const index = mockFavorites.findIndex((f) => f._id === id);
    if (index > -1) {
      mockFavorites.splice(index, 1);
    }
    return {
      success: true,
      data: { message: "Favorite removed successfully" },
    };
  },
};
