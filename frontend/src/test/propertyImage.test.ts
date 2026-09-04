import { describe, expect, it } from "vitest";
import { getPropertyPrimaryImage, resolvePropertyImageUrl } from "@/lib/propertyImage";

describe("resolvePropertyImageUrl", () => {
  it("prefixes relative upload paths with the API origin", () => {
    expect(resolvePropertyImageUrl("/uploads/house-a.jpg")).toBe(
      "http://localhost:5000/uploads/house-a.jpg"
    );
  });

  it("keeps absolute URLs so each listing can use its own hosted image", () => {
    expect(resolvePropertyImageUrl("https://cdn.example.com/listings/b.jpg")).toBe(
      "https://cdn.example.com/listings/b.jpg"
    );
  });
});

describe("getPropertyPrimaryImage", () => {
  it("uses the primary image, otherwise the first image", () => {
    expect(
      getPropertyPrimaryImage([
        { url: "/uploads/first.jpg" },
        { url: "/uploads/primary.jpg", isPrimary: true },
      ])
    ).toBe("http://localhost:5000/uploads/primary.jpg");

    expect(getPropertyPrimaryImage([{ url: "/uploads/only.jpg" }])).toBe(
      "http://localhost:5000/uploads/only.jpg"
    );
  });

  it("accepts plain URL strings and falls back when empty", () => {
    expect(getPropertyPrimaryImage(["/uploads/plain.jpg"])).toBe(
      "http://localhost:5000/uploads/plain.jpg"
    );
    expect(getPropertyPrimaryImage([], "/fallback.jpg")).toBe("/fallback.jpg");
  });
});
