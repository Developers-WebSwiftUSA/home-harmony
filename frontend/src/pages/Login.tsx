import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/models";

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
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

  const redirectByRole = (nextRole?: string) => {
    const roleToUse = nextRole || role;
    if (roleToUse === "admin") navigate("/admin");
    else if (roleToUse === "seller") navigate("/seller");
    else if (roleToUse === "agent") navigate("/agent");
    else navigate("/buyer");
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
        });
        redirectByRole(user.role);
      } else {
        const user = await login(form.email, form.password);
        redirectByRole(user.role);
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
