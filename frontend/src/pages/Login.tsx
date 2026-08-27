import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/models";
import { toast } from "sonner";
import { uploadService } from "@/services/upload.service";
import { userService } from "@/services/user.service";
import { cn } from "@/lib/utils";
import { buildUserChatPath, rewriteMessagesPathForRole } from "@/lib/chatRoutes";

const AVATAR_PRESETS = ["Felix", "Aneka", "Midnight", "Lucky", "Riley", "Sam", "Jordan", "Quinn"].map(
  (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
);

const roleHomePath = (role?: string) => {
  if (role === "admin") return "/admin";
  if (role === "seller") return "/seller";
  if (role === "agent") return "/agent";
  return "/buyer";
};

const isAllowedRedirect = (path: string, role?: string) => {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.startsWith("/admin")) return role === "admin";
  if (path.startsWith("/seller")) return role === "seller";
  if (path.startsWith("/agent")) return role === "agent";
  if (path.startsWith("/buyer")) return role === "buyer";
  return true;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, register, updateUser } = useAuth();
  const redirectTo = searchParams.get("redirect");
  const chatProperty = searchParams.get("chatProperty");
  const chatUser = searchParams.get("chatUser");
  const fromState = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const fromPath =
    fromState?.pathname != null
      ? `${fromState.pathname}${fromState.search || ""}`
      : null;
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>("buyer");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");

  const redirectByRole = (nextRole?: string) => {
    navigate(roleHomePath(nextRole || role));
  };

  const redirectAfterAuth = (nextRole?: string) => {
    if (chatUser) {
      navigate(buildUserChatPath(chatUser, nextRole));
      return;
    }

    if (chatProperty) {
      if (nextRole !== "buyer") {
        toast.error("Log in as a buyer to chat about this property");
        navigate(`/properties/${chatProperty}`);
        return;
      }
      navigate(`/buyer/messages?propertyId=${chatProperty}`);
      return;
    }

    const target = redirectTo || fromPath;
    if (target) {
      const messagesPath = rewriteMessagesPathForRole(target, nextRole);
      if (messagesPath) {
        navigate(messagesPath);
        return;
      }
      if (isAllowedRedirect(target, nextRole)) {
        navigate(target);
        return;
      }
      toast.info("That page isn't available for your account role.", {
        description: "Taking you to your dashboard instead.",
      });
    }
    redirectByRole(nextRole);
  };

  const generatedAvatar = useMemo(() => {
    const seed = encodeURIComponent(
      `${form.firstName} ${form.lastName}`.trim() || form.email || "user"
    );
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  }, [form.firstName, form.lastName, form.email]);

  const previewSrc = avatarPreview || selectedPreset || generatedAvatar;

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleAvatarFile = (file?: File) => {
    if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview("");
      return;
    }
    setAvatarFile(file);
    setSelectedPreset("");
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        const user = await register({
          email: form.email,
          password: form.password,
          role,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          avatar: avatarFile ? undefined : selectedPreset || undefined,
        });
        if (avatarFile) {
          try {
            const uploaded = await uploadService.uploadImage(avatarFile);
            if (uploaded.data?.url) {
              const updated = await userService.update("me", { avatar: uploaded.data.url });
              if (updated.data) updateUser(updated.data);
            }
          } catch {
            toast.error("Account created, but the profile photo could not be uploaded.");
          }
        }
        redirectAfterAuth(user.role);
      } else {
        const user = await login(form.email, form.password);
        redirectAfterAuth(user.role);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-lg">H</span>
            </div>
            <span className="font-heading text-xl font-bold text-foreground">
              House Tour <span className="text-primary">Guide</span>
            </span>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {isRegister ? "Create Your Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRegister ? "Join our real estate community" : "Sign in to your account"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="flex flex-col items-center gap-3 pb-2">
                  <div className="relative">
                    <img
                      src={previewSrc}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-border bg-muted"
                    />
                    <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-sm">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleAvatarFile(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-foreground">Profile photo</p>
                    <p className="text-[11px] text-muted-foreground">Optional — upload a picture or pick an avatar</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {AVATAR_PRESETS.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => {
                          handleAvatarFile();
                          setSelectedPreset(url);
                        }}
                        className={cn(
                          "w-9 h-9 rounded-full overflow-hidden border-2 transition-all",
                          selectedPreset === url ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-border"
                        )}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  {(avatarFile || selectedPreset) && (
                    <button
                      type="button"
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        handleAvatarFile();
                        setSelectedPreset("");
                      }}
                    >
                      Use default avatar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name</label>
                    <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2.5">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <input type="text" placeholder="John" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name</label>
                    <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2.5">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <input type="text" placeholder="Doe" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                  <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2.5">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">I am a</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["buyer", "seller", "agent"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 rounded-md text-xs font-medium capitalize transition-colors ${
                          role === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2.5">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <input type="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
              <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2.5">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" className="rounded border-border" /> Remember me
                </label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
            )}

            {error ? <p className="text-xs text-destructive">{error}</p> : null}

            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => setIsRegister(!isRegister)} className="text-primary font-medium hover:underline">
                {isRegister ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
