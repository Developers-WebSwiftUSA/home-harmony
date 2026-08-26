import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { getDisplayName } from "@/lib/userDisplay";

type Props = {
  value: string;
  onChange: (agentId: string) => void;
  disabled?: boolean;
  className?: string;
};

export const AssignAgentSelect = ({ value, onChange, disabled, className }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["active-agents"],
    queryFn: () => userService.listActiveAgents(),
  });

  const agents = data?.data || [];

  return (
    <select
      value={value || "none"}
      onChange={(e) => onChange(e.target.value === "none" ? "" : e.target.value)}
      disabled={disabled || isLoading}
      className={
        className ||
        "w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
      }
    >
      <option value="none">No agent assigned</option>
      {agents.map((agent) => (
        <option key={agent._id || agent.id} value={agent._id || agent.id}>
          {getDisplayName(agent)} ({agent.email})
        </option>
      ))}
    </select>
  );
};
