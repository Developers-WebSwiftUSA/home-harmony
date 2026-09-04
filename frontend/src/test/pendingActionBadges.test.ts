import { describe, expect, it } from "vitest";
import {
  formatPendingBadge,
  getSidebarPendingCount,
} from "@/lib/pendingActionBadges";
import { PendingActionCounts } from "@/services/pendingActions.service";

const counts: PendingActionCounts = {
  properties: 4,
  users: 2,
  passwordResets: 1,
  adCampaigns: 3,
  tours: 5,
  applications: 6,
  messages: 7,
};

describe("pendingActionBadges", () => {
  it("maps admin approval sections to the actions they still need to handle", () => {
    expect(getSidebarPendingCount("admin", "Properties", counts)).toBe(4);
    expect(getSidebarPendingCount("admin", "Moderation", counts)).toBe(4);
    expect(getSidebarPendingCount("admin", "Users", counts)).toBe(2);
    expect(getSidebarPendingCount("admin", "Password Resets", counts)).toBe(1);
    expect(getSidebarPendingCount("admin", "Ad Campaigns", counts)).toBe(3);
    expect(getSidebarPendingCount("admin", "Tours", counts)).toBe(5);
    expect(getSidebarPendingCount("admin", "Messages", counts)).toBe(7);
  });

  it("does not badge sections that are waiting on someone else", () => {
    expect(getSidebarPendingCount("seller", "My Listings", counts)).toBe(0);
    expect(getSidebarPendingCount("seller", "Promotions", counts)).toBe(0);
    expect(getSidebarPendingCount("buyer", "Applications", counts)).toBe(0);
    expect(getSidebarPendingCount("admin", "Dashboard", counts)).toBe(0);
  });

  it("maps partner and buyer response queues", () => {
    expect(getSidebarPendingCount("seller", "Tour Requests", counts)).toBe(5);
    expect(getSidebarPendingCount("seller", "Applications", counts)).toBe(6);
    expect(getSidebarPendingCount("agent", "Tours", counts)).toBe(5);
    expect(getSidebarPendingCount("buyer", "My Tours", counts)).toBe(5);
  });

  it("caps the visible badge at 99+", () => {
    expect(formatPendingBadge(0)).toBe("0");
    expect(formatPendingBadge(12)).toBe("12");
    expect(formatPendingBadge(99)).toBe("99");
    expect(formatPendingBadge(100)).toBe("99+");
  });
});
