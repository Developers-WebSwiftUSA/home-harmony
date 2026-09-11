import { useMemo, useState } from "react";
import { MapPin, Phone, Mail, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import heroBg from "@/assets/hero-bg.jpg";
import { userService } from "@/services/user.service";
import { UserAvatar } from "@/components/UserAvatar";
import { RatingStars } from "@/components/RatingStars";
import { getDisplayName } from "@/lib/userDisplay";
import { getAgentRating } from "@/lib/ratings";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";
import { User } from "@/types/models";

const ratingFilters = [
  { key: "all", label: "All ratings", min: 0 },
  { key: "5", label: "5 stars", min: 5 },
  { key: "4", label: "4+", min: 4 },
  { key: "3", label: "3+", min: 3 },
  { key: "2", label: "2+", min: 2 },
  { key: "1", label: "1+", min: 1 },
] as const;

const matchesSearch = (agent: User, term: string) => {
  if (!term) return true;
  const location = [agent.location?.city, agent.location?.state, agent.location?.country]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const specialty = (agent.agentProfile?.specialization || []).join(" ").toLowerCase();
  return (
    getDisplayName(agent).toLowerCase().includes(term) ||
    agent.email?.toLowerCase().includes(term) ||
    location.includes(term) ||
    specialty.includes(term)
  );
};

const Agents = () => {
  const [search, setSearch] = useState("");
  const [ratingKey, setRatingKey] = useState("all");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["public-agents"],
    queryFn: () => userService.listPublicAgents(),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const agents = data?.data || [];
  const minRating = ratingFilters.find((filter) => filter.key === ratingKey)?.min ?? 0;

  const filteredAgents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return agents.filter((agent) => {
      if (!matchesSearch(agent, term)) return false;
      if (ratingKey === "all") return true;
      const rating = getAgentRating(agent);
      return rating.count > 0 && rating.average >= minRating;
    });
  }, [agents, search, ratingKey, minRating]);

  const ratingTabs = ratingFilters.map((filter) => ({
    key: filter.key,
    label: filter.label,
    count:
      filter.key === "all"
        ? agents.length
        : agents.filter((agent) => {
            const rating = getAgentRating(agent);
            return rating.count > 0 && rating.average >= filter.min;
          }).length,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative py-16 md:py-20">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-secondary/85" />
        </div>
        <div className="relative z-10 container text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-dark-surface-foreground mb-4">
            Our Agents
          </h1>
          <p className="text-dark-surface-foreground/70">
            Browse every active agent, then search or filter by rating
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <div className="bg-card border border-border rounded-2xl p-4 md:p-5 mb-8">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, city, or specialty..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground">
              <Star className="w-4 h-4 text-primary" />
              Filter by rating
            </div>
            <DashboardTabPills
              variant="pill"
              tabs={ratingTabs}
              activeKey={ratingKey}
              onChange={setRatingKey}
            />
            <p className="text-xs text-muted-foreground mt-3">
              {isFetching && !isLoading ? "Refreshing from the database... · " : null}
              Showing {filteredAgents.length} of {agents.length} agent
              {agents.length === 1 ? "" : "s"}
            </p>
          </div>

          {isLoading ? (
            <p className="text-center text-sm text-muted-foreground">Loading agents...</p>
          ) : agents.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">No active agents yet.</p>
          ) : filteredAgents.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              No agents match that search or rating filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAgents.map((agent) => {
                const location = [agent.location?.city, agent.location?.state].filter(Boolean).join(", ");
                const specialization = agent.agentProfile?.specialization?.[0] || "Property Expert";
                const rating = getAgentRating(agent);
                const agentId = agent._id || agent.id;

                return (
                  <div
                    key={agentId}
                    className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-xl transition-shadow group"
                  >
                    <Link to={`/agents/${agentId}`} className="block">
                      <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 flex items-center justify-center bg-muted">
                        <UserAvatar user={agent} size="lg" className="w-28 h-28 text-2xl" />
                      </div>
                      <h3 className="font-heading font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                        {getDisplayName(agent)}
                      </h3>
                      <p className="text-sm text-primary font-medium mb-1">{specialization}</p>
                      {location && (
                        <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3">
                          <MapPin className="w-3 h-3" />
                          {location}
                        </p>
                      )}
                      <div className="flex items-center justify-center mb-4">
                        <RatingStars rating={rating} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">
                        {agent.assignedProperties || 0} Assigned Propert
                        {(agent.assignedProperties || 0) === 1 ? "y" : "ies"}
                      </p>
                    </Link>
                    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mb-4">
                      {agent.phone && (
                        <a
                          href={`tel:${agent.phone}`}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      )}
                      {agent.email && (
                        <a
                          href={`mailto:${agent.email}`}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Mail className="w-3 h-3" /> Email
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to={`/agents/${agentId}`} className="block">
                        <Button variant="outline" className="w-full" size="sm">
                          View Profile
                        </Button>
                      </Link>
                      <Link
                        to={`/contact-agent?agentId=${agentId}&propertyTitle=${encodeURIComponent("General inquiry")}`}
                        className="block"
                      >
                        <Button className="w-full" size="sm">
                          Contact
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Agents;
