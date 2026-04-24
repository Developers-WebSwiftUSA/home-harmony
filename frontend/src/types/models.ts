export type UserRole = "admin" | "buyer" | "seller" | "agent";

export interface AgentProfile {
  verified?: boolean;
  licenseNumber?: string;
  rating?: {
    average?: number;
    count?: number;
  };
}

/** Sanitized agent row from GET /api/agents (public). */
export interface PublicAgent {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  location?: string;
  roleTitle?: string;
  agentProfile?: {
    bio?: string;
    yearsOfExperience?: number;
    languages?: string[];
    rating?: { average?: number; count?: number };
  };
  propertyCount: number;
}

export interface User {
  id?: string;
  _id?: string;
  email: string;
  role: UserRole;
  status?: "active" | "inactive" | "pending" | "suspended";
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  agentProfile?: AgentProfile;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  images: Array<{ url: string; isPrimary?: boolean }>;
  location: {
    address?: string;
    city?: string;
    state?: string;
    coordinates?: {
      coordinates: [number, number];
    };
  };
  sellerId?: User;
  agentId?: User;
  views?: number;
  inquiries?: number;
  favorites?: number;
  createdAt?: string;
}

export interface TourRescheduleHistory {
  _id?: string;
  requestedBy: User;
  requestedByRole: "buyer" | "seller" | "agent" | "admin";
  oldDate: string;
  oldStartTime: string;
  oldEndTime: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  reason?: string;
  comment?: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: User;
  approvedAt?: string;
  createdAt?: string;
}

export interface TourPendingReschedule {
  requestedBy: User;
  requestedByRole: "buyer" | "seller" | "agent" | "admin";
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  reason?: string;
  comment?: string;
  requestedAt: string;
}

export interface TourFeedback {
  propertyRating?: number;
  agentRating?: number;
  propertyComment?: string;
  agentComment?: string;
  overallExperience?: "excellent" | "good" | "average" | "poor";
  wouldRecommend?: boolean;
  submittedAt?: string;
}

export interface Tour {
  _id: string;
  propertyId: Property;
  buyerId: User;
  sellerId: User;
  agentId?: User;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "reschedule_requested" | "reschedule_pending_buyer_approval" | "completed" | "cancelled" | "declined";
  message?: string;
  cancellationReason?: string;
  rescheduleHistory?: TourRescheduleHistory[];
  pendingReschedule?: TourPendingReschedule;
  feedback?: TourFeedback;
  createdAt?: string;
  updatedAt?: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  propertyId?: Property;
  lastMessage?: Message;
  lastMessageAt?: string;
  unreadCount?: Record<string, number>;
}

export interface Message {
  _id: string;
  senderId: User;
  receiverId: User;
  content: string;
  messageType?: "text" | "image" | "file" | "system";
  isRead?: boolean;
  createdAt?: string;
}

export interface Favorite {
  _id: string;
  propertyId: Property;
  notes?: string;
}

