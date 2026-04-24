import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { uploadService } from "@/services/upload.service";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserProfileAvatar } from "@/components/user/UserProfileAvatar";
import { User, Mail, Phone, Save, Lock, Eye, EyeOff, Camera } from "lucide-react";

const AgentSettings = () => {
  const { user: authUser, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => authService.me(),
    enabled: !!authUser,
  });

  const user = data?.data || authUser;

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: (payload: any) => userService.update("me", payload),
    onSuccess: (data) => {
      toast.success("Profile updated successfully");
      updateUser(data.data);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  const avatarUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const up = await uploadService.uploadImage(file);
      const url = up.data?.url;
      if (!url) throw new Error("Upload did not return a URL");
      return userService.update("me", {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone,
        avatar: url,
      });
    },
    onSuccess: (data) => {
      toast.success("Profile photo updated");
      updateUser(data.data);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: () => {
      toast.error("Could not upload image. Try a smaller JPG or PNG.");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.updatePassword(currentPassword, newPassword),
    onSuccess: (data) => {
      toast.success("Password updated successfully");
      updateUser(data.data.user, data.data.token);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Settings" role="agent" />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Settings</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your profile and account settings
        </p>

        <div className="space-y-6 max-w-3xl">
          {/* Profile Settings */}
          <form onSubmit={handleProfileSubmit} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-foreground">Profile Information</h2>
            </div>

            <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
              <UserProfileAvatar user={user} sizeClassName="h-20 w-20" fallbackTextClassName="text-lg" />
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your photo appears only after you add one here. Until then, others see your initials.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) avatarUploadMutation.mutate(file);
                  }}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={avatarUploadMutation.isPending}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                    {avatarUploadMutation.isPending ? "Uploading…" : user?.avatar ? "Change photo" : "Add profile photo"}
                  </Button>
                  {user?.avatar ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      disabled={avatarUploadMutation.isPending}
                      onClick={() => {
                        profileMutation.mutate({
                          ...profileForm,
                          avatar: "",
                        });
                      }}
                    >
                      Remove photo
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" disabled={profileMutation.isPending} className="gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </div>
          </form>

          {/* Password Change */}
          <form onSubmit={handlePasswordSubmit} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-foreground">Change Password</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    className="w-full border border-border rounded-md px-3 py-2.5 pr-10 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    className="w-full border border-border rounded-md px-3 py-2.5 pr-10 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="w-full border border-border rounded-md px-3 py-2.5 pr-10 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" variant="outline" disabled={passwordMutation.isPending} className="gap-2">
                <Lock className="w-4 h-4" /> Update Password
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AgentSettings;
