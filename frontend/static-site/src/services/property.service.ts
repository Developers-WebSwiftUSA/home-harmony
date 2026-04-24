import { ApiResponse } from "@/types/api";
import { Property } from "@/types/models";
import { mockProperties, delay } from "@/data/mockData";

export const propertyService = {
  list: async (params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<Property[]>> => {
    await delay(600);
    let filtered = [...mockProperties];
    
    if (params?.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }
    if (params?.type && params.type !== "All") {
      filtered = filtered.filter((p) => p.type === params.type);
    }
    if (params?.city) {
      filtered = filtered.filter((p) => p.location.city?.toLowerCase().includes(String(params.city).toLowerCase()));
    }
    if (params?.minPrice) {
      filtered = filtered.filter((p) => p.price >= Number(params.minPrice));
    }
    if (params?.maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(params.maxPrice));
    }
    
    return {
      success: true,
      count: filtered.length,
      data: filtered,
    };
  },

  getById: async (id: string, requireAuth = false): Promise<ApiResponse<Property>> => {
    await delay(400);
    const property = mockProperties.find((p) => p._id === id);
    if (!property) {
      throw new Error("Property not found");
    }
    return {
      success: true,
      data: property,
    };
  },

  create: async (payload: any): Promise<ApiResponse<Property>> => {
    await delay(800);
    const newProperty: Property = {
      _id: `prop_${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      views: 0,
      inquiries: 0,
      favorites: 0,
    };
    mockProperties.push(newProperty);
    return {
      success: true,
      data: newProperty,
    };
  },

  mine: async (): Promise<ApiResponse<Property[]>> => {
    await delay(500);
    return {
      success: true,
      count: mockProperties.length,
      data: mockProperties.filter((p) => p.sellerId?._id === "3"), // Demo seller
    };
  },

  agent: async (): Promise<ApiResponse<Property[]>> => {
    await delay(500);
    return {
      success: true,
      count: mockProperties.length,
      data: mockProperties.filter((p) => p.agentId?._id === "4"), // Demo agent
    };
  },

  approve: async (id: string): Promise<ApiResponse<Property>> => {
    await delay(500);
    const property = mockProperties.find((p) => p._id === id);
    if (property) {
      property.status = "active";
    }
    return {
      success: true,
      data: property!,
    };
  },

  reject: async (id: string): Promise<ApiResponse<Property>> => {
    await delay(500);
    const property = mockProperties.find((p) => p._id === id);
    if (property) {
      property.status = "rejected";
    }
    return {
      success: true,
      data: property!,
    };
  },

  update: async (id: string, payload: Partial<Property>): Promise<ApiResponse<Property>> => {
    await delay(600);
    const property = mockProperties.find((p) => p._id === id);
    if (property) {
      Object.assign(property, payload);
    }
    return {
      success: true,
      data: property!,
    };
  },

  remove: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    await delay(500);
    const index = mockProperties.findIndex((p) => p._id === id);
    if (index > -1) {
      mockProperties.splice(index, 1);
    }
    return {
      success: true,
      data: { message: "Property deleted successfully" },
    };
  },

  nearby: async (longitude: number, latitude: number, maxDistance = 10000): Promise<ApiResponse<Property[]>> => {
    await delay(500);
    return {
      success: true,
      count: mockProperties.length,
      data: mockProperties,
    };
  },
};
