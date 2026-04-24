import { ApiResponse } from "@/types/api";
import { Tour } from "@/types/models";
import { mockTours, mockProperties, mockUsers, delay } from "@/data/mockData";

export const tourService = {
  list: async (params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<Tour[]>> => {
    await delay(500);
    let filtered = [...mockTours];
    
    if (params?.status && params.status !== "all") {
      filtered = filtered.filter((t) => t.status === params.status);
    }
    
    return {
      success: true,
      count: filtered.length,
      data: filtered,
    };
  },

  getById: async (id: string): Promise<ApiResponse<Tour>> => {
    await delay(400);
    const tour = mockTours.find((t) => t._id === id);
    if (!tour) {
      throw new Error("Tour not found");
    }
    return {
      success: true,
      data: tour,
    };
  },

  create: async (payload: {
    propertyId: string;
    date: string;
    startTime: string;
    endTime: string;
    message?: string;
  }): Promise<ApiResponse<Tour>> => {
    await delay(800);
    const property = mockProperties.find((p) => p._id === payload.propertyId);
    const newTour: Tour = {
      _id: `tour_${Date.now()}`,
      propertyId: property!,
      buyerId: mockUsers[1],
      sellerId: mockUsers[2],
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      status: "pending",
      message: payload.message,
      createdAt: new Date().toISOString(),
    };
    mockTours.push(newTour);
    return {
      success: true,
      data: newTour,
    };
  },

  updateStatus: async (id: string, status: string, cancellationReason?: string): Promise<ApiResponse<Tour>> => {
    await delay(600);
    const tour = mockTours.find((t) => t._id === id);
    if (tour) {
      tour.status = status as any;
      if (cancellationReason) {
        tour.cancellationReason = cancellationReason;
      }
    }
    return {
      success: true,
      data: tour!,
    };
  },

  approve: async (id: string): Promise<ApiResponse<Tour>> => {
    await delay(600);
    const tour = mockTours.find((t) => t._id === id);
    if (tour) {
      tour.status = "confirmed";
    }
    return {
      success: true,
      data: tour!,
    };
  },

  decline: async (id: string, reason?: string): Promise<ApiResponse<Tour>> => {
    await delay(600);
    const tour = mockTours.find((t) => t._id === id);
    if (tour) {
      tour.status = "declined";
      if (reason) tour.cancellationReason = reason;
    }
    return {
      success: true,
      data: tour!,
    };
  },

  reschedule: async (id: string, payload: {
    newDate: string;
    newStartTime: string;
    newEndTime: string;
    reason?: string;
    comment?: string;
  }): Promise<ApiResponse<Tour>> => {
    await delay(600);
    const tour = mockTours.find((t) => t._id === id);
    if (tour) {
      tour.status = "reschedule_pending_buyer_approval";
      tour.pendingReschedule = {
        requestedBy: mockUsers[2], // Demo seller
        requestedByRole: "seller",
        newDate: payload.newDate,
        newStartTime: payload.newStartTime,
        newEndTime: payload.newEndTime,
        reason: payload.reason,
        comment: payload.comment,
        requestedAt: new Date().toISOString(),
      };
    }
    return {
      success: true,
      data: tour!,
    };
  },

  approveReschedule: async (id: string): Promise<ApiResponse<Tour>> => {
    await delay(600);
    const tour = mockTours.find((t) => t._id === id);
    if (tour && tour.pendingReschedule) {
      tour.date = tour.pendingReschedule.newDate;
      tour.startTime = tour.pendingReschedule.newStartTime;
      tour.endTime = tour.pendingReschedule.newEndTime;
      tour.status = "confirmed";
      tour.pendingReschedule = undefined;
    }
    return {
      success: true,
      data: tour!,
    };
  },

  rejectReschedule: async (id: string, reason?: string): Promise<ApiResponse<Tour>> => {
    await delay(600);
    const tour = mockTours.find((t) => t._id === id);
    if (tour) {
      tour.status = "confirmed";
      tour.pendingReschedule = undefined;
    }
    return {
      success: true,
      data: tour!,
    };
  },

  markComplete: async (id: string): Promise<ApiResponse<Tour>> => {
    await delay(600);
    const tour = mockTours.find((t) => t._id === id);
    if (tour) {
      tour.status = "completed";
    }
    return {
      success: true,
      data: tour!,
    };
  },

  submitFeedback: async (id: string, payload: {
    propertyRating: number;
    agentRating?: number;
    propertyComment?: string;
    agentComment?: string;
    overallExperience?: "excellent" | "good" | "average" | "poor";
    wouldRecommend?: boolean;
  }): Promise<ApiResponse<Tour>> => {
    await delay(600);
    const tour = mockTours.find((t) => t._id === id);
    if (tour) {
      tour.feedback = {
        ...payload,
        submittedAt: new Date().toISOString(),
      };
    }
    return {
      success: true,
      data: tour!,
    };
  },

  availability: async (propertyId: string, date: string): Promise<ApiResponse<Array<{ startTime: string; endTime: string; available: boolean }>>> => {
    await delay(400);
    return {
      success: true,
      data: [
        { startTime: "09:00", endTime: "10:00", available: true },
        { startTime: "10:00", endTime: "11:00", available: false },
        { startTime: "11:00", endTime: "12:00", available: true },
        { startTime: "14:00", endTime: "15:00", available: true },
        { startTime: "15:00", endTime: "16:00", available: true },
      ],
    };
  },
};
