import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export function AgentLicenseActivationCard() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");

  const mutation = useMutation({
    mutationFn: () => userService.redeemAgentLicense(code.trim()),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries();
      toast.success("License activated — your agent dashboard is now unlocked.");
      setCode("");
    },
    onError: (err: Error & { message?: string }) => {
      toast.error(err.message || "Could not activate license");
    },
  });

  return (
    <div className="max-w-lg mx-auto bg-card border border-border rounded-xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-lg text-foreground">Agent license activation</h2>
          <p className="text-xs text-muted-foreground">One-time setup</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Your account is active. An administrator must generate an approval license code for you from the admin user
        review page. Enter that code below to unlock tours, clients, properties, and messaging.
      </p>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Approval license code</label>
      <Input
        placeholder="e.g. HTG-A1B2C3D4"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="font-mono mb-4"
        autoComplete="one-time-code"
      />
      <Button className="w-full" disabled={!code.trim() || mutation.isPending} onClick={() => mutation.mutate()}>
        {mutation.isPending ? "Verifying…" : "Activate license"}
      </Button>
    </div>
  );
}
