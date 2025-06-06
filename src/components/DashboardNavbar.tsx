import { Link } from 'react-router-dom';
import Scan2TapLogo from './Scan2TapLogo';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const DashboardNavbar = () => {
  const { profile } = useProfile();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-6 bg-white/70 dark:bg-scan-dark/80 backdrop-blur-xl border-b border-white/20 dark:border-scan-blue/30 shadow-sm">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/profile" className="flex items-center gap-2">
          <div className="h-8 w-8 flex items-center">
            <Scan2TapLogo />
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {profile && (
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile.avatar_url} alt={profile.name} />
              <AvatarFallback>{profile.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-base text-gray-800 dark:text-white max-w-[120px] truncate">{profile.name || 'User'}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DashboardNavbar; 