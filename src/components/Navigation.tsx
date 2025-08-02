import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, QrCode, Home, DollarSign, MessageCircle } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Scan2TapLogo from "@/components/Scan2TapLogo";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { session } = useAuth();
  const navigate = useNavigate();

  // Add scroll event listener to change navigation style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if the current path matches the link
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Scroll to section when clicking on anchor links
  const scrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate to home first
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Close mobile menu
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Handle navigation with menu close
  const handleNavigation = useCallback((path: string, action?: () => void) => {
    // Subtle haptic feedback simulation (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    if (action) {
      action();
    } else {
      navigate(path);
    }
    closeMobileMenu();
  }, [navigate, closeMobileMenu]);

  // Handle escape key and scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    // Prevent body scroll when menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  // Navigation links configuration with icons
  const navLinks = [
    { 
      name: 'Home', 
      path: '/', 
      icon: Home,
      action: () => {} 
    },
    { 
      name: 'Pricing', 
      path: '/pricing', 
      icon: DollarSign,
      action: () => {} 
    },
    { 
      name: 'Contact', 
      path: '/contact', 
      icon: MessageCircle,
      action: () => {} 
    },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/30 backdrop-blur-xl border border-white/30 shadow-lg dark:bg-scan-dark/40 dark:border-white/20 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Scan2TapLogo />
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center space-x-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name}
                    to={link.path}
                    onClick={(e) => {
                      if (link.path.includes('#')) {
                        e.preventDefault();
                        link.action();
                      }
                    }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative group ${
                      isActive(link.path)
                      ? 'text-scan-blue dark:text-scan-blue-light' 
                      : 'text-foreground hover:text-scan-blue dark:hover:text-scan-blue-light'
                    }`}
                  >
                    {link.name}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-scan-blue via-scan-purple to-scan-blue"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <motion.div
                    className="absolute inset-0 rounded-md bg-scan-blue/5 dark:bg-scan-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                    animate={{ opacity: isActive(link.path) ? 1 : 0 }}
                  />
                  </Link>
                ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeSwitcher />
            <Button variant="ghost" onClick={() => navigate(session ? "/dashboard/profile" : "/auth")}>Sign In</Button>
              <Button 
                className="bg-gradient-to-r from-scan-blue to-scan-purple hover:opacity-90 transition-opacity"
              onClick={() => navigate(session ? "/dashboard/profile" : "/auth")}
              >
                Get Started
              </Button>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <ThemeSwitcher />
            <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DrawerTrigger asChild>
                <button
                  className="inline-flex items-center justify-center p-3 rounded-xl bg-white/20 dark:bg-slate-800/50 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-scan-blue/50 transition-all duration-200 shadow-lg"
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Open navigation menu"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </DrawerTrigger>
              <DrawerContent className="border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl">
                <div className="relative px-5 pt-6 pb-6" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
                  {/* Header with logo and close button */}
                  <div className="flex items-center justify-between mb-6">
                    <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                      <Scan2TapLogo />
                    </Link>
                    <DrawerClose asChild>
                      <button
                        className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all duration-200"
                      >
                        <X size={18} />
                      </button>
                    </DrawerClose>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex flex-col space-y-1.5 mb-6">
                    {navLinks.map((link) => (
                      <div key={link.name}>
                        <Link 
                        to={link.path}
                        onClick={(e) => {
                          if (link.path.includes('#')) {
                            e.preventDefault();
                              handleNavigation(link.path, link.action);
                            } else {
                              handleNavigation(link.path);
                          }
                        }}
                          className={`group relative flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-scan-blue/50 ${
                          isActive(link.path) 
                              ? 'text-white bg-gradient-to-r from-scan-blue to-scan-purple shadow-md' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:text-scan-blue dark:hover:text-scan-blue-light'
                        }`}
                          aria-label={`Navigate to ${link.name}`}
                      >
                          {/* Active indicator */}
                        {isActive(link.path) && (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-full" />
                        )}
                          
                          {/* Icon */}
                          <div className="flex-shrink-0 relative z-10">
                            <link.icon size={18} className={isActive(link.path) ? 'text-white' : 'text-current opacity-70'} />
                          </div>
                          
                          <span className="relative z-10 flex-1">{link.name}</span>
                      </Link>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mb-5" />

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full h-12 text-sm font-semibold bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-700/80 hover:border-scan-blue/40 transition-all duration-200 rounded-xl text-slate-700 dark:text-slate-300 hover:text-scan-blue dark:hover:text-scan-blue-light shadow-sm"
                      onClick={() => handleNavigation(session ? "/dashboard/profile" : "/auth")}
                    >
                      {session ? 'Profile' : 'Sign In'}
                    </Button>
                    
                    <Button 
                      className="w-full h-12 text-sm font-bold bg-gradient-to-r from-scan-blue to-scan-purple hover:from-scan-blue/90 hover:to-scan-purple/90 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-xl"
                      onClick={() => handleNavigation(session ? "/dashboard/profile" : "/auth")}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {session ? 'Go to Dashboard' : 'Get Started'}
                        →
                      </span>
                    </Button>
                  </div>

                  {/* Bottom brand element */}
                  <div className="flex justify-center mt-5 pt-4 border-t border-slate-200/40 dark:border-slate-700/40">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <QrCode className="w-3.5 h-3.5" />
                      <span className="font-medium">Your Digital Identity</span>
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
