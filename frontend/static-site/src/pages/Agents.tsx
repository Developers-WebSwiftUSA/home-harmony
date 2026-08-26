import { MapPin, Phone, Mail, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import heroBg from "@/assets/hero-bg.jpg";
import agent1 from "@/assets/agent-1.jpg";
import agent2 from "@/assets/agent-2.jpg";
import agent3 from "@/assets/agent-3.jpg";

const agents = [
  { id: 1, name: "Savannah Nguyen", role: "Property Expert", location: "New York, NY", image: agent1, rating: 4.9, properties: 45, phone: "+1 (555) 111-2222", email: "savannah@htg.com" },
  { id: 2, name: "Andrew Black", role: "Property Advisor", location: "San Jose, CA", image: agent2, rating: 4.7, properties: 38, phone: "+1 (555) 333-4444", email: "andrew@htg.com" },
  { id: 3, name: "Kathryn Murphy", role: "Property Expert", location: "Miami, FL", image: agent3, rating: 4.8, properties: 52, phone: "+1 (555) 555-6666", email: "kathryn@htg.com" },
  { id: 4, name: "James Wilson", role: "Senior Advisor", location: "Chicago, IL", image: agent2, rating: 4.6, properties: 31, phone: "+1 (555) 777-8888", email: "james@htg.com" },
  { id: 5, name: "Emma Davis", role: "Property Expert", location: "Austin, TX", image: agent1, rating: 4.9, properties: 60, phone: "+1 (555) 999-0000", email: "emma@htg.com" },
  { id: 6, name: "Robert Chen", role: "Property Advisor", location: "Malibu, CA", image: agent2, rating: 4.5, properties: 27, phone: "+1 (555) 123-7890", email: "robert@htg.com" },
];

const Agents = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-xl transition-shadow group">
                <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4">
                  <img src={agent.image} alt={agent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="font-heading font-bold text-foreground text-lg">{agent.name}</h3>
                <p className="text-sm text-primary font-medium mb-1">{agent.role}</p>
                <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3" />{agent.location}
                </p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(agent.rating) ? "text-primary fill-primary" : "text-border"}`} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">({agent.rating})</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{agent.properties} Properties Listed</p>
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mb-4">
                  <a href={`tel:${agent.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors"><Phone className="w-3 h-3" /> Call</a>
                  <a href={`mailto:${agent.email}`} className="flex items-center gap-1 hover:text-primary transition-colors"><Mail className="w-3 h-3" /> Email</a>
                </div>
                <Link
                  to={`/contact-agent?agentId=${agent.id}&propertyTitle=${encodeURIComponent("General inquiry")}`}
                  className="block"
                >
                  <Button className="w-full" size="sm">
                    View Profile / Contact
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Agents;
