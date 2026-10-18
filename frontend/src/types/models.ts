export type UserRole = "admin" | "buyer" | "seller" | "agent";

export type DistanceUnit = "miles" | "km";

export interface UserPreferences {
  distanceUnit?: DistanceUnit;
}

export interface AgentPreferredArea {
  label?: string;
  city?: string;
  state?: string;
  radiusMiles?: number | null;
  coordinates?: {
    type?: "Point";
    coordinates: [number, number];
  };
}

export interface AgentProfile {
  licenseNumber?: string;
  specialization?: string[];
  yearsOfExperience?: number;
  rating?: {
    average: number;
    count: number;
  };
  verified?: boolean;
  bio?: string;
  languages?: string[];
  preferredArea?: AgentPreferredArea | null;
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
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    coordinates?: {
      type?: "Point";
      coordinates: [number, number];
    };
  };
  agentProfile?: AgentProfile;
  assignedProperties?: number;
  distanceMiles?: number | null;
  sameState?: boolean;
  sameCity?: boolean;
  inPreferredArea?: boolean;
  locationLabel?: string;
  preferences?: UserPreferences;
}

export interface AgentReview {
  _id: string;
  propertyTitle: string;
  propertyLocation?: string;
  rating: number;
  comment?: string;
  submittedAt?: string;
  buyerName?: string;
  wouldRecommend?: boolean;
  overallExperience?: string;
}

export interface AgentPublicProfile {
  agent: User;
  averageRating: number;
  reviewCount: number;
  assignedProperties: number;
  reviews: AgentReview[];
  properties?: Property[];
}

export type AgentAssignmentRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface AgentAssignmentRequest {
  _id: string;
  id?: string;
  propertyId: Property | string;
  sellerId: User | string;
  preferredAgentId?: User | string | null;
  assignedAgentId?: User | string | null;
  message?: string;
  status: AgentAssignmentRequestStatus;
  approvedBy?: User | string;
  approvedAt?: string;
  rejectedBy?: User | string;
  rejectedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RentalDetails {
  deposit?: number;
  petFee?: number;
  petPolicy?: "allowed" | "not_allowed" | "negotiable";
  furnished?: boolean;
  laundry?: "in_unit" | "shared" | "none";
  acceptsApplications?: boolean;
  monthlyFees?: Array<{ label: string; amount: number }>;
  utilitiesIncluded?: string[];
}

export interface PropertyFeatures {
  airConditioning?: boolean;
  heating?: boolean;
  parking?: boolean;
  pool?: boolean;
  gym?: boolean;
  security?: boolean;
  elevator?: boolean;
  balcony?: boolean;
  fireplace?: boolean;
  garden?: boolean;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  listingType?: "sale" | "rent" | "both";
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  images: Array<{ url: string; isPrimary?: boolean; caption?: string }>;
  paidGallerySlots?: number;
  location: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      coordinates: [number, number];
    };
  };
  amenities?: string[];
  features?: PropertyFeatures;
  rentalDetails?: RentalDetails;
  availabilityDate?: string;
  sellerId?: User;
  agentId?: User;
  rating?: {
    average: number;
    count: number;
  };
  views?: number;
  inquiries?: number;
  favorites?: number;
  featured?: boolean;
  promotion?: {
    type?: "advertisement" | "sponsored";
    campaignId?: string;
    expiresAt?: string;
  };
  promotionPriority?: number;
  viewershipEnabled?: boolean;
  viewershipPausedAt?: string;
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
  tourType?: "in-person" | "virtual" | "open-house";
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

export type RentalApplicationStatus =
  | "pending"
  | "reviewing"
  | "approved"
  | "rejected"
  | "withdrawn";

export interface RentalApplication {
  _id: string;
  propertyId: Property;
  buyerId: User;
  sellerId: User;
  agentId?: User;
  fullName: string;
  email: string;
  phone?: string;
  moveInDate?: string;
  message?: string;
  status: RentalApplicationStatus;
  statusNote?: string;
  reviewedAt?: string;
  reviewedBy?: User;
  createdAt?: string;
  updatedAt?: string;
}

