import { useEffect, useState } from "react";
import { Filter, RotateCcw } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEFAULT_RENTAL_FILTERS,
  RENTAL_AMENITY_OPTIONS,
  RENTAL_PROPERTY_TYPES,
  RentalFilters,
} from "@/features/rentals/types/rental.types";

type Props = {
  filters: RentalFilters;
  onApply: (filters: RentalFilters) => void;
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

const RentalFiltersForm = ({
  draft,
  onChange,
}: {
  draft: RentalFilters;
  onChange: (next: RentalFilters) => void;
}) => {
  const patch = (partial: Partial<RentalFilters>) => onChange({ ...draft, ...partial });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Min price / mo</Label>
          <Input
            type="number"
            value={draft.minPrice ?? ""}
            onChange={(e) =>
              patch({ minPrice: e.target.value ? Number(e.target.value) : null })
            }
            placeholder="500"
          />
        </div>
        <div>
          <Label className="text-xs">Max price / mo</Label>
          <Input
            type="number"
            value={draft.maxPrice ?? ""}
            onChange={(e) =>
              patch({ maxPrice: e.target.value ? Number(e.target.value) : null })
            }
            placeholder="5000"
          />
        </div>
      </div>

      <PriceRangeSlider
        min={500}
        max={10000}
        step={100}
        minValue={draft.minPrice}
        maxValue={draft.maxPrice}
        label="Price range / mo"
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
            <SelectTrigger><SelectValue /></SelectTrigger>
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
            <SelectTrigger><SelectValue /></SelectTrigger>
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

      <div>
        <Label className="text-xs">Property type</Label>
        <Select
          value={draft.propertyType}
          onValueChange={(value) =>
            patch({ propertyType: value as RentalFilters["propertyType"] })
          }
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {RENTAL_PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Min sqft</Label>
          <Input
            type="number"
            value={draft.minSqft ?? ""}
            onChange={(e) =>
              patch({ minSqft: e.target.value ? Number(e.target.value) : null })
            }
          />
        </div>
        <div>
          <Label className="text-xs">Max sqft</Label>
          <Input
            type="number"
            value={draft.maxSqft ?? ""}
            onChange={(e) =>
              patch({ maxSqft: e.target.value ? Number(e.target.value) : null })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Pets</Label>
          <Select
            value={draft.petsAllowed}
            onValueChange={(value) =>
              patch({ petsAllowed: value as RentalFilters["petsAllowed"] })
            }
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
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
            <SelectTrigger><SelectValue /></SelectTrigger>
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

      <div>
        <Label className="text-xs">Laundry</Label>
        <Select
          value={draft.laundry}
          onValueChange={(value) => patch({ laundry: value as RentalFilters["laundry"] })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="in_unit">In-unit</SelectItem>
            <SelectItem value="shared">Shared</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Move-in date</Label>
        <Input
          type="date"
          value={draft.moveInDate}
          onChange={(e) => patch({ moveInDate: e.target.value })}
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={draft.furnished} onCheckedChange={(checked) => patch({ furnished: Boolean(checked) })} />
          Furnished
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={draft.parking} onCheckedChange={(checked) => patch({ parking: Boolean(checked) })} />
          Parking
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={draft.acceptsApplications}
            onCheckedChange={(checked) => patch({ acceptsApplications: Boolean(checked) })}
          />
          Accepts applications
        </label>
      </div>

      <div>
        <Label className="text-xs mb-2 block">Amenities</Label>
        <div className="grid grid-cols-2 gap-2">
          {RENTAL_AMENITY_OPTIONS.map((amenity) => {
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

export const RentalFilterBar = ({ filters, onApply, onReset, activeFilterCount }: Props) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<RentalFilters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const handleReset = () => {
    onReset();
    setDraft(DEFAULT_RENTAL_FILTERS);
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Filter className="w-4 h-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Rental filters
            </DialogTitle>
            <DialogDescription>
              Filter by rooms, price, pets, rating, amenities, and more.
            </DialogDescription>
          </DialogHeader>

          <RentalFiltersForm draft={draft} onChange={setDraft} />

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
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 sm:flex-none">
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
