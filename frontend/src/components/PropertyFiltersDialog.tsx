import { useEffect, useState } from "react";
import { Filter, RotateCcw, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PriceRangeSlider } from "@/components/PriceRangeSlider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_PROPERTY_FILTERS,
  PROPERTY_AMENITY_OPTIONS,
  PROPERTY_TYPES,
  PropertyFilters,
} from "@/features/properties/types/propertyFilters.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: PropertyFilters;
  onApply: (value: PropertyFilters) => void;
  onReset: () => void;
  activeFilterCount: number;
};

const bedBathOptions = ["Any", "1+", "2+", "3+", "4+", "5+"];
const ratingOptions = [
  { label: "Any rating", value: "any" },
  { label: "3+ stars", value: "3" },
  { label: "4+ stars", value: "4" },
  { label: "5 stars", value: "5" },
];

const PropertyFiltersForm = ({
  draft,
  onChange,
}: {
  draft: PropertyFilters;
  onChange: (next: PropertyFilters) => void;
}) => {
  const patch = (partial: Partial<PropertyFilters>) => onChange({ ...draft, ...partial });

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-xs mb-2 block">Keyword</Label>
        <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search by title or address..."
            value={draft.keyword}
            onChange={(e) => patch({ keyword: e.target.value })}
            className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Property type</Label>
        <Select value={draft.type} onValueChange={(value) => patch({ type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "All" ? "All types" : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Min price</Label>
          <Input
            type="number"
            min={0}
            value={draft.minPrice ?? ""}
            onChange={(e) => patch({ minPrice: e.target.value ? Number(e.target.value) : null })}
            placeholder="100000"
          />
        </div>
        <div>
          <Label className="text-xs">Max price</Label>
          <Input
            type="number"
            min={0}
            value={draft.maxPrice ?? ""}
            onChange={(e) => patch({ maxPrice: e.target.value ? Number(e.target.value) : null })}
            placeholder="2000000"
          />
        </div>
      </div>

      <PriceRangeSlider
        min={50000}
        max={5000000}
        step={25000}
        minValue={draft.minPrice}
        maxValue={draft.maxPrice}
        onChange={(minPrice, maxPrice) => patch({ minPrice, maxPrice })}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Bedrooms</Label>
          <Select
            value={draft.bedrooms?.toString() || "Any"}
            onValueChange={(value) =>
              patch({ bedrooms: value === "Any" ? null : parseInt(value.replace("+", ""), 10) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bedBathOptions.map((option) => (
                <SelectItem key={option} value={option === "Any" ? "Any" : option.replace("+", "")}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Bathrooms</Label>
          <Select
            value={draft.bathrooms?.toString() || "Any"}
            onValueChange={(value) =>
              patch({ bathrooms: value === "Any" ? null : parseInt(value.replace("+", ""), 10) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bedBathOptions.map((option) => (
                <SelectItem key={option} value={option === "Any" ? "Any" : option.replace("+", "")}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Min sqft</Label>
          <Input
            type="number"
            min={0}
            value={draft.minSqft ?? ""}
            onChange={(e) => patch({ minSqft: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div>
          <Label className="text-xs">Max sqft</Label>
          <Input
            type="number"
            min={0}
            value={draft.maxSqft ?? ""}
            onChange={(e) => patch({ maxSqft: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Pets</Label>
          <Select
            value={draft.petsAllowed}
            onValueChange={(value) => patch({ petsAllowed: value as PropertyFilters["petsAllowed"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="yes">Pets allowed</SelectItem>
              <SelectItem value="no">No pets</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Minimum rating</Label>
          <Select
            value={draft.minRating?.toString() || "any"}
            onValueChange={(value) =>
              patch({ minRating: value === "any" ? null : Number(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ratingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={draft.parking}
          onCheckedChange={(checked) => patch({ parking: Boolean(checked) })}
        />
        Parking
      </label>

      <div>
        <Label className="text-xs mb-2 block">Amenities</Label>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_AMENITY_OPTIONS.map((amenity) => {
            const checked = draft.amenities.includes(amenity);
            return (
              <label key={amenity} className="flex items-center gap-2 text-xs">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) => {
                    const next = value
                      ? [...draft.amenities, amenity]
                      : draft.amenities.filter((item) => item !== amenity);
                    patch({ amenities: next });
                  }}
                />
                {amenity}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const PropertyFiltersDialog = ({
  open,
  onOpenChange,
  value,
  onApply,
  onReset,
  activeFilterCount,
}: Props) => {
  const [draft, setDraft] = useState<PropertyFilters>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const handleApply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  const handleReset = () => {
    onReset();
    setDraft(DEFAULT_PROPERTY_FILTERS);
    onOpenChange(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="gap-2 shrink-0"
        onClick={() => onOpenChange(true)}
      >
        <Filter className="w-4 h-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Property filters
            </DialogTitle>
            <DialogDescription>
              Narrow results by rooms, price, pets, rating, and more. Apply when ready.
            </DialogDescription>
          </DialogHeader>

          <PropertyFiltersForm draft={draft} onChange={setDraft} />

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="gap-1.5 sm:mr-auto"
              onClick={handleReset}
              disabled={activeFilterCount === 0}
            >
              <RotateCcw className="w-4 h-4" />
              Reset all
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button type="button" onClick={handleApply} className="flex-1 sm:flex-none">
                Apply filters
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
