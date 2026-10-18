import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserCheck, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssignAgentSelect } from "@/components/AssignAgentSelect";
import { agentRequestService } from "@/services/agentRequest.service";
import { AgentAssignmentRequest, AgentAssignmentRequestStatus } from "@/types/models";
import { getDisplayName, getUserId } from "@/lib/userDisplay";
import { liveQueryOptions } from "@/lib/liveQuery";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusStyles: Record<AgentAssignmentRequestStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-muted text-muted-foreground",
};

type PillKey = "all" | "pending" | "approved" | "rejected";

const propertyTitle = (request: AgentAssignmentRequest) => {
  if (typeof request.propertyId === "object" && request.propertyId) {
    return request.propertyId.title || "Listing";
  }
  return "Listing";
};

const propertyIdOf = (request: AgentAssignmentRequest) => {
  if (typeof request.propertyId === "object" && request.propertyId) {
    return request.propertyId._id || "";
  }
  return String(request.propertyId || "");
};

const sellerLabel = (request: AgentAssignmentRequest) => {
  if (typeof request.sellerId === "object" && request.sellerId) {
    return getDisplayName(request.sellerId);
  }
  return "Seller";
};

const agentLabel = (agent: AgentAssignmentRequest["preferredAgentId"]) => {
  if (!agent) return null;
  if (typeof agent === "object") return getDisplayName(agent);
  return "Agent";
};

