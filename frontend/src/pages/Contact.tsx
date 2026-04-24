import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import heroBg from "@/assets/hero-bg.jpg";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-secondary/85" />
        </div>
        <div className="relative z-10 container text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-dark-surface-foreground mb-4">Contact Us</h1>
          <p className="text-dark-surface-foreground/70">We'd love to hear from you</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-2 section-dark rounded-xl p-8">
              <h2 className="text-2xl font-heading font-bold text-dark-surface-foreground mb-6">Get In Touch</h2>
              <div className="space-y-6">
                {[
                  { icon: MapPin, label: "Address", value: "5301 Ogden Ct, Vancouver, BC" },
                  { icon: Mail, label: "Email", value: "info@housetourguide.com" },
                  { icon: Phone, label: "Phone", value: "+1 (800) 123-4567" },
                  { icon: Clock, label: "Hours", value: "Mon - Fri: 9AM - 6PM" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-dark-surface-foreground">{item.label}</div>
                      <div className="text-sm text-dark-surface-foreground/60">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3 bg-card border border-border rounded-xl p-8">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Send a Message</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name</label>
                    <input type="text" placeholder="John" className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name</label>
                    <input type="text" placeholder="Doe" className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                  <input type="email" placeholder="john@example.com" className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
                  <select className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary">
                    <option>General Inquiry</option>
                    <option>Property Inquiry</option>
                    <option>Schedule a Tour</option>
                    <option>Become an Agent</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label>
                  <textarea rows={4} placeholder="Write your message here..." className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <Button className="w-full gap-2">
                  <Send className="w-4 h-4" /> Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
