import { MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import heroBg from "@/assets/hero-bg.jpg";
import agent1 from "@/assets/agent-1.jpg";
import { userService } from "@/services/user.service";
import { UserAvatar } from "@/components/UserAvatar";
import { RatingStars } from "@/components/RatingStars";
import { getDisplayName } from "@/lib/userDisplay";
import { getAgentRating } from "@/lib/ratings";

const Agents = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-agents"],
    queryFn: () => userService.listPublicAgents(),
  });

  const agents = data?.data || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative py-16 md:py-20">
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
            <p className="text-center text-sm text-muted-foreground">Loading agents...</p>
          ) : agents.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">No active agents yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map((agent) => {
                const location = [agent.location?.city, agent.location?.state].filter(Boolean).join(", ");
                const specialization = agent.agentProfile?.specialization?.[0] || "Property Expert";
                const rating = getAgentRating(agent);

                return (
                  <div
                    key={agent._id || agent.id}
                    className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-xl transition-shadow group"
                  >
                    <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 flex items-center justify-center bg-muted">
                      <UserAvatar user={agent} size="lg" className="w-28 h-28 text-2xl" />
                    </div>
                    <h3 className="font-heading font-bold text-foreground text-lg">{getDisplayName(agent)}</h3>
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
                    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mb-4">
                      {agent.phone && (
                        <a href={`tel:${agent.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      )}
                      {agent.email && (
                        <a href={`mailto:${agent.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Mail className="w-3 h-3" /> Email
                        </a>
                      )}
                    </div>
                    <Link
                      to={`/contact-agent?agentId=${agent._id || agent.id}&propertyTitle=${encodeURIComponent("General inquiry")}`}
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
