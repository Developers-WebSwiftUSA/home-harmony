import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { UserAvatar } from "@/components/UserAvatar";
import { RatingStars } from "@/components/RatingStars";
import { getDisplayName } from "@/lib/userDisplay";
import { getAgentRating } from "@/lib/ratings";

const ExpertsSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["landing-agents"],
    queryFn: () => userService.listPublicAgents(),
  });

  const agents = (data?.data || []).slice(0, 3);

  return (
    <section className="section-padding bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Our Agents</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
              Meet Trusted Experts In Real
              <span className="block">Estate</span>
            </h2>
          </div>
          <Link to="/agents">
            <Button className="mt-4 md:mt-0 w-fit">View All Agents</Button>
          </Link>
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading agents...</p>
        ) : agents.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No active agents yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {agents.map((agent) => (
              <div key={agent._id || agent.id} className="text-center group">
                <div className="relative mb-4 mx-auto w-52 h-52 rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
                  <UserAvatar user={agent} size="lg" className="w-52 h-52 text-4xl rounded-2xl" />
                  {agent.agentProfile?.verified && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
                <h3 className="font-heading font-bold text-foreground text-lg">{getDisplayName(agent)}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {agent.agentProfile?.specialization?.[0] || "Property Expert"}
                </p>
                <div className="flex justify-center">
                  <RatingStars rating={getAgentRating(agent)} size="xs" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ExpertsSection;
