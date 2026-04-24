import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { passwordResetService } from "@/services/passwordReset.service";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await passwordResetService.requestReset(email, reason);
      toast.success("Password reset request submitted successfully");
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
          </div>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
              Request Submitted
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Your password reset request has been submitted successfully. An admin will review your request and you will receive an email with your new password once approved.
            </p>
            <Link to="/login">
              <Button variant="outline">Back to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-heading font-bold text-foreground">Forgot Password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Request a password reset. An admin will review your request.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2.5">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Reason (optional)
              </label>
              <textarea
                rows={3}
                placeholder="Please explain why you need to reset your password..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none resize-none"
              />
            </div>

            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
