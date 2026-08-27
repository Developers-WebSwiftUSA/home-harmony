import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import advisorsBg from "@/assets/advisors-bg.jpg";

const stats = [
  { value: "2.8k+", label: "Properties Sold" },
  { value: "900+", label: "Satisfied Clients" },
];

const AdvisorsSection = () => {
  return (
    <section className="section-dark section-padding">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Our Story</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-dark-surface-foreground mt-2 mb-6">
              Our Trusted Real Estate
              <span className="block">Advisors</span>
            </h2>
            <p className="text-dark-surface-foreground/70 leading-relaxed mb-8">
              House Tour Guide is a modern real estate platform designed to connect
              property seekers, buyers, and professional agents seamlessly. We make
              property listing, discovery, and communication simple, transparent, and
              secure for everyone.
            </p>
            <div className="flex items-center gap-8 mb-8">
              <div className="flex items-center gap-2 text-sm text-dark-surface-foreground/70">
                <span className="w-2 h-2 rounded-full bg-primary" />
                List your own property
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-surface-foreground/70">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Friendly fast & free support
              </div>
            </div>
            <Link to="/agents">
              <Button className="px-8">Discover More</Button>
            </Link>

            <div className="flex gap-12 mt-10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-heading font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-dark-surface-foreground/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <img
              src={advisorsBg}
              alt="Our Advisors"
              className="rounded-xl w-full h-[400px] object-cover"
            />
            <div className="absolute top-4 right-4 bg-card rounded-lg p-4 shadow-lg">
              <span className="text-xs text-muted-foreground">Scale to Deliver</span>
              <div className="text-primary font-bold text-lg">Real Results & Claims</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvisorsSection;
