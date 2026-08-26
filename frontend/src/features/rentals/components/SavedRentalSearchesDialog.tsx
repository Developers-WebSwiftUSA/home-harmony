import { useEffect, useState } from "react";
import { Bookmark, Trash2, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RentalFilters } from "@/features/rentals/types/rental.types";
import {
  deleteSavedRentalSearch,
  formatSavedSearchLabel,
  getSavedRentalSearches,
  SavedRentalSearch,
} from "@/features/rentals/lib/savedSearches";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad: (filters: RentalFilters) => void;
};

export const SavedRentalSearchesDialog = ({ open, onOpenChange, onLoad }: Props) => {
  const [searches, setSearches] = useState<SavedRentalSearch[]>([]);

  useEffect(() => {
    if (open) setSearches(getSavedRentalSearches());
  }, [open]);

  const handleDelete = (id: string) => {
    setSearches(deleteSavedRentalSearch(id));
  };

  const handleLoad = (filters: RentalFilters) => {
    onLoad(filters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            Saved searches
          </DialogTitle>
          <DialogDescription>
            Reload a previous rental search with one click.
          </DialogDescription>
        </DialogHeader>

        {searches.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No saved searches yet. Use &quot;Save search&quot; on the rentals page to store your filters.
          </p>
        ) : (
          <ul className="space-y-2">
            {searches.map((search) => (
              <li
                key={search.id}
                className="flex items-start gap-3 border border-border rounded-lg p-3 bg-card"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{search.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatSavedSearchLabel(search.filters)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Saved {new Date(search.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => handleLoad(search.filters)}
                    aria-label="Load search"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(search.id)}
                    aria-label="Delete search"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
};
