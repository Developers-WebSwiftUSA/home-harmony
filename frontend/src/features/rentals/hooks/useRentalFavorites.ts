import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoriteService } from "@/services/favorite.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const useRentalFavorite = (propertyId?: string) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["favorite-check", propertyId],
    queryFn: () => favoriteService.check(propertyId!),
    enabled: isAuthenticated && Boolean(propertyId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["favorite-check", propertyId] });
    queryClient.invalidateQueries({ queryKey: ["buyer-favorites-page"] });
    queryClient.invalidateQueries({ queryKey: ["saved-rentals"] });
  };

  const addMutation = useMutation({
    mutationFn: () => favoriteService.add(propertyId!),
    onSuccess: () => {
      invalidate();
      toast.success("Saved to your rentals");
    },
    onError: (error: Error) => toast.error(error.message || "Could not save rental"),
  });

  const removeMutation = useMutation({
    mutationFn: () => favoriteService.removeByProperty(propertyId!),
    onSuccess: () => {
      invalidate();
      toast.success("Removed from saved rentals");
    },
    onError: (error: Error) => toast.error(error.message || "Could not remove rental"),
  });

  const toggle = () => {
    if (!isAuthenticated) {
      toast.error("Sign in to save rentals");
      return;
    }
    if (data?.isFavorited) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  return {
    isFavorited: data?.isFavorited ?? false,
    favoriteId: data?.data?._id,
    isLoading: isLoading || addMutation.isPending || removeMutation.isPending,
    toggle,
  };
};
