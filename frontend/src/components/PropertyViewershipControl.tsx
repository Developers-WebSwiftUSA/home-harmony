import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { propertyService } from "@/services/property.service";
import { Property } from "@/types/models";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  property: Property;
  queryKeys?: string[][];
  size?: "sm" | "default";
  className?: string;
};

export const PropertyViewershipControl = ({
  property,
  queryKeys = [["agent-properties"], ["agent-dashboard-properties"]],
  size = "sm",
  className,
}: Props) => {
  const queryClient = useQueryClient();
  const isVisible = property.viewershipEnabled !== false;
  const canToggle = property.status === "active";

  const mutation = useMutation({
    mutationFn: (enabled: boolean) => propertyService.setViewership(property._id, enabled),
    onSuccess: (response) => {
      toast.success(response.message || "Viewership updated");
      queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
    onError: (error: Error) => toast.error(error.message || "Could not update viewership"),
  });

  if (!canToggle) return null;

  return (
    <Button
      type="button"
      size={size}
      variant={isVisible ? "outline" : "secondary"}
      className={cn("gap-1.5", className)}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate(!isVisible)}
    >
      {mutation.isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isVisible ? (
        <EyeOff className="w-3.5 h-3.5" />
      ) : (
        <Eye className="w-3.5 h-3.5" />
      )}
      {isVisible ? "Pause viewership" : "Resume viewership"}
    </Button>
  );
};
