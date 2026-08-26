import { useSearchParams } from "react-router-dom";
import { Phone, Mail, MapPin, Star, MessageSquare } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import agent1 from "@/assets/agent-1.jpg";

const ContactAgent = () => {
  const [searchParams] = useSearchParams();
  const propertyTitle = searchParams.get("propertyTitle") || "Selected Property";

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
          {/* Agent Profile */}
          <aside className="lg:col-span-1 bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={agent1}
                alt="Agent"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="font-heading font-bold text-foreground text-lg">
                  Savannah Nguyen
                </h2>
                <p className="text-xs text-muted-foreground">
                  Senior Property Specialist · 8+ years experience
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-foreground">4.9</span>
              <span>· 126 reviews</span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+15551234567" className="hover:text-primary">
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:savannah@htg.com" className="hover:text-primary">
                  savannah@htg.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Vancouver, BC · House Tour Guide</span>
              </div>
            </div>

            <Button variant="outline" className="w-full gap-2 text-xs">
              <MessageSquare className="w-4 h-4" />
              Start in‑app chat (coming soon)
            </Button>
          </aside>

          {/* Contact Form */}
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

              <Button className="w-full md:w-auto">
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

