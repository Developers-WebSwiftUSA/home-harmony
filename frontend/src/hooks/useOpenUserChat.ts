import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { openUserChatUrl } from "@/lib/openUserChat";
import { getErrorMessage } from "@/lib/api-error";

export const useOpenUserChat = () => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);

  const openChat = async (userId: string, messagesBasePath: string) => {
    if (!userId) return;
    setIsPending(true);
    try {
      const url = await openUserChatUrl(userId, messagesBasePath);
      navigate(url);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Could not open chat");
    } finally {
      setIsPending(false);
    }
  };

  return { openChat, isPending };
};
