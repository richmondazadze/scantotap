import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  QrCode, 
  CreditCard, 
  Package, 
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/'); // Redirect to homepage after successful sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sidebarItems = [
    { name: 'Profile', path: '/dashboard/profile', icon: User },
    { name: 'QR Code', path: '/dashboard/qr', icon: QrCode },
    { name: 'Order', path: '/dashboard/order', icon: CreditCard },
    { name: 'Shipping', path: '/dashboard/shipping', icon: Package },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-white/20 dark:bg-scan-dark/60 backdrop-blur-md hover:bg-white/30 dark:hover:bg-scan-dark/80"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile sign out button - top right */}
      <div className="lg:hidden fixed top-4 right-4 z-30">
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-white/20 dark:bg-scan-dark/60 backdrop-blur-md hover:bg-white/30 dark:hover:bg-scan-dark/80 text-red-500 dark:text-red-400"
          onClick={handleSignOut}
        >
          <LogOut size={20} />
        </Button>
      </div>

      {/* Sidebar - desktop always visible, mobile conditional */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-20 w-64 bg-white/10 dark:bg-[#181C23] border-r border-gray-200 dark:border-scan-blue/30 transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-white/20 dark:border-scan-blue/30">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gradient">Scan2Tap</h1>
            </Link>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-2 py-6 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg transition-all",
                    isActive
                      ? "bg-scan-blue text-white shadow-md dark:bg-scan-blue dark:text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-scan-blue/10 dark:hover:bg-scan-blue/20"
                  )}
                >
                  <item.icon size={20} className={isActive ? "text-white" : "text-scan-blue dark:text-scan-blue-light"} />
                  <span className="ml-4 text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Account section */}
          <div className="p-4 border-t border-white/20 dark:border-scan-blue/30">
            <Button variant="outline" className="w-full mt-4" size="sm" onClick={handleSignOut}>
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

      {/* Bottom navigation bar for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-around items-center bg-white/90 dark:bg-[#181C23]/90 border-t border-gray-200 dark:border-scan-blue/30 py-2 shadow-lg lg:hidden">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 px-1 py-1 transition-all",
                isActive
                  ? "text-scan-blue dark:text-scan-blue-light font-semibold"
                  : "text-gray-500 dark:text-gray-300 hover:text-scan-blue dark:hover:text-scan-blue-light"
              )}
            >
              <item.icon size={26} />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
        
        {/* Sign Out button for mobile bottom nav */}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center flex-1 px-1 py-1 transition-all text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
        >
          <LogOut size={26} />
          <span className="text-xs mt-1">Sign Out</span>
        </button>
      </nav>
    </>
  );
};

export default DashboardSidebar;
