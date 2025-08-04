import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { LightLogin } from '../components/ui/sign-in';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const { session, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [hasShownError, setHasShownError] = useState(false);

  // Get the intended destination from location state, default to dashboard
  const from = location.state?.from?.pathname || '/dashboard/profile';
  
  // Get plan and billing parameters from URL
  const intendedPlan = searchParams.get('plan');
  const billingCycle = searchParams.get('billing');

  // Show error message if passed from auth callback
  useEffect(() => {
    if (location.state?.error && !hasShownError) {
      toast.error(location.state.error);
      setHasShownError(true);
      // Clear the error from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.error, hasShownError]);

  useEffect(() => {
    if (!loading && !profileLoading && session) {
      
      
      if (profile) {
        if (!profile.onboarding_complete) {

          // User has a profile but hasn't completed onboarding
          // Pass the intended plan through to onboarding if it exists
          if (intendedPlan === 'pro') {
            navigate('/onboarding', { 
              replace: true, 
              state: { 
                from: location.state?.from,
                intendedPlan: 'pro',
                billingCycle: billingCycle || 'monthly'
              }
            });
          } else {
            navigate('/onboarding', { replace: true });
          }
        } else {

          // User has completed onboarding
          if (intendedPlan === 'pro') {
            // Redirect to pricing/upgrade flow with preserved billing cycle and auto-trigger
            navigate('/pricing', { 
              replace: true,
              state: { 
                message: 'Welcome back! Completing your Pro subscription setup...',
                highlightPro: true,
                autoTriggerUpgrade: true,
                billingCycle: billingCycle || 'monthly'
              }
            });
          } else {
            // Normal redirect to intended destination
            navigate(from, { replace: true });
          }
        }
      } else {

        // No profile exists, redirect to onboarding to create one
        // Pass the intended plan through to onboarding if it exists
        if (intendedPlan === 'pro') {
          navigate('/onboarding', { 
            replace: true,
            state: { 
              from: location.state?.from,
              intendedPlan: 'pro',
              billingCycle: billingCycle || 'monthly'
            }
          });
        } else {
          navigate('/onboarding', { replace: true });
        }
      }
    }
  }, [session, profile, loading, profileLoading, navigate, from, intendedPlan, billingCycle, location.state]);

  // Don't render auth page if user is already authenticated
  if (session && !loading && !profileLoading) {
    return null;
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white to-purple-50/50 dark:from-scan-dark dark:via-scan-dark/95 dark:to-scan-dark/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-scan-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {loading ? 'Checking authentication...' : 'Loading profile...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50/80 via-white to-purple-50/50 dark:from-scan-dark dark:via-scan-dark/95 dark:to-scan-dark/90 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Back Arrow - Fixed position for mobile, absolute for desktop */}
      <div className="fixed top-6 left-6 z-50 sm:absolute sm:top-8 sm:left-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Auth Form */}
      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="glassmorphism-card p-6 sm:p-8 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-white/10">
          {/* Show Pro plan intent message */}
          {intendedPlan === 'pro' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-scan-blue/10 to-scan-purple/10 border border-scan-blue/20 rounded-xl">
              <div className="flex items-center gap-2 text-scan-blue mb-2">
                <span className="text-lg">👑</span>
                <span className="font-semibold">Pro Plan Selected</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Sign in to continue with your Pro subscription setup.
              </p>
            </div>
          )}
          <LightLogin />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 sm:mt-8 text-center text-sm text-gray-500 dark:text-gray-400 relative z-10 px-4">
        <p>Transform your networking with smart digital profiles</p>
      </div>
    </div>
  );
} 