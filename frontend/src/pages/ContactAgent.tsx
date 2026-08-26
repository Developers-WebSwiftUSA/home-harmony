import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/user.service";
import { UserAvatar } from "@/components/UserAvatar";
import { RatingStars } from "@/components/RatingStars";
import { getDisplayName } from "@/lib/userDisplay";
import { toast } from "sonner";
import { buildLoginRedirect } from "@/lib/propertyRoutes";

const ContactAgent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get("agentId");
  const propertyId = searchParams.get("propertyId") || "";
  const propertyTitle = searchParams.get("propertyTitle") || "Selected Property";

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (propertyId) {
      navigate(buildLoginRedirect(`/buyer/messages?propertyId=${propertyId}`));
      return;
    }
    toast.info("Use Start in-app chat to message this agent directly.");
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["contact-agent-profile", agentId],
    queryFn: () => userService.getAgentProfile(agentId!),
    enabled: Boolean(agentId),
  });

  const profile = data?.data;
  const agent = profile?.agent;
  const rating = profile
    ? { average: profile.averageRating, count: profile.reviewCount }
    : getAgentRating(agent);
  const location = [agent?.location?.city, agent?.location?.state, agent?.location?.country]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-10 bg-muted/60">
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
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading agent profile...</p>
            ) : isError || !agent ? (
              <p className="text-sm text-muted-foreground">Agent profile unavailable.</p>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <UserAvatar user={agent} size="lg" className="w-16 h-16" />
                  <div>
                    <h2 className="font-heading font-bold text-foreground text-lg">
                      {getDisplayName(agent)}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {agent.agentProfile?.specialization?.[0] || "Property Specialist"}
                      {agent.agentProfile?.yearsOfExperience
                        ? ` · ${agent.agentProfile.yearsOfExperience}+ years experience`
                        : ""}
                    </p>
                  </div>
                </div>

                <RatingStars rating={rating} />

                {agent.agentProfile?.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{agent.agentProfile.bio}</p>
                )}

                <div className="space-y-3 text-sm">
                  {agent.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <a href={`tel:${agent.phone}`} className="hover:text-primary">
                        {agent.phone}
                      </a>
                    </div>
                  )}
                  {agent.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <a href={`mailto:${agent.email}`} className="hover:text-primary">
                        {agent.email}
                      </a>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{location}</span>
                    </div>
                  )}
                </div>

                <Link to={`/login?chatProperty=${searchParams.get("propertyId") || ""}`}>
                  <Button variant="outline" className="w-full gap-2 text-xs">
                    <MessageSquare className="w-4 h-4" />
                    Start in-app chat
                  </Button>
                </Link>
              </>
            )}
          </aside>

          <main className="lg:col-span-2 bg-card border border-border rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-heading font-bold text-foreground mb-1">
              Send a message to the agent
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              You&apos;re inquiring about: <span className="font-medium text-foreground">{propertyTitle}</span>
            </p>

            <form className="space-y-4" onSubmit={handleFormSubmit}>
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

              <Button className="w-full md:w-auto" type="submit">
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
