import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Emily Johnson",
    role: "Property Buyer",
    text: "Setting up an apartment was effortless. I'm delighted and very satisfied with the quality of service. The experience was remarkable with everything handled professionally.",
    rating: 5,
  },
  {
    name: "Michael Brown",
    role: "Home Owner",
    text: "Excellent platform for property search. We found our dream home in just weeks. The team was incredibly professional and helped us every step of the way.",
    rating: 5,
  },
  {
    name: "Sarah Williams",
    role: "Real Estate Investor",
    text: "Lovable features, properties, beautiful listing and managed inspections effortlessly. Highly recommend this platform for both buyers and sellers alike.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Client Reviews</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
            Trusted By Property Buyers Nationwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{t.text}</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-heading font-bold text-foreground text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
                <Quote className="w-8 h-8 text-primary/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
