import { useMutation } from "@tanstack/react-query";
import { Ruler, Save } from "lucide-react";
import { useDistanceUnit } from "@/context/DistanceUnitContext";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { DistanceUnit } from "@/lib/distanceUnits";

export const DistanceUnitSettings = () => {
  const { unit, setUnit } = useDistanceUnit();
  const { user, updateUser } = useAuth();

  const saveMutation = useMutation({
    mutationFn: (distanceUnit: DistanceUnit) =>
      userService.update("me", { preferences: { distanceUnit } }),
    onSuccess: (response) => {
      updateUser(response.data);
      toast.success("Distance preference saved");
    },
  });

  const handleSave = () => {
    if (!user) {
      toast.success("Distance preference saved for this device");
      return;
    }
    saveMutation.mutate(unit);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Ruler className="w-5 h-5 text-primary" />
        <div>
          <h2 className="font-heading font-bold text-foreground">Distance Units</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose how search radius and map distances are displayed
          </p>
        </div>
      </div>

      <RadioGroup
        value={unit}
        onValueChange={(value) => setUnit(value as DistanceUnit)}
        className="space-y-3 mb-4"
      >
        <div className="flex items-center space-x-3 rounded-lg border border-border px-4 py-3">
          <RadioGroupItem value="miles" id="distance-miles" />
          <Label htmlFor="distance-miles" className="flex-1 cursor-pointer font-normal">
            <span className="font-medium text-foreground">Miles (mi)</span>
            <span className="block text-xs text-muted-foreground">Default for US listings</span>
          </Label>
        </div>
        <div className="flex items-center space-x-3 rounded-lg border border-border px-4 py-3">
          <RadioGroupItem value="km" id="distance-km" />
          <Label htmlFor="distance-km" className="flex-1 cursor-pointer font-normal">
            <span className="font-medium text-foreground">Kilometers (km)</span>
            <span className="block text-xs text-muted-foreground">Metric measurements</span>
          </Label>
        </div>
      </RadioGroup>

      <Button
        type="button"
        variant="outline"
        className="gap-2"
        onClick={handleSave}
        disabled={saveMutation.isPending}
      >
        <Save className="w-4 h-4" />
        {saveMutation.isPending ? "Saving..." : "Save preference"}
      </Button>
    </div>
  );
};
