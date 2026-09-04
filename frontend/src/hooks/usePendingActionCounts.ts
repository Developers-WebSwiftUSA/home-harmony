import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { liveQueryOptions } from "@/lib/liveQuery";
import { pendingActionsService, PendingActionCounts } from "@/services/pendingActions.service";

const emptyCounts: PendingActionCounts = {
  properties: 0,
  users: 0,
  passwordResets: 0,
  adCampaigns: 0,
  tours: 0,
  applications: 0,
  messages: 0,
};

export const PENDING_ACTIONS_QUERY_KEY = ["pending-actions"] as const;

export const usePendingActionCounts = () => {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PENDING_ACTIONS_QUERY_KEY,
    queryFn: pendingActionsService.get,
    enabled: isAuthenticated,
    ...liveQueryOptions,
  });

  useEffect(() => {
    if (!socket) return;
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: PENDING_ACTIONS_QUERY_KEY });
    };
    socket.on("notification", refresh);
    socket.on("new-message", refresh);
    socket.on("tour-updated", refresh);
    socket.on("rental-application", refresh);
    socket.on("pending-actions-updated", refresh);
    return () => {
      socket.off("notification", refresh);
      socket.off("new-message", refresh);
      socket.off("tour-updated", refresh);
      socket.off("rental-application", refresh);
      socket.off("pending-actions-updated", refresh);
    };
  }, [socket, queryClient]);

  return query.data?.data || emptyCounts;
};
