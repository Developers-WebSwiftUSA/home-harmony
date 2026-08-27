import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { passwordResetService, PasswordResetRequest } from "@/services/passwordReset.service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Eye, EyeOff, Copy, Mail } from "lucide-react";
import { liveQueryOptions } from "@/lib/liveQuery";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";

const AdminPasswordResets = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-password-resets"],
    queryFn: () => passwordResetService.list(),
    ...liveQueryOptions,
  });

  const allRequests: PasswordResetRequest[] = data?.data || [];
  const requests = useMemo(() => {
    if (!filterStatus) return allRequests;
    return allRequests.filter((request) => request.status === filterStatus);
  }, [allRequests, filterStatus]);

  const approveMutation = useMutation({
    mutationFn: (id: string) => passwordResetService.approve(id),
    onSuccess: (response) => {
      toast.success(response.message || "Password reset approved.");
      if (response.data?.newPassword) {
        setVisiblePasswords((prev) => ({
          ...prev,
          [response.data!._id]: true,
        }));
      }
      if (response.emailSent === false) {
        toast.info("Email was not sent. Copy the generated password below.");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-password-resets"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      passwordResetService.reject(id, reason),
    onSuccess: () => {
      toast.success("Password reset request rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-password-resets"] });
    },
  });

  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard");
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      completed: "bg-blue-100 text-blue-700",
    };
    return (
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Password Resets" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Password Reset Requests
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Review and manage password reset requests from users
        </p>

        <DashboardTabPills
          className="mb-6"
          activeKey={filterStatus || "all"}
          onChange={(key) => setFilterStatus(key === "all" ? "" : key)}
          tabs={[
            { key: "all", label: "All", count: allRequests.length },
            {
              key: "pending",
              label: "Pending",
              count: allRequests.filter((r) => r.status === "pending").length,
            },
            {
              key: "approved",
              label: "Approved",
              count: allRequests.filter((r) => r.status === "approved").length,
            },
            {
              key: "rejected",
              label: "Rejected",
              count: allRequests.filter((r) => r.status === "rejected").length,
            },
          ]}
        />

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading requests...</p>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {request.userId?.firstName} {request.userId?.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">{request.email}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          Role: {request.userId?.role}
                        </div>
                      </div>
                    </div>
                    {request.reason && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs text-foreground">
                        <strong>Reason:</strong> {request.reason}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-4">
                  <div>
                    <strong>Requested:</strong>{" "}
                    {new Date(request.requestedAt).toLocaleString()}
                  </div>
                  {request.reviewedAt && (
                    <div>
                      <strong>Reviewed:</strong>{" "}
                      {new Date(request.reviewedAt).toLocaleString()}
                    </div>
                  )}
                  {request.reviewedBy && (
                    <div>
                      <strong>Reviewed by:</strong> {request.reviewedBy.firstName}{" "}
                      {request.reviewedBy.lastName}
                    </div>
                  )}
                </div>

                {request.status === "approved" && request.newPassword && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-green-800 mb-1">
                          New Password Generated:
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-green-900">
                            {visiblePasswords[request._id]
                              ? request.newPassword
                              : "••••••••"}
                          </span>
                          <button
                            onClick={() =>
                              setVisiblePasswords((prev) => ({
                                ...prev,
                                [request._id]: !prev[request._id],
                              }))
                            }
                            className="p-1 hover:bg-green-100 rounded transition-colors"
                          >
                            {visiblePasswords[request._id] ? (
                              <EyeOff className="w-3.5 h-3.5 text-green-700" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-green-700" />
                            )}
                          </button>
                          <button
                            onClick={() => copyPassword(request.newPassword!)}
                            className="p-1 hover:bg-green-100 rounded transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5 text-green-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {request.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => approveMutation.mutate(request._id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1 text-destructive hover:text-destructive"
                      onClick={() => {
                        const reason = window.prompt("Rejection reason (optional):");
                        rejectMutation.mutate({ id: request._id, reason: reason || undefined });
                      }}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-bold text-foreground mb-2">
              No password reset requests found
            </h3>
            <p className="text-sm text-muted-foreground">
              {filterStatus
                ? `No ${filterStatus} requests at this time.`
                : "No password reset requests have been submitted yet."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPasswordResets;
