import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RentalSortOption } from "@/features/rentals/types/rental.types";

type Props = {
  value: RentalSortOption;
  onChange: (value: RentalSortOption) => void;
};

export const RentalSortSelect = ({ value, onChange }: Props) => (
  <Select value={value} onValueChange={(next) => onChange(next as RentalSortOption)}>
    <SelectTrigger className="w-[170px] h-9 bg-background">
      <SlidersHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
      <SelectValue placeholder="Sort" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="newest">Newest</SelectItem>
      <SelectItem value="price-asc">Price: Low to High</SelectItem>
      <SelectItem value="price-desc">Price: High to Low</SelectItem>
      <SelectItem value="relevance">Relevance</SelectItem>
    </SelectContent>
  </Select>
);
