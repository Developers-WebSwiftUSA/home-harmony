import { describe, expect, it } from "vitest";
import {
  FREE_GALLERY_COUNT,
  getAllowedGalleryCount,
  getGallerySlotState,
  getLockedGalleryCount,
} from "@/features/gallery-slots/lib/gallerySlots";

describe("gallerySlots", () => {
  it("keeps the first three gallery photos free", () => {
    expect(FREE_GALLERY_COUNT).toBe(3);
    expect(getAllowedGalleryCount(0)).toBe(3);
    expect(getAllowedGalleryCount(2)).toBe(5);
    expect(getLockedGalleryCount(3, 0)).toBe(0);
    expect(getLockedGalleryCount(7, 0)).toBe(4);
    expect(getLockedGalleryCount(7, 2)).toBe(2);
  });

  it("labels gallery slots as free, paid, or locked", () => {
    expect(getGallerySlotState(0, 0)).toBe("free");
    expect(getGallerySlotState(2, 0)).toBe("free");
    expect(getGallerySlotState(3, 0)).toBe("locked");
    expect(getGallerySlotState(3, 2)).toBe("paid");
    expect(getGallerySlotState(5, 2)).toBe("locked");
  });
});
