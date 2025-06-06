import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Home } from 'lucide-react';
import Scan2TapLogo from './Scan2TapLogo';

interface AdminNavbarProps {
  onLogout: () => void;
}

const AdminNavbar = ({ onLogout }: AdminNavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/90 dark:bg-scan-dark/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <div className="h-10 w-auto flex items-center">
            <Scan2TapLogo compact />
          </div>
        </Link>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
        <div className="flex items-center gap-2 min-w-0">
          <Shield className="w-5 h-5 text-scan-blue flex-shrink-0" />
          <span className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
            <span className="hidden sm:inline">Admin Dashboard</span>
            <span className="sm:hidden">Admin</span>
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Home className="w-4 h-4 mr-2" />
            Back to Site
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default AdminNavbar; 