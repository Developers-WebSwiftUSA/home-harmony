import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { agentNeedsLicenseActivation } from "@/lib/agent";

/** Redirects unverified agents to the dashboard license activation screen. */
export function AgentRouteGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (agentNeedsLicenseActivation(user)) {
    return <Navigate to="/agent" replace />;
  }
  return <>{children}</>;
}
