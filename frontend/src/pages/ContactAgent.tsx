import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getUserId } from "@/lib/userDisplay";
import {
  buildLoginForAgentChat,
  buildUserChatPath,
  getMessagesPathForRole,
} from "@/lib/chatRoutes";

const ContactAgent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, isLoading } = useAuth();
  const agentId = searchParams.get("agentId");
  const propertyId = searchParams.get("propertyId");

  useEffect(() => {
    if (isLoading) return;

    if (!agentId && !propertyId) {
      navigate("/agents", { replace: true });
      return;
    }

    if (!isAuthenticated) {
      if (propertyId) {
        navigate(`/login?chatProperty=${encodeURIComponent(propertyId)}`, { replace: true });
        return;
      }
      navigate(buildLoginForAgentChat(agentId!), { replace: true });
      return;
    }

    if (propertyId && user?.role === "buyer") {
      navigate(`/buyer/messages?propertyId=${encodeURIComponent(propertyId)}`, { replace: true });
      return;
    }

    if (agentId) {
      if (getUserId(user) === String(agentId)) {
        toast.info("You cannot start a chat with yourself.");
        navigate(getMessagesPathForRole(user?.role), { replace: true });
        return;
      }
      navigate(buildUserChatPath(agentId, user?.role), { replace: true });
      return;
    }

    navigate(getMessagesPathForRole(user?.role), { replace: true });
  }, [isLoading, isAuthenticated, user, agentId, propertyId, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Opening chat...</p>
    </div>
  );
};

export default ContactAgent;
