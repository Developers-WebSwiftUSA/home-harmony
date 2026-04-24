import { ClipboardList, UserCheck, Home } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "List Your Property",
    description: "Easily list your property, upload high-quality photos, set pricing, manage inquiries, and connect with buyers quickly.",
  },
  {
    icon: UserCheck,
    title: "Become Certified Agent",
    description: "Apply with your profile, verify your credentials, complete training, build your client base, and grow your business.",
  },
  {
    icon: Home,
    title: "Explore Listed Homes",
    description: "Browse verified homes, compare features, view photos, connect with agents, and schedule property tours easily.",
  },
];

const StepsSection = () => {
  return (
    <section id="how-it-works" className="section-padding bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Easy 3 Steps</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
            Simple Steps For Smarter Property
            <span className="block">Experience</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="bg-card border border-border rounded-xl p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <step.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
