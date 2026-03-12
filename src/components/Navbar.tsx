import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

interface NavbarProps {
  onBookNow: () => void;
}

const Navbar = ({ onBookNow }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user ? ADMIN_EMAILS.includes(user.email?.toLowerCase() || "") : false;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 safe-top",
      scrolled ? "bg-background/95 backdrop-blur-md shadow-md h-16 sm:h-20" : "bg-transparent h-20 sm:h-24"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="Qurux Dumar Logo" className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-110" />
          <span className={cn(
            "font-display text-lg sm:text-2xl transition-colors drop-shadow-md",
            scrolled ? "text-primary" : "text-white"
          )}>Qurux Dumar</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-8 font-body text-sm">
            <button onClick={() => scrollTo("services")} className={cn(
              "transition-colors font-medium",
              scrolled ? "text-foreground hover:text-primary" : "text-white hover:text-white/80"
            )}>Services</button>
            <button onClick={() => scrollTo("team")} className={cn(
              "transition-colors font-medium",
              scrolled ? "text-foreground hover:text-primary" : "text-white hover:text-white/80"
            )}>Team</button>
            {isAdmin ? (
              <Link
                to="/dashboard"
                className={cn(
                  "flex items-center gap-2 transition-colors font-medium",
                  scrolled ? "text-primary" : "text-white hover:text-white/80"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className={cn(
                  "flex items-center gap-2 transition-colors font-medium",
                  scrolled ? "text-foreground hover:text-primary" : "text-white hover:text-white/80"
                )}
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          <button
            onClick={onBookNow}
            className={cn(
              "px-5 sm:px-8 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs tracking-[0.2em] uppercase transition-all shadow-lg active:scale-95",
              scrolled 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "bg-white text-primary hover:bg-white/90"
            )}
          >
            Book Now
          </button>

          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className={cn(
              "md:hidden p-2 rounded-full transition-colors",
              scrolled ? "text-primary hover:bg-primary/10" : "text-white hover:bg-white/10"
            )}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-6 py-6 space-y-4 font-body text-sm">
              <button onClick={() => scrollTo("services")} className="block w-full text-left py-2 font-medium hover:text-primary transition-colors">Services</button>
              <button onClick={() => scrollTo("team")} className="block w-full text-left py-2 font-medium hover:text-primary transition-colors">Team</button>
              
              {isAdmin ? (
                <Link 
                  to="/dashboard" 
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 w-full text-left py-2 font-medium text-primary"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 w-full text-left py-2 font-medium hover:text-primary transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}

              <button
                onClick={() => { onBookNow(); setMobileOpen(false); }}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl text-xs tracking-[0.2em] uppercase font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Book Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
