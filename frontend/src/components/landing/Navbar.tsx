import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, Mail, Phone, LogOut, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { getDisplayName } from "@/lib/userDisplay";
import { openUserGuide } from "@/features/help/lib/openUserGuide";

const navLinks = [
  { label: "Home", href: "/", tourId: "nav-home" },
  { label: "Properties", href: "/properties", tourId: "nav-properties" },
  { label: "Rentals", href: "/rentals", tourId: "nav-rentals" },
  { label: "Agents", href: "/agents", tourId: "nav-agents" },
  { label: "How It Works", href: "/#how-it-works", tourId: "nav-how-it-works" },
  { label: "News", href: "/news", tourId: "nav-news" },
  { label: "Contact Us", href: "/contact", tourId: "nav-contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const openMobile = () => setMobileOpen(true);
    window.addEventListener("htg-open-mobile-nav", openMobile);
    return () => window.removeEventListener("htg-open-mobile-nav", openMobile);
  }, []);

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "admin":
        return "/admin";
      case "seller":
        return "/seller";
      case "agent":
        return "/agent";
      case "buyer":
        return "/buyer";
      default:
        return "/login";
    }
  };

  return (
    <header className="w-full z-50 sticky top-0 left-0">
      {/* First Row: Two links on left, Logo center, User/Login on right */}
      <div className="bg-[#FEFBF3] border-b border-amber-200/30">
        <div className="container">
          <div className="flex items-center justify-between py-4 md:py-6 lg:py-8">
            {/* Left: Mobile logo (prevents overlap on small screens) */}
            <div className="flex items-center sm:hidden">
              <Logo showTagline={false} className="scale-75 origin-left" />
            </div>

            {/* Left: Contact links (desktop / tablet only) */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="mailto:info@housetourguide.com"
                className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">info@housetourguide.com</span>
              </a>
              <a
                href="tel:+18001234567"
                className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">+1 (800) 123-4567</span>
              </a>
            </div>

            {/* Center: Large logo on sm+ screens */}
            <div className="hidden sm:block absolute left-1/2 -translate-x-1/2">
              <Logo showTagline={false} />
            </div>

            {/* Right: User/Login button with avatar */}
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={getDashboardPath()}
                    className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors"
                  >
                    <UserAvatar user={user} size="sm" className="border-slate-300" />
                    <span className="hidden sm:inline font-medium text-slate-800">
                      {getDisplayName(user)}
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/", { replace: true });
                    }}
                    className="p-2 text-slate-700 hover:text-primary transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/login" data-tour="nav-signin">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 !text-slate-800 border-slate-300 hover:!text-slate-900 hover:bg-slate-100 hover:border-slate-400 bg-white"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign In / Register</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Navigation links centered */}
      <nav className="bg-[#FEFBF3] bg-opacity-95 backdrop-blur-md border-b border-amber-200/30">
        <div className="container">
          <div className="flex items-center justify-center py-3">
            {/* Desktop navigation - centered */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  data-tour={link.tourId}
                  className="text-sm font-medium text-slate-800 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => openUserGuide()}
                data-tour="nav-user-guide"
                className="text-sm font-medium text-slate-800 hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                User Guide
              </button>
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              className="lg:hidden text-slate-800"
              data-tour="nav-mobile-toggle"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="lg:hidden border-t border-amber-200/30 pb-4">
              <div className="container flex flex-col gap-3 pt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    data-tour={link.tourId}
                    className="text-sm font-medium text-slate-800 hover:text-primary transition-colors py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  type="button"
                  data-tour="nav-user-guide"
                  onClick={() => {
                    setMobileOpen(false);
                    openUserGuide();
                  }}
                  className="text-sm font-medium text-slate-800 hover:text-primary transition-colors py-2 text-left inline-flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  User Guide
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
