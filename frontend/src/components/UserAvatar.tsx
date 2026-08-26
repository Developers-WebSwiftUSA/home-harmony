import { cn } from "@/lib/utils";
import { getAvatarUrl, getUserInitials } from "@/lib/userDisplay";
import { User } from "@/types/models";

type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

type Props = {
  user?: User | null;
  size?: Size;
  className?: string;
};

export const UserAvatar = ({ user, size = "md", className }: Props) => {
  const avatarUrl = getAvatarUrl(user);
  const initials = getUserInitials(user);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={initials}
        className={cn(sizeClasses[size], "rounded-full object-cover border-2 border-border flex-shrink-0", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-full bg-primary flex items-center justify-center flex-shrink-0 border-2 border-border",
        className
      )}
    >
      <span className="text-primary-foreground font-bold">{initials}</span>
    </div>
  );
};
