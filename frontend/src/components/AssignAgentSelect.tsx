import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, MapPin, Search, UserMinus } from "lucide-react";
import { userService } from "@/services/user.service";
import { getDisplayName, getUserId } from "@/lib/userDisplay";
import { getAgentRating } from "@/lib/ratings";
import { User } from "@/types/models";
import { UserAvatar } from "@/components/UserAvatar";
import { RatingStars } from "@/components/RatingStars";
import { AgentProfileDialog } from "@/components/AgentProfileDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDistanceUnit } from "@/context/DistanceUnitContext";

type Props = {
  value: string;
  onChange: (agentId: string) => void;
  disabled?: boolean;
  className?: string;
  currentAgent?: User | string | null;
  propertyId?: string;
};

export const AssignAgentSelect = ({
  value,
  onChange,
  disabled,
  className,
  currentAgent,
  propertyId,
}: Props) => {
  const { formatDistance, unitShort } = useDistanceUnit();
  const [open, setOpen] = useState(false);
  const [detailsAgentId, setDetailsAgentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["active-agents", propertyId],
    queryFn: () => userService.listActiveAgents(propertyId),
    enabled: open,
  });

  const agents = data?.data || [];
  const selected =
    agents.find((agent) => getUserId(agent) === value) ||
    (typeof currentAgent === "object" && currentAgent && getUserId(currentAgent) === value
      ? currentAgent
      : null);

  const filteredAgents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return agents;
    return agents.filter((agent) => {
      const name = getDisplayName(agent).toLowerCase();
      const email = agent.email?.toLowerCase() || "";
      const specialty = agent.agentProfile?.specialization?.join(" ").toLowerCase() || "";
      const place = (
        agent.locationLabel ||
        agent.agentProfile?.preferredArea?.label ||
        [agent.location?.city, agent.location?.state].filter(Boolean).join(" ")
      ).toLowerCase();
      return name.includes(term) || email.includes(term) || specialty.includes(term) || place.includes(term);
    });
  }, [agents, search]);

  const selectAgent = (agentId: string) => {
    onChange(agentId);
    setOpen(false);
    setSearch("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={
          className ||
          "w-full flex items-center gap-3 border border-border rounded-xl px-3 py-2.5 text-left bg-background text-foreground hover:border-primary/40 hover:bg-muted/40 transition-colors disabled:opacity-60 disabled:pointer-events-none"
        }
      >
        {selected ? (
          <>
            <UserAvatar user={selected} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{getDisplayName(selected)}</p>
              <RatingStars rating={getAgentRating(selected)} size="xs" compact className="mt-0.5" />
            </div>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
              <UserMinus className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {open && isLoading ? "Loading agents..." : "Choose an agent"}
              </p>
              <p className="text-xs text-muted-foreground">Browse photos, ratings, and details</p>
            </div>
          </>
        )}
        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (detailsAgentId) return;
          setOpen(next);
          if (!next) setSearch("");
        }}
      >
        <DialogContent
          className="max-w-2xl sm:rounded-2xl p-0 gap-0 overflow-hidden"
          onPointerDownOutside={(event) => {
            if (detailsAgentId) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (detailsAgentId) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (detailsAgentId) event.preventDefault();
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-muted/40">
            <DialogTitle className="font-heading">Select an agent</DialogTitle>
            <DialogDescription>
              Agents in the same state as this listing appear first, then the nearest.
            </DialogDescription>
            <div className="relative pt-2">
              <Search className="absolute left-3 top-[1.375rem] w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, city, or specialty..."
                className="w-full border border-border rounded-lg pl-9 pr-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </DialogHeader>

          <div className="max-h-[62vh] overflow-y-auto p-4 space-y-3">
            <button
              type="button"
              onClick={() => selectAgent("")}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                !value
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-primary/30 hover:bg-muted/50"
              )}
            >
              <div className="w-14 h-14 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                <UserMinus className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-heading font-semibold text-foreground">No agent assigned</p>
                <p className="text-xs text-muted-foreground">Leave this listing unassigned</p>
              </div>
              {!value ? <Check className="w-4 h-4 text-primary flex-shrink-0" /> : null}
            </button>

            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-10">Loading agents...</p>
            ) : filteredAgents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                {search.trim() ? "No agents match that search." : "No active agents available."}
              </p>
            ) : (
              filteredAgents.map((agent, index) => {
                const agentId = getUserId(agent);
                const isSelected = agentId === value;
                const specialty = agent.agentProfile?.specialization?.[0] || "Property Expert";
                const placeLabel =
                  agent.locationLabel ||
                  agent.agentProfile?.preferredArea?.label ||
                  [agent.location?.city, agent.location?.state].filter(Boolean).join(", ");
                const showNearbyHeading = index === 0 && filteredAgents.some((item) => item.inPreferredArea || item.sameState);
                const firstOtherIndex = filteredAgents.findIndex((item) => !item.inPreferredArea && !item.sameState);
                const showOtherHeading = index === firstOtherIndex && firstOtherIndex > 0;

                return (
                  <div key={agentId}>
                    {showNearbyHeading ? (
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pt-1">
                        Suggested nearby
                      </p>
                    ) : null}
                    {showOtherHeading ? (
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pt-2">
                        Other agents
                      </p>
                    ) : null}
                  <div
                    className={cn(
                      "rounded-xl border bg-card p-4 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      <button
                        type="button"
                        onClick={() => selectAgent(agentId)}
                        className="flex items-start gap-3 min-w-0 flex-1 text-left"
                      >
                        <UserAvatar user={agent} size="lg" className="w-14 h-14 text-lg" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-heading font-semibold text-foreground truncate">
                              {getDisplayName(agent)}
                            </p>
                            {isSelected ? <Check className="w-4 h-4 text-primary flex-shrink-0" /> : null}
                          </div>
                          <p className="text-xs text-primary font-medium mb-1.5">{specialty}</p>
                          <RatingStars rating={getAgentRating(agent)} size="xs" />
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {placeLabel ? (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {placeLabel}
                              </span>
                            ) : null}
                            {agent.distanceMiles != null ? (
                              <span className="text-xs font-medium text-foreground">
                                {agent.distanceMiles < 1
                                  ? `Under 1 ${unitShort} away`
                                  : `${formatDistance(agent.distanceMiles)} away`}
                              </span>
                            ) : null}
                            {agent.inPreferredArea ? (
                              <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                Preferred area
                              </span>
                            ) : agent.sameCity ? (
                              <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                Same city
                              </span>
                            ) : agent.sameState ? (
                              <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                Same state
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0 text-xs w-full sm:w-auto"
                        onClick={(event) => {
                          event.stopPropagation();
                          setDetailsAgentId(agentId);
                        }}
                      >
                        Show details
                      </Button>
                    </div>
                  </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AgentProfileDialog
        agentId={detailsAgentId}
        open={Boolean(detailsAgentId)}
        variant="brief"
        onOpenChange={(next) => {
          if (!next) setDetailsAgentId(null);
        }}
      />
    </>
  );
};
