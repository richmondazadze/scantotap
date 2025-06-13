import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Loading from "@/components/ui/loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export default function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const location = useLocation();

  // Show loading while checking authentication and profile
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white to-purple-50/50 dark:from-scan-dark dark:via-scan-dark/95 dark:to-scan-dark/90 flex items-center justify-center">
        <div className="text-center">
          <Loading size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If profile doesn't exist, redirect to onboarding
  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }

  // If onboarding is required but not completed, redirect to onboarding
  if (requireOnboarding && !profile.onboarding_complete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
} 