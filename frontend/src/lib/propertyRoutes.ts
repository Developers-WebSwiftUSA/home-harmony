import { Property } from "@/types/models";

type PropertyRef = Pick<Property, "_id" | "listingType"> | string;

export const getPropertyDetailPath = (
  property: PropertyRef | null | undefined,
  listingType?: Property["listingType"]
) => {
  if (!property) return "/properties";

  const id = typeof property === "string" ? property : property._id;
  if (!id) return "/properties";

  const type = typeof property === "string" ? listingType : property.listingType;

  if (type === "rent" || type === "both") {
    return `/rentals/${id}`;
  }

  return `/properties/${id}`;
};

export const buildLoginRedirect = (path: string) =>
  `/login?redirect=${encodeURIComponent(path)}`;
