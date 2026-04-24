import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";

type UploadResponse = {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
};

export const uploadService = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    return apiRequest<ApiResponse<UploadResponse>>("/uploads/image", {
      method: "POST",
      auth: true,
      body: formData,
    });
  },
};

