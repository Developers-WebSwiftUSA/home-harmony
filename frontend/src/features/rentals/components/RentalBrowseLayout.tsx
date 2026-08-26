import { lazy, Suspense, useState } from "react";

import { Map, List } from "lucide-react";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { Button } from "@/components/ui/button";

import { Property } from "@/types/models";

import { RentalViewMode } from "@/features/rentals/types/rental.types";

import { RentalResultsPanel } from "@/features/rentals/components/RentalResultsPanel";

import { Skeleton } from "@/components/ui/skeleton";

import { useIsMobile } from "@/hooks/use-mobile";

import { cn } from "@/lib/utils";

import { MapSearchArea } from "@/lib/mapSearch";

import { MapBounds } from "@/features/rentals/lib/mapBoundsSearch";



const RentalMapView = lazy(() =>

  import("@/features/rentals/components/RentalMapView").then((m) => ({ default: m.RentalMapView }))

);



type Props = {

  properties: Property[];

  total?: number;

  isLoading?: boolean;

  isError?: boolean;

  viewMode: RentalViewMode;

  onViewModeChange: (mode: RentalViewMode) => void;

  locationLabel?: string;

  searchArea?: MapSearchArea | null;

  searchAsMapMoves?: boolean;

  onMapBoundsChange?: (bounds: MapBounds) => void;

};



export const RentalBrowseLayout = ({

  properties,

  total,

  isLoading,

  isError,

  viewMode,

  onViewModeChange,

  locationLabel,

  searchArea,

  searchAsMapMoves = false,

  onMapBoundsChange,

}: Props) => {

  const isMobile = useIsMobile();

  const [highlightedId, setHighlightedId] = useState<string | null>(null);



  const results = (

    <RentalResultsPanel

      properties={properties}

      total={total}

      isLoading={isLoading}

      isError={isError}

      layout={viewMode === "list" && !isMobile ? "list" : "grid"}

      highlightedId={highlightedId}

      onHighlight={setHighlightedId}

      locationLabel={locationLabel}

    />

  );



  const map = (

    <Suspense fallback={<Skeleton className="h-full w-full rounded-xl" />}>

      <RentalMapView

        properties={properties}

        highlightedId={highlightedId}

        onSelect={(property) => setHighlightedId(property._id)}

        searchArea={searchArea}

        searchAsMapMoves={searchAsMapMoves}

        onBoundsChange={onMapBoundsChange}

      />

    </Suspense>

  );



  if (isMobile) {

    return (

      <div className="flex flex-col gap-4 min-h-[70vh]">

        <div className="flex justify-center gap-2">

          <Button

            size="sm"

            variant={viewMode === "map" ? "default" : "outline"}

            className="gap-2"

            onClick={() => onViewModeChange("map")}

          >

            <Map className="w-4 h-4" /> Map

          </Button>

          <Button

            size="sm"

            variant={viewMode === "list" ? "default" : "outline"}

            className="gap-2"

            onClick={() => onViewModeChange("list")}

          >

            <List className="w-4 h-4" /> List

          </Button>

        </div>

        <div className={cn("min-h-[50vh]", viewMode === "map" ? "h-[50vh]" : "")}>

          {viewMode === "map" ? map : results}

        </div>

        {viewMode === "map" && <div className="min-h-[40vh]">{results}</div>}

      </div>

    );

  }



  if (viewMode === "list") {

    return <div className="min-h-[70vh] bg-card border border-border rounded-xl overflow-hidden">{results}</div>;

  }



  return (

    <div className="min-h-[75vh] border border-border rounded-xl overflow-hidden bg-card">

      <PanelGroup direction="horizontal">

        <Panel defaultSize={58} minSize={40}>

          <div className="h-[75vh] p-3">{map}</div>

        </Panel>

        <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/40 transition-colors" />

        <Panel defaultSize={42} minSize={30}>

          <div className="h-[75vh]">{results}</div>

        </Panel>

      </PanelGroup>

    </div>

  );

};

