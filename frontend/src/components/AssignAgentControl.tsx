import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AssignAgentSelect } from "./AssignAgentSelect";
import { propertyService } from "@/services/property.service";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { getDisplayName } from "@/lib/userDisplay";
import { User } from "@/types/models";

type Props = {
  propertyId: string;
  currentAgent?: User | string | null;
  compact?: boolean;
};

const resolveAgentId = (agent?: User | string | null) => {
  if (!agent) return "";
  if (typeof agent === "string") return agent;
  return agent._id || agent.id || "";
};

export const AssignAgentControl = ({ propertyId, currentAgent, compact }: Props) => {
  const [agentId, setAgentId] = useState(resolveAgentId(currentAgent));
  const queryClient = useQueryClient();

  useEffect(() => {
    setAgentId(resolveAgentId(currentAgent));
  }, [currentAgent]);

  const mutation = useMutation({
    mutationFn: (nextAgentId: string | null) => propertyService.assignAgent(propertyId, nextAgentId),
    onSuccess: () => {
      toast.success("Agent assignment updated");
      queryClient.invalidateQueries({ queryKey: ["admin-property", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
      queryClient.invalidateQueries({ queryKey: ["agent-properties"] });
      queryClient.invalidateQueries({ queryKey: ["agent-dashboard-properties"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to assign agent"),
  });

  const currentId = resolveAgentId(currentAgent);
  const hasChanges = agentId !== currentId;
  const agentUser = typeof currentAgent === "object" && currentAgent ? currentAgent : null;

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {!compact && agentUser && (
        <p className="text-xs text-muted-foreground">
          Current: {getDisplayName(agentUser)} ({agentUser.email})
        </p>
      )}
      <AssignAgentSelect value={agentId} onChange={setAgentId} disabled={mutation.isPending} />
      <Button
        size="sm"
        onClick={() => mutation.mutate(agentId || null)}
        disabled={mutation.isPending || !hasChanges}
      >
        {mutation.isPending ? "Saving..." : "Save Assignment"}
      </Button>
    </div>
  );
};
