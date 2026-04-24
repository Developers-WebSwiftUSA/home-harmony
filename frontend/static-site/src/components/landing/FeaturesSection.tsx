import { Building2, Warehouse, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import featuresBg from "@/assets/features-bg.jpg";

const features = [
  { icon: Building2, label: "Commercial", count: "8 Properties" },
  { icon: Warehouse, label: "Warehouse", count: "5 Properties" },
  { icon: Home, label: "Apartment", count: "12 Properties" },
];

const FeaturesSection = () => {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0">
        <img src={featuresBg} alt="Features background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-secondary/85" />
      </div>

      <div className="relative z-10 container">
        <span className="text-primary text-sm font-semibold uppercase tracking-wider">Top Our</span>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-dark-surface-foreground mt-2 mb-8">
          Top Features
        </h2>

        <div className="flex flex-wrap gap-4 items-center">
          <Button className="px-6">All Property</Button>
          {features.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-3 bg-dark-surface-foreground/10 backdrop-blur-sm border border-dark-surface-foreground/20 rounded-lg px-5 py-3 hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <f.icon className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm font-semibold text-dark-surface-foreground">{f.label}</div>
                <div className="text-xs text-dark-surface-foreground/60">{f.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
