import { ApiResponse } from "@/types/api";
import { delay } from "@/data/mockData";

export const uploadService = {
  image: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    await delay(1000);
    // Return a mock image URL
    return {
      success: true,
      data: {
        url: URL.createObjectURL(file),
      },
    };
  },
  
  uploadImage: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    await delay(1000);
    return {
      success: true,
      data: {
        url: URL.createObjectURL(file),
      },
    };
  },
};
