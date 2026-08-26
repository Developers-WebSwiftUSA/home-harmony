import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapRadiusSearchPicker } from "@/components/MapRadiusSearchPicker";
import { MapSearchArea, hasMapSearchCenter, DEFAULT_MAP_SEARCH_RADIUS_MILES } from "@/lib/mapSearch";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: MapSearchArea;
  onApply: (value: MapSearchArea) => void;
  title?: string;
  description?: string;
};

export const MapSearchDialog = ({
  open,
  onOpenChange,
  value,
  onApply,
  title = "Search by map",
  description = "Search for a place or click the map to choose an area. Optionally set a radius, then apply to filter listings.",
}: Props) => {
  const [draft, setDraft] = useState<MapSearchArea>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const handleApply = () => {
    if (!hasMapSearchCenter(draft)) {
      toast.error("Select a location on the map first.");
      return;
    }
    const withRadius: MapSearchArea = {
      ...draft,
      radiusMiles:
        draft.radiusMiles != null && draft.radiusMiles > 0
          ? draft.radiusMiles
          : DEFAULT_MAP_SEARCH_RADIUS_MILES,
    };
    onApply(withRadius);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <MapRadiusSearchPicker
          value={draft}
          onChange={setDraft}
          className="border-0 p-0 shadow-none bg-transparent"
          mapHeightClassName="h-72"
          title=""
          description=""
        />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply map search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
