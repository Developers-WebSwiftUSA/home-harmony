import { getApiOrigin as getResolvedApiOrigin } from "@/lib/app-env";

type ImageEntry = { url?: string; isPrimary?: boolean } | string;

export const getApiOrigin = () => getResolvedApiOrigin();

export const resolvePropertyImageUrl = (raw?: string | null): string | null => {
  if (!raw?.trim()) return null;

  const url = raw.trim();

  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  // Keep absolute URLs as-is so each listing can load its own hosted file.
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return `${getApiOrigin()}${url}`;
  }

  if (url.startsWith("uploads/")) {
    return `${getApiOrigin()}/${url}`;
  }

  const uploadsMatch = url.match(/\/uploads\/(.+)$/);
  if (uploadsMatch) {
    return `${getApiOrigin()}/uploads/${uploadsMatch[1]}`;
  }

  return url;
};

const primaryFirst = (images: Array<{ url?: string; isPrimary?: boolean }>) => {
  const primary = images.find((item) => item.isPrimary && item.url?.trim());
  return primary ? [primary, ...images.filter((item) => item !== primary)] : images;
};

const normalizeImages = (images?: ImageEntry[] | null) => {
  if (!images?.length) return [];
  return images
    .map((item) => (typeof item === "string" ? { url: item } : item))
    .filter((item) => Boolean(item.url?.trim()));
};

export const getAllPropertyImageUrls = (images?: ImageEntry[] | null): string[] => {
  return primaryFirst(normalizeImages(images))
    .map((item) => resolvePropertyImageUrl(item.url))
    .filter((url): url is string => Boolean(url));
};

export const getPropertyPrimaryImage = (
  images?: ImageEntry[] | null,
  fallback = ""
): string => {
  const urls = getAllPropertyImageUrls(images);
  return urls[0] || fallback;
};
