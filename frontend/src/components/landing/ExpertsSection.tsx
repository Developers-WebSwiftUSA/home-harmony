import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { agentPublicService } from "@/services/agent.service";
import { UserProfileAvatar } from "@/components/user/UserProfileAvatar";
import type { PublicAgent, User } from "@/types/models";

function agentAsUser(a: PublicAgent): User {
  return {
    email: a.email || "",
    role: "agent",
    firstName: a.firstName,
    lastName: a.lastName,
    avatar: a.avatar,
  };
}

const ExpertsSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-agents", "landing"],
    queryFn: () => agentPublicService.list(),
  });

  const agents = (data?.data ?? []).slice(0, 3);

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
          <Button className="mt-4 md:mt-0 w-fit" asChild>
            <Link to="/login">Become an agent</Link>
          </Button>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8 max-w-4xl mx-auto">Loading agents…</p>
        ) : agents.length === 0 ? (
          <div className="text-center max-w-xl mx-auto space-y-4">
            <p className="text-muted-foreground">
              Verified agents will appear here once they join the platform.
            </p>
            <Button variant="outline" asChild>
              <Link to="/agents">View all agents</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {agents.map((agent) => {
              const fullName =
                [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim() ||
                agent.email ||
                "Agent";
              return (
                <div key={agent._id} className="text-center group">
                  <div className="relative mb-4 mx-auto w-52 h-52 rounded-2xl overflow-hidden flex items-center justify-center bg-muted">
                    <UserProfileAvatar
                      user={agentAsUser(agent)}
                      sizeClassName="h-52 w-52 rounded-2xl"
                      fallbackTextClassName="text-3xl"
                    />
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center pointer-events-none">
                      <span className="text-primary-foreground text-xs font-bold">✓</span>
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-foreground text-lg">{fullName}</h3>
                  <p className="text-sm text-muted-foreground">{agent.roleTitle}</p>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && agents.length > 0 ? (
          <div className="text-center mt-10">
            <Button variant="outline" asChild>
              <Link to="/agents">View all agents</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default ExpertsSection;
