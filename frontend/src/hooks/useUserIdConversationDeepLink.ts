import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { messageService } from "@/services/message.service";
import { getErrorMessage } from "@/lib/api-error";

type Options = {
  conversationsQueryKey: string[];
  messagesPath: string;
  selectedConversation: string | null;
  setSelectedConversation: (id: string | null) => void;
};

/** Resolves ?userId= to an existing or new conversation and selects that chat. */
export const useUserIdConversationDeepLink = ({
  conversationsQueryKey,
  messagesPath,
  selectedConversation,
  setSelectedConversation,
}: Options) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userIdParam = searchParams.get("userId");
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userIdParam) {
      handledRef.current = null;
      return;
    }
    if (selectedConversation || handledRef.current === userIdParam) return;

    handledRef.current = userIdParam;
    let cancelled = false;

    messageService
      .getOrCreateConversation(userIdParam)
      .then((response) => {
        if (cancelled) return;
        const conversationId = String(response.data._id || response.data.id || "");
        if (!conversationId) {
          throw new Error("Could not open conversation");
        }
        setSelectedConversation(conversationId);
        queryClient.invalidateQueries({ queryKey: conversationsQueryKey });
        navigate(`${messagesPath}?conversation=${encodeURIComponent(conversationId)}`, {
          replace: true,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        handledRef.current = null;
        toast.error(getErrorMessage(error) || "Could not open chat");
      });

    return () => {
      cancelled = true;
    };
  }, [
    userIdParam,
    selectedConversation,
    conversationsQueryKey,
    messagesPath,
    navigate,
    queryClient,
    setSelectedConversation,
  ]);
};
