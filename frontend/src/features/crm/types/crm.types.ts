import { User, Property, Tour, RentalApplication } from "@/types/models";

export type CrmMarket = "sale" | "rent";

export type BuyerSummary = {
  buyerId: string;
  buyer: User;
  market: CrmMarket;
  toursCount: number;
  applicationsCount: number;
  propertiesCount: number;
  reviewsCount: number;
  closedDeals: number;
  lastActivity?: string | null;
  status: string;
};

export type BuyerReview = {
  tourId: string;
  property: Property;
  rating?: number;
  comment?: string;
  submittedAt?: string;
  overallExperience?: string;
};

export type BuyerDetail = BuyerSummary & {
  tours: Tour[];
  applications: RentalApplication[];
  reviews: BuyerReview[];
};

export type PartnerSummary = {
  partner: User;
  stats: {
    listings: number;
    saleListings: number;
    rentListings: number;
    activeListings: number;
    saleBuyers: number;
    rentBuyers: number;
  };
};

export type PartnerDetail = {
  partner: User;
  properties: Property[];
  saleBuyers: BuyerSummary[];
  rentBuyers: BuyerSummary[];
};
