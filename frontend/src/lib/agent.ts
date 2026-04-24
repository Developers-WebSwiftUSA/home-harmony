import type { User } from "@/types/models";

/** Agent signed up but has not redeemed the admin-issued license code yet. */
export function agentNeedsLicenseActivation(user: User | null): boolean {
  return user?.role === "agent" && user?.agentProfile?.verified !== true;
}
