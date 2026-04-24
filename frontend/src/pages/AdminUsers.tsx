import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { userService } from "@/services/user.service";
import { passwordResetService } from "@/services/passwordReset.service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, UserRole } from "@/types/models";
import { KeyRound, Eye, EyeOff, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type RoleTab = "all" | "buyer" | "seller" | "agent";
type StatusBucket = "all" | "under" | "approved" | "rejected";

function isRejectedUser(u: User): boolean {
  return u.status === "suspended" || u.status === "inactive";
}

function isUnderApprovalUser(u: User): boolean {
  if (isRejectedUser(u)) return false;
  if (u.role === "agent") return u.agentProfile?.verified !== true;
  return u.status === "pending";
}

function isApprovedUser(u: User): boolean {
  if (isRejectedUser(u)) return false;
  if (isUnderApprovalUser(u)) return false;
  if (u.role === "agent")
    return u.agentProfile?.verified === true && (u.status || "active") === "active";
  return (u.status || "active") === "active";
}

function userBucket(u: User): Exclude<StatusBucket, "all"> {
  if (isRejectedUser(u)) return "rejected";
  if (isUnderApprovalUser(u)) return "under";
  if (isApprovedUser(u)) return "approved";
  return "approved";
}

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [roleTab, setRoleTab] = useState<RoleTab>("all");
  const [statusBucket, setStatusBucket] = useState<StatusBucket>("all");
  const [roleDraft, setRoleDraft] = useState<Record<string, UserRole>>({});
  const [statusDraft, setStatusDraft] = useState<Record<string, "active" | "inactive" | "pending" | "suspended">>({});
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => userService.list(),
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
    onSuccess: (data) => {
      if (data.data?.newPassword) {
        setResetPasswords((prev) => ({
          ...prev,
          [data.data!.userId]: data.data!.newPassword,
        }));
        setVisiblePasswords((prev) => ({
          ...prev,
          [data.data!.userId]: true,
        }));
        toast.success("Password reset. New password generated.");
      }
    },
  });

  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard");
  };

  const users = data?.data || [];

  const usersInRoleTab = useMemo(() => {
    if (roleTab === "all") return users;
    return users.filter((u) => u.role === roleTab);
  }, [users, roleTab]);

  const stats = useMemo(() => {
    const list = usersInRoleTab;
    return {
      total: list.length,
      under: list.filter(isUnderApprovalUser).length,
      approved: list.filter(isApprovedUser).length,
      rejected: list.filter(isRejectedUser).length,
    };
  }, [usersInRoleTab]);

  const tabCounts = useMemo(() => {
    const count = (role: RoleTab) => {
      if (role === "all") return users.length;
      return users.filter((u) => u.role === role).length;
    };
    return {
      all: count("all"),
      buyer: count("buyer"),
      seller: count("seller"),
      agent: count("agent"),
    };
  }, [users]);

  const displayedUsers = useMemo(() => {
    let list = usersInRoleTab;
    if (statusBucket === "all") return list;
    return list.filter((u) => userBucket(u) === statusBucket);
  }, [usersInRoleTab, statusBucket]);

  const roleTabLabel: Record<RoleTab, string> = {
    all: "All users",
    buyer: "Buyers",
    seller: "Sellers",
    agent: "Agents",
  };

  const bucketLabel: Record<StatusBucket, string> = {
    all: "All statuses",
    under: "Under approval",
    approved: "Approved",
    rejected: "Rejected",
  };

  const selectRoleTab = (tab: RoleTab) => {
    setRoleTab(tab);
    setStatusBucket("all");
  };

  const selectBucket = (bucket: StatusBucket) => {
    setStatusBucket(bucket);
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Users" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Users</h1>
        <p className="text-sm text-muted-foreground mb-6">Manage registered users by role and approval status</p>

        {/* Role categories — count on the right */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "buyer", "seller", "agent"] as RoleTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => selectRoleTab(tab)}
              className={cn(
                "flex min-w-[160px] flex-1 items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors sm:min-w-[180px] sm:flex-none",
                roleTab === tab
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-foreground hover:bg-muted/80"
              )}
            >
              <span>{roleTabLabel[tab]}</span>
              <span className="tabular-nums text-lg font-bold">{tabCounts[tab]}</span>
            </button>
          ))}
        </div>

        {/* Summary cards — match reference: Total, Under approval, Approved, Rejected */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => selectBucket("all")}
            className={cn(
              "rounded-xl border p-5 text-left transition-shadow hover:shadow-md",
              statusBucket === "all" ? "border-foreground/30 bg-card ring-2 ring-foreground/20" : "border-border bg-card"
            )}
          >
            <div className="text-3xl font-bold text-foreground tabular-nums">{stats.total}</div>
            <div className="mt-1 text-sm font-medium text-muted-foreground">Total</div>
          </button>
          <button
            type="button"
            onClick={() => selectBucket("under")}
            className={cn(
              "rounded-xl border p-5 text-left transition-shadow hover:shadow-md",
              statusBucket === "under"
                ? "border-amber-500 bg-amber-50 ring-2 ring-amber-300/60 dark:bg-amber-950/30"
                : "border-amber-300 bg-amber-50/90 dark:border-amber-800 dark:bg-amber-950/20"
            )}
          >
            <div className="text-3xl font-bold text-amber-900 tabular-nums dark:text-amber-200">{stats.under}</div>
            <div className="mt-1 text-sm font-medium text-amber-900/90 dark:text-amber-100/90">Under approval</div>
          </button>
          <button
            type="button"
            onClick={() => selectBucket("approved")}
            className={cn(
              "rounded-xl border p-5 text-left transition-shadow hover:shadow-md",
              statusBucket === "approved"
                ? "border-green-600 bg-green-50 ring-2 ring-green-300/60 dark:bg-green-950/30"
                : "border-green-300 bg-green-50/90 dark:border-green-800 dark:bg-green-950/20"
            )}
          >
            <div className="text-3xl font-bold text-green-900 tabular-nums dark:text-green-200">{stats.approved}</div>
            <div className="mt-1 text-sm font-medium text-green-900/90 dark:text-green-100/90">Approved</div>
          </button>
          <button
            type="button"
            onClick={() => selectBucket("rejected")}
            className={cn(
              "rounded-xl border p-5 text-left transition-shadow hover:shadow-md",
              statusBucket === "rejected"
                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-300/60 dark:bg-blue-950/30"
                : "border-blue-300 bg-blue-50/90 dark:border-blue-800 dark:bg-blue-950/20"
            )}
          >
            <div className="text-3xl font-bold text-blue-900 tabular-nums dark:text-blue-200">{stats.rejected}</div>
            <div className="mt-1 text-sm font-medium text-blue-900/90 dark:text-blue-100/90">Rejected</div>
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {roleTabLabel[roleTab]}
              <span className="mx-2 text-muted-foreground">·</span>
              <span className="font-normal text-muted-foreground">{bucketLabel[statusBucket]}</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              {roleTab === "agent"
                ? "Agents under approval have not yet entered their admin-issued license code."
                : "Under approval includes accounts with status pending."}
            </p>
          </div>
          <div className="text-sm font-semibold tabular-nums text-foreground">{displayedUsers.length} in list</div>
        </div>

        {isLoading ? <p className="text-sm text-muted-foreground mb-4">Loading users...</p> : null}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground">Status</th>
                {roleTab === "agent" ? (
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground">License</th>
                ) : null}
                <th className="px-4 py-3 text-left text-xs text-muted-foreground">Password</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={roleTab === "agent" ? 7 : 6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No users in this view. Try another tab or status card.
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => (
                  <tr key={user._id || user.id} className="border-t border-border">
                    <td className="px-4 py-3 text-sm text-foreground">
                      {`${user.firstName || ""} ${user.lastName || ""}`.trim() || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 text-sm capitalize text-foreground">
                      <select
                        value={roleDraft[user._id || user.id || ""] || user.role}
                        onChange={(e) =>
                          setRoleDraft((prev) => ({
                            ...prev,
                            [user._id || user.id || ""]: e.target.value as UserRole,
                          }))
                        }
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                      >
                        <option value="buyer">buyer</option>
                        <option value="seller">seller</option>
                        <option value="agent">agent</option>
                        <option value="admin">admin</option>
                      </select>
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
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs capitalize"
                      >
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                        <option value="pending">pending</option>
                        <option value="suspended">suspended</option>
                      </select>
                    </td>
                    {roleTab === "agent" ? (
                      <td className="px-4 py-3 text-xs">
                        {user.agentProfile?.verified ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800 dark:bg-green-950 dark:text-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                            Awaiting code
                          </span>
                        )}
                      </td>
                    ) : null}
                    <td className="px-4 py-3 text-sm">
                      {resetPasswords[user._id || user.id || ""] ? (
                        <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
                          <span className="font-mono text-xs text-foreground">
                            {visiblePasswords[user._id || user.id || ""]
                              ? resetPasswords[user._id || user.id || ""]
                              : "••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setVisiblePasswords((prev) => ({
                                ...prev,
                                [user._id || user.id || ""]: !prev[user._id || user.id || ""],
                              }))
                            }
                            className="rounded p-1 transition-colors hover:bg-card"
                          >
                            {visiblePasswords[user._id || user.id || ""] ? (
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyPassword(resetPasswords[user._id || user.id || ""])}
                            className="rounded p-1 transition-colors hover:bg-card"
                          >
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">••••••••</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
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
                          className="gap-1 text-xs"
                          onClick={() => {
                            if (window.confirm(`Reset password for ${user.email}?`)) {
                              resetPasswordMutation.mutate(user._id || user.id || "");
                            }
                          }}
                          disabled={resetPasswordMutation.isPending}
                        >
                          <KeyRound className="h-3.5 w-3.5" /> Reset
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
