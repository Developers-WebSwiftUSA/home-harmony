import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AssignAgentSelect } from "./AssignAgentSelect";
import { agentRequestService } from "@/services/agentRequest.service";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { User } from "@/types/models";
import { getDisplayName } from "@/lib/userDisplay";
import { liveQueryOptions } from "@/lib/liveQuery";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type Props = {
  propertyId: string;
  currentAgent?: User | string | null;
  compact?: boolean;
};

const resolveAgentLabel = (agent?: User | string | null) => {
  if (!agent) return null;
  if (typeof agent === "string") return "Assigned agent";
  return getDisplayName(agent);
};

export const RequestAgentControl = ({ propertyId, currentAgent, compact }: Props) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [preferredAgentId, setPreferredAgentId] = useState("");
  const [message, setMessage] = useState("");

  const { data } = useQuery({
    queryKey: ["seller-agent-requests", propertyId],
    queryFn: () => agentRequestService.list({ propertyId, limit: 20 }),
    ...liveQueryOptions,
  });

  const requests = data?.data || [];
  const pending = useMemo(
    () => requests.find((request) => request.status === "pending") || null,
    [requests]
  );
  const latest = requests[0] || null;
  const assignedLabel = resolveAgentLabel(currentAgent);
  const preferredLabel =
    pending?.preferredAgentId && typeof pending.preferredAgentId === "object"
      ? getDisplayName(pending.preferredAgentId)
      : null;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["seller-agent-requests", propertyId] });
    queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
    queryClient.invalidateQueries({ queryKey: ["admin-agent-requests"] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      agentRequestService.create({
        propertyId,
        preferredAgentId: preferredAgentId || null,
        message: message.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Agent request submitted for admin approval");
      setOpen(false);
      setPreferredAgentId("");
      setMessage("");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message || "Could not submit request"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => agentRequestService.cancel(id),
    onSuccess: () => {
      toast.success("Agent request cancelled");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message || "Could not cancel request"),
  });

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {assignedLabel ? (
        <p className="text-sm text-foreground">
          Assigned: <span className="font-medium">{assignedLabel}</span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">No agent assigned yet</p>
      )}

      {pending ? (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 space-y-2">
          <p className="text-xs font-medium text-yellow-700">Pending admin approval</p>
          {preferredLabel ? (
            <p className="text-xs text-muted-foreground">Preferred: {preferredLabel}</p>
          ) : (
            <p className="text-xs text-muted-foreground">No preferred agent — admin will assign one</p>
          )}
          {pending.message ? (
            <p className="text-xs text-muted-foreground line-clamp-2">{pending.message}</p>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate(pending._id)}
          >
            {cancelMutation.isPending ? "Cancelling..." : "Cancel request"}
          </Button>
        </div>
      ) : (
        <>
          {latest?.status === "rejected" ? (
            <p className="text-xs text-destructive">
              Last request was declined
              {latest.rejectionReason ? `: ${latest.rejectionReason}` : ""}
            </p>
          ) : null}
          <Button size="sm" variant="outline" className="text-xs" onClick={() => setOpen(true)}>
            {assignedLabel ? "Request different agent" : "Request an agent"}
          </Button>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Request an agent</DialogTitle>
            <DialogDescription>
              Submit a request for admin approval. You can suggest a preferred agent or leave it blank
              for the admin to assign.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Preferred agent (optional)
              </label>
              <AssignAgentSelect
                value={preferredAgentId}
                onChange={setPreferredAgentId}
                propertyId={propertyId}
                disabled={createMutation.isPending}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Note to admin (optional)
              </label>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Any preferences or context for the assignment..."
                rows={3}
                maxLength={1000}
                disabled={createMutation.isPending}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                Close
              </Button>
              <Button
                type="button"
                disabled={createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? "Submitting..." : "Submit request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
