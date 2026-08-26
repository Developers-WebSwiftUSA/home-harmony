import { Button } from "@/components/ui/button";
import agent1 from "@/assets/agent-1.jpg";
import agent2 from "@/assets/agent-2.jpg";
import agent3 from "@/assets/agent-3.jpg";

const agents = [
  { name: "Savannah Nguyen", role: "Property Expert", image: agent1 },
  { name: "Andrew Black", role: "Property Advisor", image: agent2 },
  { name: "Kathryn Murphy", role: "Property Expert", image: agent3 },
];

const ExpertsSection = () => {
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
          <Button className="mt-4 md:mt-0 w-fit">Become A Agent</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {agents.map((agent) => (
            <div key={agent.name} className="text-center group">
              <div className="relative mb-4 mx-auto w-52 h-52 rounded-2xl overflow-hidden">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">✓</span>
                </div>
              </div>
              <h3 className="font-heading font-bold text-foreground text-lg">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">{agent.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpertsSection;
