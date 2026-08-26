import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRentalFavorite } from "@/features/rentals/hooks/useRentalFavorites";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { buildLoginRedirect } from "@/lib/propertyRoutes";

type Props = {
  propertyId: string;
  className?: string;
};

export const RentalFavoriteButton = ({ propertyId, className }: Props) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorited, isLoading, toggle } = useRentalFavorite(propertyId);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate(buildLoginRedirect(`/rentals/${propertyId}`));
      return;
    }
    toggle();
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      className={cn(
        "h-9 w-9 rounded-full bg-background/90 backdrop-blur shadow-sm hover:bg-background",
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isFavorited ? "Remove from saved rentals" : "Save rental"}
    >
      <Heart
        className={cn("w-4 h-4", isFavorited ? "fill-red-500 text-red-500" : "text-foreground")}
      />
    </Button>
  );
};
