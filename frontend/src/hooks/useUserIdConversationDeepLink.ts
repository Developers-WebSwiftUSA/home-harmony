import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { messageService } from "@/services/message.service";
import { getErrorMessage } from "@/lib/api-error";
import { Conversation } from "@/types/models";

type Options = {
  conversationsQueryKey: string[];
  messagesPath: string;
  selectedConversation: string | null;
  setSelectedConversation: (id: string | null) => void;
};

export const findSelectedConversation = (
  conversations: Conversation[],
  selectedId: string | null,
  fallback?: Conversation | null
) => {
  if (!selectedId) return null;
  const selected = String(selectedId);
  const fromList = conversations.find((c) => String(c._id) === selected) || null;
  if (fromList) return fromList;
  if (fallback && String(fallback._id) === selected) return fallback;
  return null;
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
  const [openedConversation, setOpenedConversation] = useState<Conversation | null>(null);
  const queryKeyRef = useRef(conversationsQueryKey);
  queryKeyRef.current = conversationsQueryKey;

  useEffect(() => {
    if (!userIdParam || selectedConversation) return;

    let cancelled = false;

    messageService
      .getOrCreateConversation(userIdParam)
      .then((response) => {
        if (cancelled) return;
        const conversation = response.data;
        const conversationId = String(conversation?._id || "");
        if (!conversationId) {
          throw new Error("Could not open conversation");
        }
        setOpenedConversation(conversation);
        setSelectedConversation(conversationId);
        queryClient.setQueryData(queryKeyRef.current, (prev: { data?: Conversation[] } | undefined) => {
          const list = prev?.data || [];
          if (list.some((item) => String(item._id) === conversationId)) return prev;
          return { ...(prev || {}), data: [conversation, ...list] };
        });
        queryClient.invalidateQueries({ queryKey: queryKeyRef.current });
        navigate(`${messagesPath}?conversation=${encodeURIComponent(conversationId)}`, {
          replace: true,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(getErrorMessage(error) || "Could not open chat");
      });

    return () => {
      cancelled = true;
    };
  }, [userIdParam, selectedConversation, messagesPath, navigate, queryClient, setSelectedConversation]);

  return openedConversation;
};
