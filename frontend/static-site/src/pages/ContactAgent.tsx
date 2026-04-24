import { useSearchParams, Link } from "react-router-dom";
import { Phone, Mail, MapPin, Star, MessageSquare } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
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

const ContactAgent = () => {
  const [searchParams] = useSearchParams();
  const propertyTitle = searchParams.get("propertyTitle") || "Selected Property";
  const agentId = searchParams.get("agentId");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-agent", agentId],
    queryFn: () => agentPublicService.getById(agentId!),
    enabled: Boolean(agentId),
  });

  const agent = data?.data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-10 bg-muted/60">
        <div className="container max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            Contact Agent
          </h1>
          <p className="text-muted-foreground text-sm">
            Reach out to a verified agent to ask questions, request more details, or schedule a tour.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 bg-card border border-border rounded-xl p-6 space-y-4">
            {!agentId ? (
              <div className="text-sm text-muted-foreground space-y-3">
                <p>No agent selected.</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/agents">Browse agents</Link>
                </Button>
              </div>
            ) : isLoading ? (
              <p className="text-sm text-muted-foreground">Loading agent…</p>
            ) : isError || !agent ? (
              <div className="text-sm text-muted-foreground space-y-3">
                <p>We could not load this agent. They may no longer be listed.</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/agents">Browse agents</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <UserProfileAvatar user={agentAsUser(agent)} sizeClassName="h-16 w-16" />
                  <div>
                    <h2 className="font-heading font-bold text-foreground text-lg">
                      {[agent.firstName, agent.lastName].filter(Boolean).join(" ").trim() ||
                        agent.email ||
                        "Agent"}
                    </h2>
                    <p className="text-xs text-muted-foreground">{agent.roleTitle}</p>
                    {agent.agentProfile?.yearsOfExperience != null && agent.agentProfile.yearsOfExperience > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {agent.agentProfile.yearsOfExperience}+ years experience
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500 shrink-0" />
                  <span className="font-medium text-foreground">
                    {(agent.agentProfile?.rating?.count ?? 0) === 0
                      ? "0"
                      : Number(agent.agentProfile?.rating?.average ?? 0).toFixed(1)}
                  </span>
                  <span>
                    · {(agent.agentProfile?.rating?.count ?? 0)}{" "}
                    {(agent.agentProfile?.rating?.count ?? 0) === 1 ? "review" : "reviews"}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  {agent.phone ? (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      <a href={`tel:${agent.phone}`} className="hover:text-primary break-all">
                        {agent.phone}
                      </a>
                    </div>
                  ) : null}
                  {agent.email ? (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary shrink-0" />
                      <a href={`mailto:${agent.email}`} className="hover:text-primary break-all">
                        {agent.email}
                      </a>
                    </div>
                  ) : null}
                  {agent.location ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span>{agent.location}</span>
                    </div>
                  ) : null}
                </div>

                <Button variant="outline" className="w-full gap-2 text-xs" type="button" disabled>
                  <MessageSquare className="w-4 h-4" />
                  Start in‑app chat (coming soon)
                </Button>
              </>
            )}
          </aside>

          <main className="lg:col-span-2 bg-card border border-border rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-heading font-bold text-foreground mb-1">
              Send a message to the agent
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              You’re inquiring about: <span className="font-medium text-foreground">{propertyTitle}</span>
            </p>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Preferred contact method
                  </label>
                  <select
                    className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Email</option>
                    <option>Phone Call</option>
                    <option>Text Message</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Share any questions you have, or preferred dates/times for a tour..."
                  className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <Button className="w-full md:w-auto" type="button">
                Send Message to Agent
              </Button>
            </form>
          </main>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactAgent;
