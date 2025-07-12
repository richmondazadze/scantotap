import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  QrCode, 
  CreditCard, 
  Package, 
  Menu, 
  X,
  LogOut,
  Sparkles,
  ChevronRight,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedLink } from '@/components/ProtectedLink';

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
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
    { name: 'Profile', path: '/dashboard/profile', icon: User, description: 'Manage your profile', mobileLabel: 'Profile' },
    { name: 'QR Code', path: '/dashboard/qr', icon: QrCode, description: 'Generate & download', mobileLabel: 'QR' },
    { name: 'Themes', path: '/dashboard/themes', icon: Palette, description: 'Customize appearance', mobileLabel: 'Themes' },
    { name: 'Order', path: '/dashboard/order', icon: CreditCard, description: 'Place new orders', mobileLabel: 'Order' },
    { name: 'Shipping', path: '/dashboard/shipping', icon: Package, description: 'Track deliveries', mobileLabel: 'Shipping' },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings, description: 'Account preferences', mobileLabel: 'Settings' },
  ];

  // Haptic feedback simulation
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10); // Light haptic feedback
    }
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile */}
      <motion.aside 
        className={cn(
          "hidden lg:block fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-br from-white/95 via-white/90 to-gray-50/95 dark:from-[#1A1D24]/95 dark:via-[#1A1D24]/90 dark:to-[#151821]/95 backdrop-blur-2xl border-r border-gray-200/50 dark:border-scan-blue/20 shadow-2xl"
        )}
        initial={{ x: 0 }}
        animate={{ x: 0 }}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-scan-blue/5 via-transparent to-scan-purple/5 dark:from-scan-blue/10 dark:to-scan-purple/10" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-scan-blue/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-scan-purple/10 to-transparent rounded-full blur-2xl" />

          {/* Enhanced Logo Section */}
          <motion.div 
            className="relative p-6 border-b border-gray-200/50 dark:border-scan-blue/20"
            variants={itemVariants}
          >
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-scan-blue to-scan-purple rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
            </Link>
          </motion.div>

          {/* Enhanced Navigation */}
          <motion.nav 
            className="flex-1 px-4 py-6 space-y-2 relative z-10"
            variants={itemVariants}
          >
            {sidebarItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <ProtectedLink
                  to={item.path}
                  className={cn(
                      "relative flex items-center px-4 py-4 rounded-lg transition-all duration-300 group overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-scan-blue to-scan-purple text-white shadow-lg shadow-scan-blue/25"
                        : "text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-[#1A1D24]/80 hover:shadow-lg"
                    )}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-scan-blue/20 to-scan-purple/20 rounded-lg"
                        layoutId="activeTab"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    {/* Hover effect */}
                    {hoveredItem === item.name && !isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    <div className="relative flex items-center w-full">
                      <motion.div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                          isActive 
                            ? "bg-white/20 shadow-lg" 
                            : "bg-gradient-to-br from-scan-blue/10 to-scan-purple/10 group-hover:from-scan-blue/20 group-hover:to-scan-purple/20"
                        )}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <item.icon 
                          size={20} 
                          className={cn(
                            "transition-all duration-300",
                            isActive 
                              ? "text-white" 
                              : "text-scan-blue dark:text-scan-blue-light group-hover:text-scan-purple"
                          )} 
                        />
                      </motion.div>
                      
                      <div className="ml-4 flex-1">
                        <span className={cn(
                          "text-sm font-semibold transition-all duration-300",
                          isActive ? "text-white" : "group-hover:text-gray-900 dark:group-hover:text-white"
                        )}>
                          {item.name}
                        </span>
                        <p className={cn(
                          "text-xs mt-0.5 transition-all duration-300",
                    isActive
                            ? "text-white/80" 
                            : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                        )}>
                          {item.description}
                        </p>
                      </div>

                      <motion.div
                        className={cn(
                          "opacity-0 transition-all duration-300",
                          isActive ? "opacity-100" : "group-hover:opacity-60"
                        )}
                        animate={{ x: hoveredItem === item.name ? 2 : 0 }}
                      >
                        <ChevronRight 
                          size={16} 
                          className={isActive ? "text-white" : "text-gray-400"} 
                        />
                      </motion.div>
                    </div>
                </ProtectedLink>
                </motion.div>
              );
            })}
          </motion.nav>

          {/* Enhanced Account Section */}
          <motion.div 
            className="relative p-6 border-t border-gray-200/50 dark:border-scan-blue/20 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-[#151821]/50 dark:to-[#1A1D24]/50"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-2xl border-2 border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/20 text-red-600 dark:text-red-400 hover:from-red-100 hover:to-red-200/50 dark:hover:from-red-900/30 dark:hover:to-red-800/30 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl group"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Sign Out
            </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.aside>

      {/* Enhanced Bottom navigation bar for mobile - massively improved */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Background with glassmorphism */}
        <div className="relative">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/90 to-white/80 dark:from-[#1A1D24]/95 dark:via-[#1A1D24]/90 dark:to-[#1A1D24]/80 backdrop-blur-2xl" />
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-scan-blue/5 via-transparent to-scan-purple/5 dark:from-scan-blue/10 dark:to-scan-purple/10" />
          
          {/* Top border with gradient */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200/50 to-transparent dark:via-scan-blue/20" />
          
          {/* Floating glow effects */}
          <div className="absolute -top-2 left-1/4 w-16 h-1 bg-gradient-to-r from-scan-blue/20 to-scan-purple/20 rounded-full blur-sm" />
          
          <nav className="relative px-1 xs:px-2 pt-2 pb-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
            <div className="flex justify-around items-center max-w-sm mx-auto gap-0.5 xs:gap-1">
              {sidebarItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.name}
                    className="flex-1 flex justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ProtectedLink
                      to={item.path}
                      className="relative flex flex-col items-center justify-center px-1 xs:px-2 py-2 rounded-lg transition-all duration-300 group min-w-[48px] xs:min-w-[58px] min-h-[52px] xs:min-h-[58px]"
                      aria-label={`Navigate to ${item.name}`}
                      onClick={triggerHaptic}
                    >
                      {/* Active background with enhanced styling */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-scan-blue via-scan-blue to-scan-purple rounded-lg shadow-lg shadow-scan-blue/30"
                          layoutId="mobileActiveTab"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      
                      {/* Hover background */}
                      {!isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-gray-50/30 dark:from-gray-800/30 dark:to-gray-700/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      )}
                      
                      {/* Icon container with enhanced styling */}
                      <motion.div
                        className={cn(
                          "relative w-8 h-8 xs:w-9 xs:h-9 rounded-xl flex items-center justify-center transition-all duration-300 mb-0.5 xs:mb-1",
                          isActive 
                            ? "bg-white/20 shadow-lg" 
                            : "bg-gradient-to-br from-scan-blue/10 to-scan-purple/10 group-hover:from-scan-blue/20 group-hover:to-scan-purple/20"
                        )}
                        animate={{ 
                          scale: isActive ? 1.1 : 1,
                          rotate: isActive ? [0, -3, 3, 0] : 0
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      >
                        <item.icon 
                          size={18} 
                          className={cn(
                            "relative z-10 transition-all duration-300 xs:w-5 xs:h-5",
                            isActive 
                              ? "text-white drop-shadow-sm" 
                              : "text-scan-blue dark:text-scan-blue-light group-hover:text-scan-purple"
                          )} 
                        />
                        
                        {/* Glow effect for active item */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-white/30 rounded-xl blur-sm"
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                        )}
                      </motion.div>
                      
                      {/* Label with enhanced typography - always visible on all screens */}
                      <motion.span 
                        className={cn(
                          "block text-xs font-semibold transition-all duration-300 relative z-10 text-center leading-tight",
                          isActive 
                            ? "text-white drop-shadow-sm" 
                            : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                        )}
                        animate={{ 
                          scale: isActive ? 1.05 : 1,
                          fontWeight: isActive ? 700 : 600
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.mobileLabel}
                      </motion.span>
                      
                      {/* Active indicator dot */}
                      {isActive && (
                        <motion.div
                          className="absolute -top-1 left-1/2 w-1 h-1 bg-white rounded-full shadow-lg"
                          initial={{ scale: 0, x: "-50%" }}
                          animate={{ scale: 1, x: "-50%" }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                      )}
                      
                      {/* Ripple effect on tap */}
                      <motion.div
                        className="absolute inset-0 bg-white/10 rounded-2xl"
                        initial={{ scale: 0, opacity: 0 }}
                        whileTap={{ scale: 1.2, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </ProtectedLink>
                  </motion.div>
                );
              })}
            </div>
          </nav>
        </div>
      </motion.div>
    </>
  );
};

export default DashboardSidebar;
