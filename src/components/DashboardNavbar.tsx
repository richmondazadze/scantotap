import { Link, useNavigate } from 'react-router-dom';
import Scan2TapLogo from './Scan2TapLogo';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const DashboardNavbar = () => {
  const { profile } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Extract first name from full name
  const getFirstName = (fullName: string | null | undefined) => {
    if (!fullName) return 'User';
    return fullName.trim().split(' ')[0];
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-12 sm:h-14 lg:h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8 bg-white/70 dark:bg-scan-dark/80 backdrop-blur-xl border-b border-white/20 dark:border-scan-blue/30 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Link to="/dashboard/profile" className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 flex items-center flex-shrink-0">
            <Scan2TapLogo />
          </div>
        </Link>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
        {profile && (
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Avatar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 flex-shrink-0">
              <AvatarImage src={profile.avatar_url} alt={profile.name} />
              <AvatarFallback className="text-xs sm:text-sm font-medium">
                {profile.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="hidden xs:block font-bold font-poetsen-one text-xs sm:text-sm lg:text-base bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent max-w-[60px] sm:max-w-[80px] lg:max-w-[120px] truncate tracking-wide drop-shadow-sm">
              {getFirstName(profile.name)}
            </span>
          </div>
        )}
        
        {/* Mobile Exit Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 rounded-lg flex-shrink-0 block lg:hidden"
          aria-label="Sign out"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
        </Button>
      </div>
    </nav>
  );
};

export default DashboardNavbar; 