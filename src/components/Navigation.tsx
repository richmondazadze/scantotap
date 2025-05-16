
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-40 bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gradient">ScanToTap</h1>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                <Link 
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-scan-blue/10"
                >
                  Home
                </Link>
                <Link 
                  to="/pricing"
                  className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-scan-blue/10"
                >
                  Pricing
                </Link>
                <Link 
                  to="#"
                  className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-scan-blue/10"
                >
                  About
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/dashboard">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary focus:outline-none"
              aria-expanded="false"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-scan-blue/10"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/pricing"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-scan-blue/10"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-scan-blue/10"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <div className="pt-4 pb-3 border-t border-white/10">
              <Link 
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-scan-blue"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                to="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="block mt-2"
              >
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
