import { Link } from 'react-router-dom';
import { Shield, ExternalLink } from 'lucide-react';
import Scan2TapLogo from './Scan2TapLogo';

const AdminFooter = () => {
  return (
    <footer className="bg-gray-50 dark:bg-scan-dark/50 border-t border-gray-200 dark:border-gray-700 py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-auto flex items-center flex-shrink-0">
              <Scan2TapLogo compact />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Shield className="w-4 h-4 text-scan-blue flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span className="hidden sm:inline">Admin Panel - SCAN2TAP</span>
                <span className="sm:hidden">SCAN2TAP Admin</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <Link 
              to="/" 
              className="text-gray-600 dark:text-gray-400 hover:text-scan-blue dark:hover:text-scan-blue-light transition-colors flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Main Site
            </Link>
            <span className="text-gray-500 dark:text-gray-500">
              © {new Date().getFullYear()} SCAN2TAP. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter; 