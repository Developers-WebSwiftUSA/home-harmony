import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/types/models";

function initials(user: User | null | undefined): string {
  if (!user) return "?";
  const a = (user.firstName?.[0] || "").toUpperCase();
  const b = (user.lastName?.[0] || "").toUpperCase();
  if (a && b) return `${a}${b}`;
  if (a) return a;
  if (b) return b;
  return (user.email?.[0] || "?").toUpperCase();
}

type Props = {
  user: User | null | undefined;
  className?: string;
  /** Tailwind size classes for the root, e.g. h-12 w-12 */
  sizeClassName?: string;
  /** Initial letter size inside the fallback */
  fallbackTextClassName?: string;
};

/**
 * Profile image only when `user.avatar` is set; otherwise initials (no stock photo).
 */
export function UserProfileAvatar({
  user,
  className,
  sizeClassName = "h-12 w-12",
  fallbackTextClassName = "text-sm",
}: Props) {
  const src = user?.avatar?.trim();
  return (
    <Avatar className={cn(sizeClassName, className)}>
      {src ? <AvatarImage src={src} alt="" className="object-cover" /> : null}
      <AvatarFallback
        className={cn(
          "bg-primary/15 font-heading font-semibold text-primary",
          fallbackTextClassName
        )}
      >
        {initials(user)}
      </AvatarFallback>
    </Avatar>
  );
}
