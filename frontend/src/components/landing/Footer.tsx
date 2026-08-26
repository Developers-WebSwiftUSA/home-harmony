import { MapPin, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer>
      {/* CTA Bar */}
      <div className="bg-primary py-4">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-primary-foreground text-sm">
            <MapPin className="w-4 h-4" />
            <span>5301 Ogden Ct, Vancouver</span>
          </div>
          <div className="flex items-center gap-2 text-primary-foreground text-sm">
            <Mail className="w-4 h-4" />
            <span>info@housetourguide.com</span>
          </div>
          <div className="flex items-center gap-2 text-primary-foreground text-sm">
            <Phone className="w-4 h-4" />
            <span>+1 (800) 123-4567</span>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="section-dark py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div>
              <h4 className="font-heading font-bold text-dark-surface-foreground mb-4">Quick Link</h4>
              <ul className="space-y-2 text-sm text-dark-surface-foreground/60">
                <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link to="/properties" className="hover:text-primary transition-colors">Properties</Link></li>
                <li><Link to="/agents" className="hover:text-primary transition-colors">Agents</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold text-dark-surface-foreground mb-4">Our Sites</h4>
              <ul className="space-y-2 text-sm text-dark-surface-foreground/60">
                <li><Link to="/login" className="hover:text-primary transition-colors">My Account</Link></li>
                <li><Link to="/buyer/favorites" className="hover:text-primary transition-colors">Short Listed</Link></li>
                <li><Link to="/properties" className="hover:text-primary transition-colors">View Property</Link></li>
                <li><Link to="/rentals" className="hover:text-primary transition-colors">Rentals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold text-dark-surface-foreground mb-4">Information</h4>
              <ul className="space-y-2 text-sm text-dark-surface-foreground/60">
                <li><Link to="/contact" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/news" className="hover:text-primary transition-colors">News</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold text-dark-surface-foreground mb-4">Helpful Links</h4>
              <ul className="space-y-2 text-sm text-dark-surface-foreground/60">
                <li><Link to="/contact" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold text-dark-surface-foreground mb-4">Social Links</h4>
              <ul className="space-y-2 text-sm text-dark-surface-foreground/60">
                <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-dark-surface-muted mt-12 pt-8 text-center text-sm text-dark-surface-foreground/40">
            © 2026 House Tour Guide. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
