import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { userService } from "@/services/user.service";
import { passwordResetService } from "@/services/passwordReset.service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Save, KeyRound, Eye, EyeOff, Copy, Trash2, Mail, Phone, User, Star } from "lucide-react";
import { UserRole } from "@/types/models";
import { useAuth } from "@/context/AuthContext";
import { tourService } from "@/services/tour.service";
import { TourReviewsList } from "@/components/TourReviewsList";
import { getUserReviewSummary } from "@/lib/reviewStats";
import { formatRating, getAgentRating } from "@/lib/ratings";
import { RatingStars } from "@/components/RatingStars";

const AdminUserReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => userService.getById(id!),
    enabled: isAuthenticated && !!id,
  });

  const { data: passwordResetsData } = useQuery({
    queryKey: ["admin-user-password-resets", id],
    queryFn: () => passwordResetService.list("approved", id!),
    enabled: isAuthenticated && !!id,
  });

  const { data: reviewsData, isLoading: loadingReviews } = useQuery({
    queryKey: ["admin-user-reviews", id],
    queryFn: () => tourService.listReviews({ userId: id!, limit: 200 }),
    enabled: isAuthenticated && !!id,
  });

  const user = data?.data;
  const passwordResets = passwordResetsData?.data || [];
  const userReviews = reviewsData?.data || [];
  const reviewSummary = user ? getUserReviewSummary(userReviews, id!, user.role) : null;
  // Get the most recent approved password reset (they're already sorted by requestedAt descending)
  const latestPasswordReset = passwordResets.find((r) => r.status === "approved" && r.newPassword) || null;

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: (user?.role || "buyer") as UserRole,
    status: (user?.status || "active") as "active" | "inactive" | "pending" | "suspended",
  });

  const [resetPassword, setResetPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Update form when user loads
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: (user.role || "buyer") as UserRole,
        status: (user?.status || "active") as "active" | "inactive" | "pending" | "suspended",
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => userService.update(id!, payload),
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => passwordResetService.adminReset(id!),
    onSuccess: (data) => {
      if (data.data?.newPassword) {
        setResetPassword(data.data.newPassword);
        setShowPassword(true);
        toast.success("Password reset. New password generated.");
        queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
        queryClient.invalidateQueries({ queryKey: ["admin-user-password-resets", id] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => userService.remove(id!),
    onSuccess: () => {
      toast.success("User deleted");
      navigate("/admin/users");
    },
  });

  const copyPassword = () => {
    if (resetPassword) {
      navigator.clipboard.writeText(resetPassword);
      toast.success("Password copied to clipboard");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      role: form.role,
      status: form.status,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex">
        <DashboardSidebar active="Users" role="admin" />
        <main className="flex-1 ml-64 p-8">
          <p className="text-sm text-muted-foreground">Loading user...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted flex">
        <DashboardSidebar active="Users" role="admin" />
        <main className="flex-1 ml-64 p-8">
          <p className="text-sm text-muted-foreground">User not found</p>
          <Link to="/admin/users">
            <Button variant="outline" className="mt-4">
              Back to Users
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Users" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/users">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Review User</h1>
            <p className="text-sm text-muted-foreground">Edit and manage user details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Avatar */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading font-bold text-foreground mb-4">User Profile</h2>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">
                    {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground text-lg">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name</label>
                  <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                      className="flex-1 bg-transparent text-sm text-foreground outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name</label>
                  <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                      className="flex-1 bg-transparent text-sm text-foreground outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="flex-1 bg-transparent text-sm text-foreground outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="flex-1 bg-transparent text-sm text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        status: e.target.value as "active" | "inactive" | "pending" | "suspended",
                      }))
                    }
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground capitalize"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </form>

            {/* Tour Reviews */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Tour Reviews
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {reviewSummary && reviewSummary.count > 0
                      ? `${reviewSummary.count} ${reviewSummary.label}${
                          reviewSummary.average > 0
                            ? ` · ${formatRating(reviewSummary.average)} avg`
                            : ""
                        }`
                      : "No reviews linked to this user yet"}
                  </p>
                </div>
                {user.role === "agent" && (
                  <RatingStars rating={getAgentRating(user)} size="sm" />
                )}
              </div>
              <TourReviewsList
                tours={userReviews}
                isLoading={loadingReviews}
                emptyMessage="This user has no tour reviews yet."
              />
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Password Management */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading font-bold text-foreground mb-4">Password Management</h2>
              
              {/* Current Password (from latest reset) */}
              {latestPasswordReset?.newPassword && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-800 mb-2">Current Password (Last Reset):</p>
                  <p className="text-xs text-blue-700 mb-2">
                    Reset on {new Date(latestPasswordReset.reviewedAt || latestPasswordReset.requestedAt).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-blue-900 flex-1">
                      {showCurrentPassword ? latestPasswordReset.newPassword : "••••••••"}
                    </span>
                    <button
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4 text-blue-700" />
                      ) : (
                        <Eye className="w-4 h-4 text-blue-700" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(latestPasswordReset.newPassword!);
                        toast.success("Password copied to clipboard");
                      }}
                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4 text-blue-700" />
                    </button>
                  </div>
                </div>
              )}

              {/* New Password Reset */}
              {resetPassword ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-medium text-green-800 mb-2">New Password Generated:</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-green-900 flex-1">
                        {showPassword ? resetPassword : "••••••••"}
                      </span>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:bg-green-100 rounded transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-green-700" />
                        ) : (
                          <Eye className="w-4 h-4 text-green-700" />
                        )}
                      </button>
                      <button
                        onClick={copyPassword}
                        className="p-1 hover:bg-green-100 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-green-700" />
                      </button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setResetPassword("");
                      setShowPassword(false);
                      queryClient.invalidateQueries({ queryKey: ["admin-user-password-resets", id] });
                    }}
                  >
                    Clear
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    if (window.confirm(`Reset password for ${user?.email}?`)) {
                      resetPasswordMutation.mutate();
                    }
                  }}
                  disabled={resetPasswordMutation.isPending}
                >
                  <KeyRound className="w-4 h-4" /> Reset Password
                </Button>
              )}

              {!latestPasswordReset?.newPassword && !resetPassword && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  No password reset history available
                </p>
              )}
            </div>

            {/* User Info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading font-bold text-foreground mb-4">User Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">User ID:</span>
                  <p className="text-foreground font-mono text-xs">{user._id || user.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="text-foreground capitalize">{user.status || "active"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Role:</span>
                  <p className="text-foreground capitalize">{user.role}</p>
                </div>
                {user.avatar && (
                  <div>
                    <span className="text-muted-foreground">Avatar:</span>
                    <p className="text-foreground text-xs truncate">{user.avatar}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card border border-border rounded-xl p-6 border-destructive/20">
              <h2 className="font-heading font-bold text-destructive mb-4">Danger Zone</h2>
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive"
                onClick={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to delete user ${user.email}? This action cannot be undone.`
                    )
                  ) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" /> Delete User
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserReview;
