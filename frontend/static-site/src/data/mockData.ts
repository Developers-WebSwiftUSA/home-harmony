import { User, Property, Tour, Conversation, Message, Favorite } from "@/types/models";

// Sample Users
export const mockUsers: User[] = [
  {
    _id: "1",
    email: "admin@example.com",
    role: "admin",
    firstName: "Admin",
    lastName: "User",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    phone: "+1 (555) 000-0001",
    status: "active",
  },
  {
    _id: "2",
    email: "buyer@example.com",
    role: "buyer",
    firstName: "John",
    lastName: "Buyer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=buyer",
    phone: "+1 (555) 000-0002",
    status: "active",
  },
  {
    _id: "3",
    email: "seller@example.com",
    role: "seller",
    firstName: "Jane",
    lastName: "Seller",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=seller",
    phone: "+1 (555) 000-0003",
    status: "active",
  },
  {
    _id: "4",
    email: "agent@example.com",
    role: "agent",
    firstName: "Bob",
    lastName: "Agent",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=agent",
    phone: "+1 (555) 000-0004",
    status: "active",
  },
];

// Sample Properties
export const mockProperties: Property[] = [
  {
    _id: "1",
    title: "Modern Luxury Villa",
    description: "Stunning modern villa with panoramic views, featuring 5 bedrooms, 4 bathrooms, and a private pool. Located in a prestigious neighborhood with easy access to schools and shopping.",
    type: "Villa",
    status: "active",
    price: 1250000,
    bedrooms: 5,
    bathrooms: 4,
    squareFeet: 3500,
    images: [
      { url: "/src/assets/property-1.jpg", isPrimary: true },
      { url: "/src/assets/property-2.jpg" },
      { url: "/src/assets/property-3.jpg" },
    ],
    location: {
      address: "123 Luxury Lane",
      city: "Los Angeles",
      state: "CA",
      coordinates: { coordinates: [-118.2437, 34.0522] },
    },
    sellerId: mockUsers[2],
    agentId: mockUsers[3],
    views: 245,
    inquiries: 12,
    favorites: 8,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    title: "Downtown Apartment",
    description: "Spacious 2-bedroom apartment in the heart of downtown. Modern amenities, floor-to-ceiling windows, and a rooftop terrace. Perfect for professionals.",
    type: "Apartment",
    status: "active",
    price: 450000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    images: [
      { url: "/src/assets/property-2.jpg", isPrimary: true },
      { url: "/src/assets/property-1.jpg" },
    ],
    location: {
      address: "456 Main Street",
      city: "New York",
      state: "NY",
      coordinates: { coordinates: [-74.006, 40.7128] },
    },
    sellerId: mockUsers[2],
    agentId: mockUsers[3],
    views: 189,
    inquiries: 7,
    favorites: 5,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "3",
    title: "Family Home with Garden",
    description: "Beautiful family home with a large garden, perfect for children. 4 bedrooms, 3 bathrooms, and a spacious kitchen. Quiet neighborhood with excellent schools nearby.",
    type: "House",
    status: "active",
    price: 675000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2400,
    images: [
      { url: "/src/assets/property-3.jpg", isPrimary: true },
      { url: "/src/assets/property-1.jpg" },
      { url: "/src/assets/property-2.jpg" },
    ],
    location: {
      address: "789 Oak Avenue",
      city: "Chicago",
      state: "IL",
      coordinates: { coordinates: [-87.6298, 41.8781] },
    },
    sellerId: mockUsers[2],
    agentId: mockUsers[3],
    views: 312,
    inquiries: 15,
    favorites: 12,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "4",
    title: "Commercial Space",
    description: "Prime commercial space in a high-traffic area. Ideal for retail or office use. 2000 sq ft with parking available.",
    type: "Commercial",
    status: "active",
    price: 850000,
    bedrooms: 0,
    bathrooms: 2,
    squareFeet: 2000,
    images: [
      { url: "/src/assets/property-1.jpg", isPrimary: true },
    ],
    location: {
      address: "321 Business Blvd",
      city: "San Francisco",
      state: "CA",
      coordinates: { coordinates: [-122.4194, 37.7749] },
    },
    sellerId: mockUsers[2],
    agentId: mockUsers[3],
    views: 156,
    inquiries: 9,
    favorites: 4,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Sample Tours
export const mockTours: Tour[] = [
  {
    _id: "1",
    propertyId: mockProperties[0],
    buyerId: mockUsers[1],
    sellerId: mockUsers[2],
    agentId: mockUsers[3],
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "11:00",
    status: "confirmed",
    message: "Looking forward to viewing this property!",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    propertyId: mockProperties[1],
    buyerId: mockUsers[1],
    sellerId: mockUsers[2],
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: "14:00",
    endTime: "15:00",
    status: "pending",
    message: "Interested in scheduling a tour.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Sample Conversations
export const mockConversations: Conversation[] = [
  {
    _id: "1",
    participants: [mockUsers[1], mockUsers[2]],
    propertyId: mockProperties[0],
    lastMessage: {
      _id: "msg1",
      senderId: mockUsers[2],
      receiverId: mockUsers[1],
      content: "Thank you for your interest!",
      messageType: "text",
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    lastMessageAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    unreadCount: { "1": 1 },
  },
  {
    _id: "2",
    participants: [mockUsers[1], mockUsers[3]],
    propertyId: mockProperties[1],
    lastMessage: {
      _id: "msg2",
      senderId: mockUsers[1],
      receiverId: mockUsers[3],
      content: "When can we schedule a viewing?",
      messageType: "text",
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: {},
  },
];

// Sample Messages
export const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      _id: "msg1",
      senderId: mockUsers[1],
      receiverId: mockUsers[2],
      content: "Hi, I'm interested in this property.",
      messageType: "text",
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "msg2",
      senderId: mockUsers[2],
      receiverId: mockUsers[1],
      content: "Thank you for your interest!",
      messageType: "text",
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
  "2": [
    {
      _id: "msg3",
      senderId: mockUsers[1],
      receiverId: mockUsers[3],
      content: "When can we schedule a viewing?",
      messageType: "text",
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

// Sample Favorites
export const mockFavorites: Favorite[] = [
  {
    _id: "1",
    propertyId: mockProperties[0],
    notes: "Love the modern design!",
  },
  {
    _id: "2",
    propertyId: mockProperties[2],
  },
];

// Helper function to simulate API delay
export const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));
