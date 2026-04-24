import { MapPin, Phone, Mail, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import heroBg from "@/assets/hero-bg.jpg";
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

function ratingStars(average: number, count: number): number {
  if (count <= 0 || !Number.isFinite(average)) return 0;
  return Math.min(5, Math.round(average));
}

function ratingLabel(agent: PublicAgent): string {
  const count = agent.agentProfile?.rating?.count ?? 0;
  const avg = agent.agentProfile?.rating?.average ?? 0;
  if (count === 0) return "0";
  return Number(avg).toFixed(1);
}

const Agents = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-agents"],
    queryFn: () => agentPublicService.list(),
  });

  const agents: PublicAgent[] = data?.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-secondary/85" />
        </div>
        <div className="relative z-10 container text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-dark-surface-foreground mb-4">Our Agents</h1>
          <p className="text-dark-surface-foreground/70">Meet our certified real estate professionals</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-12">Loading agents…</p>
          ) : isError ? (
            <p className="text-center text-muted-foreground py-12">Unable to load agents. Please try again later.</p>
          ) : agents.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No verified agents are listed yet. Check back soon, or contact us for a referral.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map((agent) => {
                const fullName =
                  [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim() ||
                  agent.email ||
                  "Agent";
                const filled = ratingStars(
                  agent.agentProfile?.rating?.average ?? 0,
                  agent.agentProfile?.rating?.count ?? 0
                );
                return (
                  <div
                    key={agent._id}
                    className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-xl transition-shadow group"
                  >
                    <div className="flex justify-center mb-4">
                      <UserProfileAvatar
                        user={agentAsUser(agent)}
                        sizeClassName="h-28 w-28"
                        fallbackTextClassName="text-xl"
                      />
                    </div>
                    <h3 className="font-heading font-bold text-foreground text-lg">{fullName}</h3>
                    <p className="text-sm text-primary font-medium mb-1">{agent.roleTitle}</p>
                    {agent.location ? (
                      <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {agent.location}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mb-3">&nbsp;</p>
                    )}
                    <div className="flex items-center justify-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < filled ? "text-primary fill-primary" : "text-border"}`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">({ratingLabel(agent)})</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      {agent.propertyCount} {agent.propertyCount === 1 ? "property" : "properties"} listed
                    </p>
                    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
                      {agent.phone ? (
                        <a
                          href={`tel:${agent.phone}`}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      ) : null}
                      {agent.email ? (
                        <a
                          href={`mailto:${agent.email}`}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Mail className="w-3 h-3" /> Email
                        </a>
                      ) : null}
                    </div>
                    <Link
                      to={`/contact-agent?agentId=${agent._id}&propertyTitle=${encodeURIComponent("General inquiry")}`}
                      className="block"
                    >
                      <Button className="w-full" size="sm">
                        View Profile / Contact
                      </Button>
                    </Link>
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
