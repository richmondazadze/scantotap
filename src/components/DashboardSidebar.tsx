
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Settings, 
  QrCode, 
  CreditCard, 
  Package, 
  Menu, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DashboardSidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems = [
    { name: 'Profile', path: '/dashboard', icon: User },
    { name: 'QR Code', path: '/dashboard?tab=qr', icon: QrCode },
    { name: 'Order Card', path: '/dashboard?tab=order', icon: CreditCard },
    { name: 'Shipping', path: '/dashboard?tab=shipping', icon: Package },
    { name: 'Settings', path: '/dashboard?tab=settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-white/20 backdrop-blur-md hover:bg-white/30"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar - desktop always visible, mobile conditional */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-20 w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-white/20">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gradient">ScanToTap</h1>
            </Link>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-2 py-6 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname + location.search === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg transition-all",
                    isActive
                      ? "bg-scan-blue text-white shadow-md" 
                      : "text-gray-700 hover:bg-scan-blue/10"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon size={20} className={isActive ? "text-white" : "text-scan-blue"} />
                  <span className="ml-4 text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Account section */}
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-scan-blue flex items-center justify-center text-white">
                A
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Alex Johnson</p>
                <Link to="/" className="text-xs text-scan-blue hover:underline">View Public Profile</Link>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/30 z-10"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default DashboardSidebar;
