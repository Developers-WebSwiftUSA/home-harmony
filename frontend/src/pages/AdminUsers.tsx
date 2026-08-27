import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { userService } from "@/services/user.service";
import { passwordResetService } from "@/services/passwordReset.service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserRole } from "@/types/models";
import { KeyRound, Eye, EyeOff, Copy, Star, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { tourService } from "@/services/tour.service";
import { getUserReviewSummary } from "@/lib/reviewStats";
import { formatRating } from "@/lib/ratings";
import { liveQueryOptions } from "@/lib/liveQuery";
import { cn } from "@/lib/utils";

type UserPillKey = "all" | "buyer" | "seller" | "agent" | "approval" | "admin";

const isPendingAgent = (user: { role?: string; agentProfile?: { verified?: boolean } }) =>
  user.role === "agent" && !user.agentProfile?.verified;

const AdminUsers = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFilter = searchParams.get("role") || "all";
  const [roleDraft, setRoleDraft] = useState<Record<string, UserRole>>({});
  const [statusDraft, setStatusDraft] = useState<Record<string, "active" | "inactive" | "pending" | "suspended">>({});
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => userService.list({ limit: 500 }),
    enabled: isAuthenticated,
    ...liveQueryOptions,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["admin-all-reviews"],
    queryFn: () => tourService.listReviews({ limit: 500 }),
    enabled: isAuthenticated,
    ...liveQueryOptions,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => userService.update(id, payload),
    onSuccess: () => {
      toast.success("User updated");
      refresh();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      toast.success("User deleted");
      refresh();
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => passwordResetService.adminReset(userId),
    onSuccess: (response, userId) => {
      const password = response.data?.newPassword;
      if (password) {
        const ids = [userId, String(response.data?.userId || "")].filter(Boolean);
        setResetPasswords((prev) => {
          const next = { ...prev };
          ids.forEach((id) => {
            next[id] = password;
          });
          return next;
        });
        setVisiblePasswords((prev) => {
          const next = { ...prev };
          ids.forEach((id) => {
            next[id] = true;
          });
          return next;
        });
      }
      toast.success(response.message || "Password reset. New password generated.");
      if (response.emailSent === false) {
        toast.info("Email was not sent. Copy the password and share it with the user.");
      }
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => userService.verify(id),
    onSuccess: () => {
      toast.success("Agent approved");
      refresh();
    },
  });

  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard");
  };

  const users = data?.data || [];
  const allReviews = reviewsData?.data || [];
  const pillFilter = (["all", "buyer", "seller", "agent", "approval", "admin"].includes(roleFilter)
    ? roleFilter
    : "all") as UserPillKey;
  const visibleUsers =
    pillFilter === "all"
      ? users
      : pillFilter === "approval"
        ? users.filter(isPendingAgent)
        : users.filter((u) => u.role === pillFilter);
  const roleCounts = {
    all: users.length,
    buyer: users.filter((u) => u.role === "buyer").length,
    seller: users.filter((u) => u.role === "seller").length,
    agent: users.filter((u) => u.role === "agent").length,
    approval: users.filter(isPendingAgent).length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  const pills: { key: UserPillKey; label: string; count: number; className: string; valueClass: string }[] = [
    {
      key: "all",
      label: "All Users",
      count: roleCounts.all,
      className: "bg-card border border-border",
      valueClass: "text-foreground",
    },
    {
      key: "buyer",
      label: "Buyers",
      count: roleCounts.buyer,
      className: "bg-blue-500/10 border border-blue-500/20",
      valueClass: "text-blue-600",
    },
    {
      key: "seller",
      label: "Sellers",
      count: roleCounts.seller,
      className: "bg-green-500/10 border border-green-500/20",
      valueClass: "text-green-600",
    },
    {
      key: "agent",
      label: "Agents",
      count: roleCounts.agent,
      className: "bg-purple-500/10 border border-purple-500/20",
      valueClass: "text-purple-600",
    },
    {
      key: "approval",
      label: "Agent Approval",
      count: roleCounts.approval,
      className: "bg-yellow-500/10 border border-yellow-500/20",
      valueClass: "text-yellow-600",
    },
    {
      key: "admin",
      label: "Admins",
      count: roleCounts.admin,
      className: "bg-gray-500/10 border border-gray-500/20",
      valueClass: "text-gray-600",
    },
  ];

  const setRoleFilter = (value: UserPillKey) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("role");
    else next.set("role", value);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Users" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Users</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Manage all registered users. Click a status to filter. Approve new agents from the Agent Approval pill.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {pills.map((pill) => {
            const isSelected = pillFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setRoleFilter(pill.key)}
                className={cn(
                  "rounded-xl p-4 text-left transition-all cursor-pointer hover:opacity-90",
                  pill.className,
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-muted"
                )}
              >
                <div className={cn("text-2xl font-bold", pill.valueClass)}>{pill.count}</div>
                <div
                  className={cn(
                    "text-sm",
                    pill.valueClass === "text-foreground" ? "text-muted-foreground" : pill.valueClass
                  )}
                >
                  {pill.label}
                </div>
              </button>
            );
          })}
        </div>
        {isLoading ? <p className="text-sm text-muted-foreground mb-4">Loading users...</p> : null}
        {isError ? (
          <p className="text-sm text-destructive mb-4">
            {error instanceof Error ? error.message : "Failed to load users"}
          </p>
        ) : null}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground">Reviews</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground">Password</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => {
                const userId = user._id || user.id || "";
                const reviewSummary = getUserReviewSummary(allReviews, userId, user.role);
                return (
                <tr key={userId} className="border-t border-border">
                  <td className="px-4 py-3 text-sm text-foreground">
                    {`${user.firstName || ""} ${user.lastName || ""}`.trim() || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-foreground capitalize">
                    <select
                      value={roleDraft[user._id || user.id || ""] || user.role}
                      onChange={(e) =>
                        setRoleDraft((prev) => ({
                          ...prev,
                          [user._id || user.id || ""]: e.target.value as UserRole,
                        }))
                      }
                      className="border border-border rounded-md px-2 py-1 bg-background text-xs"
                    >
                      <option value="buyer">buyer</option>
                      <option value="seller">seller</option>
                      <option value="agent">agent</option>
                      <option value="admin">admin</option>
                    </select>
                    {isPendingAgent(user) && (
                      <div className="text-[11px] text-yellow-700 mt-1">Awaiting approval</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <select
                      value={statusDraft[user._id || user.id || ""] || user.status || "active"}
                      onChange={(e) =>
                        setStatusDraft((prev) => ({
                          ...prev,
                          [user._id || user.id || ""]: e.target.value as any,
                        }))
                      }
                      className="border border-border rounded-md px-2 py-1 bg-background text-xs capitalize"
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="pending">pending</option>
                      <option value="suspended">suspended</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {reviewSummary.count > 0 ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-foreground font-medium">{reviewSummary.count}</span>
                        {reviewSummary.average > 0 && (
                          <span className="text-muted-foreground">
                            ({formatRating(reviewSummary.average)} avg)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {resetPasswords[user._id || user.id || ""] ? (
                      <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
                        <span className="text-xs font-mono text-foreground">
                          {visiblePasswords[user._id || user.id || ""]
                            ? resetPasswords[user._id || user.id || ""]
                            : "••••••••"}
                        </span>
                        <button
                          onClick={() =>
                            setVisiblePasswords((prev) => ({
                              ...prev,
                              [user._id || user.id || ""]: !prev[user._id || user.id || ""],
                            }))
                          }
                          className="p-1 hover:bg-card rounded transition-colors"
                        >
                          {visiblePasswords[user._id || user.id || ""] ? (
                            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          onClick={() => copyPassword(resetPasswords[user._id || user.id || ""])}
                          className="p-1 hover:bg-card rounded transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">••••••••</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {isPendingAgent(user) && (
                        <Button
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => verifyMutation.mutate(userId)}
                          disabled={verifyMutation.isPending}
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Approve
                        </Button>
                      )}
                      <Link to={`/admin/users/${user._id || user.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Review / Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() =>
                          updateMutation.mutate({
                            id: user._id || user.id || "",
                            payload: {
                              role: roleDraft[user._id || user.id || ""] || user.role,
                              status: statusDraft[user._id || user.id || ""] || user.status || "active",
                            },
                          })
                        }
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1"
                        onClick={() => {
                          if (window.confirm(`Reset password for ${user.email}?`)) {
                            resetPasswordMutation.mutate(user._id || user.id || "");
                          }
                        }}
                        disabled={resetPasswordMutation.isPending}
                      >
                        <KeyRound className="w-3.5 h-3.5" /> Reset
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-destructive hover:text-destructive"
                        onClick={() => {
                          if (window.confirm(`Delete user ${user.email}?`)) {
                            deleteMutation.mutate(user._id || user.id || "");
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;