const AdminAgentRequests = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = (searchParams.get("status") as PillKey) || "all";
  const [selected, setSelected] = useState<AgentAssignmentRequest | null>(null);
  const [reviewMode, setReviewMode] = useState<"approve" | "reject" | null>(null);
  const [agentId, setAgentId] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-agent-requests"],
    queryFn: () => agentRequestService.list({ limit: 500 }),
    ...liveQueryOptions,
  });

  const requests = data?.data || [];
  const stats = {
    all: requests.length,
    pending: requests.filter((item) => item.status === "pending").length,
    approved: requests.filter((item) => item.status === "approved").length,
    rejected: requests.filter((item) => item.status === "rejected").length,
  };

  const visible = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter((item) => item.status === statusFilter);
  }, [requests, statusFilter]);

  const pills: { key: PillKey; label: string; value: string; className: string; valueClass: string }[] = [
    {
      key: "all",
      label: "Total requests",
      value: String(stats.all),
      className: "bg-card border border-border",
      valueClass: "text-foreground",
    },
    {
      key: "pending",
      label: "Pending",
      value: String(stats.pending),
      className: "bg-yellow-500/10 border border-yellow-500/20",
      valueClass: "text-yellow-600",
    },
    {
      key: "approved",
      label: "Approved",
      value: String(stats.approved),
      className: "bg-green-500/10 border border-green-500/20",
      valueClass: "text-green-600",
    },
    {
      key: "rejected",
      label: "Rejected",
      value: String(stats.rejected),
      className: "bg-red-500/10 border border-red-500/20",
      valueClass: "text-red-600",
    },
  ];

  const setStatusFilter = (value: PillKey) => {
    const next = new URLSearchParams();
    if (value !== "all") next.set("status", value);
    setSearchParams(next, { replace: true });
  };

  const closeReview = () => {
    setSelected(null);
    setReviewMode(null);
    setAgentId("");
    setAdminNotes("");
    setRejectionReason("");
  };

  const openApprove = (request: AgentAssignmentRequest) => {
    const preferred =
      typeof request.preferredAgentId === "object" && request.preferredAgentId
        ? getUserId(request.preferredAgentId)
        : typeof request.preferredAgentId === "string"
          ? request.preferredAgentId
          : "";
    setSelected(request);
    setReviewMode("approve");
    setAgentId(preferred);
    setAdminNotes("");
    setRejectionReason("");
  };

  const openReject = (request: AgentAssignmentRequest) => {
    setSelected(request);
    setReviewMode("reject");
    setAgentId("");
    setAdminNotes("");
    setRejectionReason("");
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-agent-requests"] });
    queryClient.invalidateQueries({ queryKey: ["seller-agent-requests"] });
    queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
    queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    queryClient.invalidateQueries({ queryKey: ["admin-property"] });
    queryClient.invalidateQueries({ queryKey: ["agent-properties"] });
  };

  const approveMutation = useMutation({
    mutationFn: () =>
      agentRequestService.approve(selected!._id, {
        agentId: agentId || undefined,
        adminNotes: adminNotes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Agent assigned to listing");
      refresh();
      closeReview();
    },
    onError: (error: Error) => toast.error(error.message || "Could not approve request"),
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      agentRequestService.reject(selected!._id, {
        rejectionReason: rejectionReason.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Agent request rejected");
      refresh();
      closeReview();
    },
    onError: (error: Error) => toast.error(error.message || "Could not reject request"),
  });

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Agent Requests" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary" />
            Agent Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sellers request agents for their listings. Approve to assign an agent, or reject the request.
            Add new agents from{" "}
            <Link to="/admin/users?role=agent" className="text-primary hover:underline">
              Users
            </Link>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {pills.map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setStatusFilter(pill.key)}
              className={cn(
                "rounded-xl p-4 text-left transition-all cursor-pointer hover:opacity-90 border",
                pill.className,
                statusFilter === pill.key && "ring-2 ring-primary ring-offset-2 ring-offset-muted"
              )}
            >
              <div className={cn("text-2xl font-bold", pill.valueClass)}>{pill.value}</div>
              <div
                className={cn(
                  "text-sm",
                  pill.valueClass === "text-foreground" ? "text-muted-foreground" : pill.valueClass
                )}
              >
                {pill.label}
              </div>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-16 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading requests...
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
            No agent requests in this view.
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((request) => {
              const listingId = propertyIdOf(request);
              return (
                <div
                  key={request._id}
                  className="bg-card border border-border rounded-xl p-5 flex flex-wrap items-start justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading font-bold text-foreground">{propertyTitle(request)}</h3>
                      <span
                        className={cn(
                          "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize",
                          statusStyles[request.status]
                        )}
                      >
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Seller: {sellerLabel(request)}
                      {agentLabel(request.preferredAgentId)
                        ? ` · Preferred: ${agentLabel(request.preferredAgentId)}`
                        : " · No preferred agent"}
                    </p>
                    {request.assignedAgentId ? (
                      <p className="text-sm text-foreground">
                        Assigned: {agentLabel(request.assignedAgentId)}
                      </p>
                    ) : null}
                    {request.message ? (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{request.message}</p>
                    ) : null}
                    {request.rejectionReason ? (
                      <p className="text-xs text-destructive mt-1">Reason: {request.rejectionReason}</p>
                    ) : null}
                    <p className="text-[11px] text-muted-foreground">
                      {request.createdAt ? new Date(request.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {listingId ? (
                      <Link to={`/admin/properties/${listingId}`}>
                        <Button size="sm" variant="outline">
                          View listing
                        </Button>
                      </Link>
                    ) : null}
                    {request.status === "pending" ? (
                      <>
                        <Button size="sm" className="gap-1" onClick={() => openApprove(request)}>
                          <CheckCircle2 className="w-4 h-4" />
                          Approve & assign
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => openReject(request)}>
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={Boolean(selected && reviewMode)} onOpenChange={(next) => !next && closeReview()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {reviewMode === "approve" ? "Approve & assign agent" : "Reject agent request"}
            </DialogTitle>
            <DialogDescription>
              {selected ? `${propertyTitle(selected)} · ${sellerLabel(selected)}` : ""}
            </DialogDescription>
          </DialogHeader>

          {reviewMode === "approve" && selected ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Assign agent
                </label>
                <AssignAgentSelect
                  value={agentId}
                  onChange={setAgentId}
                  propertyId={propertyIdOf(selected)}
                  currentAgent={
                    typeof selected.preferredAgentId === "object" ? selected.preferredAgentId : null
                  }
                  disabled={approveMutation.isPending}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Admin notes (optional)
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(event) => setAdminNotes(event.target.value)}
                  rows={3}
                  disabled={approveMutation.isPending}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeReview} disabled={approveMutation.isPending}>
                  Cancel
                </Button>
                <Button
                  disabled={approveMutation.isPending || !agentId}
                  onClick={() => approveMutation.mutate()}
                >
                  {approveMutation.isPending ? "Assigning..." : "Assign agent"}
                </Button>
              </div>
            </div>
          ) : null}

          {reviewMode === "reject" && selected ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Rejection reason (optional)
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  rows={3}
                  disabled={rejectMutation.isPending}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Admin notes (optional)
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(event) => setAdminNotes(event.target.value)}
                  rows={2}
                  disabled={rejectMutation.isPending}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeReview} disabled={rejectMutation.isPending}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={rejectMutation.isPending}
                  onClick={() => rejectMutation.mutate()}
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Reject request"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgentRequests;
