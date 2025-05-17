import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, QrCode } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Scan2TapLogo from "@/components/Scan2TapLogo";
import { motion } from "framer-motion";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

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

  // Navigation links configuration
  const navLinks = [
    { name: 'Home', path: '/', action: () => {} },
    { name: 'How It Works', path: '/#how-it-works', action: () => scrollToSection('how-it-works') },
    { name: 'Features', path: '/#features', action: () => scrollToSection('features') },
    { name: 'Pricing', path: '/pricing', action: () => {} },
    { name: 'Contact', path: '/contact', action: () => {} },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glassmorphism py-3 shadow-sm border-b border-white/10' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Scan2TapLogo />
            </Link>
            <div className="hidden md:block ml-10">
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
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeSwitcher />
            <Link to="/dashboard">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/dashboard">
              <Button 
                className="bg-gradient-to-r from-scan-blue to-scan-purple hover:opacity-90 transition-opacity"
              >
                Get Started
              </Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <ThemeSwitcher />
            <Drawer>
              <DrawerTrigger asChild>
                <button
                  className="inline-flex items-center justify-center p-2 rounded-md text-primary focus:outline-none"
                  aria-expanded="false"
                >
                  <Menu size={24} />
                </button>
              </DrawerTrigger>
              <DrawerContent className="h-[85vh]">
                <div className="px-4 py-6">
                  <div className="flex items-center justify-between mb-6">
                    <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                      <Scan2TapLogo />
                    </Link>
                    <DrawerClose>
                      <X size={24} />
                    </DrawerClose>
                  </div>
                  <div className="flex flex-col space-y-4">
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
                        className={`px-3 py-4 rounded-md text-lg font-medium relative group ${
                          isActive(link.path) 
                            ? 'text-scan-blue dark:text-scan-blue-light' 
                            : 'text-foreground'
                        }`}
                      >
                        {link.name}
                        {isActive(link.path) && (
                          <motion.div
                            layoutId="mobileActiveTab"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-scan-blue via-scan-purple to-scan-blue"
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
                    <div className="pt-4 pb-3 space-y-4">
                      <Link to="/dashboard" className="w-full block">
                        <Button variant="outline" className="w-full">Sign In</Button>
                      </Link>
                      <Link to="/dashboard" className="w-full block">
                        <Button className="w-full bg-gradient-to-r from-scan-blue to-scan-purple">
                          Get Started
                        </Button>
                      </Link>
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
