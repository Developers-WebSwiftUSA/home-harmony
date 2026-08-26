import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPetPolicyShortLabel, PetPolicy } from "@/lib/petPolicy";

type Props = {
  policy?: PetPolicy | string | null;
  petFee?: number;
  className?: string;
  showIcon?: boolean;
};

export const PetPolicyBadge = ({ policy, petFee, className, showIcon = true }: Props) => {
  const label = getPetPolicyShortLabel(policy);
  if (!label) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full text-foreground",
        policy === "allowed" && "bg-green-500/10 text-green-700 dark:text-green-400",
        policy === "not_allowed" && "bg-red-500/10 text-red-700 dark:text-red-400",
        className
      )}
    >
      {showIcon && <PawPrint className="w-3 h-3" />}
      {label}
      {petFee != null && petFee > 0 ? ` · $${petFee}/mo` : ""}
    </span>
  );
};
