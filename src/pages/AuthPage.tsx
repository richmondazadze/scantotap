import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { LightLogin } from '../components/ui/sign-in';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
      console.log('AuthPage: User authenticated, checking profile status...');
      console.log('Profile:', profile);
      console.log('Intended plan:', intendedPlan);
      
      if (profile) {
        if (!profile.onboarding_complete) {
          console.log('AuthPage: Profile exists but onboarding incomplete, redirecting to onboarding');
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
          console.log('AuthPage: Profile complete, redirecting based on intended plan');
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
        console.log('AuthPage: No profile exists, redirecting to onboarding');
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
      {/* Animated Background Blobs */}
      <motion.svg 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute -top-32 -left-32 w-[400px] h-[300px] sm:w-[600px] sm:h-[400px] blur-2xl z-0 pointer-events-none" 
        viewBox="0 0 600 400" 
        fill="none"
      >
        <ellipse cx="300" cy="200" rx="300" ry="200" fill="url(#auth-gradient)" >
          <animate attributeName="rx" values="300;320;300" dur="8s" repeatCount="indefinite" />
          <animate attributeName="ry" values="200;220;200" dur="8s" repeatCount="indefinite" />
        </ellipse>
        <defs>
          <radialGradient id="auth-gradient" cx="0" cy="0" r="1" gradientTransform="translate(300 200) scale(300 200)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.2" />
          </radialGradient>
        </defs>
      </motion.svg>

      <motion.svg 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        className="absolute -bottom-32 -right-32 w-[300px] h-[200px] sm:w-[500px] sm:h-[300px] blur-2xl z-0 pointer-events-none" 
        viewBox="0 0 500 300" 
        fill="none"
      >
        <ellipse cx="250" cy="150" rx="250" ry="150" fill="url(#auth-gradient-2)" >
          <animate attributeName="rx" values="250;270;250" dur="10s" repeatCount="indefinite" />
          <animate attributeName="ry" values="150;170;150" dur="10s" repeatCount="indefinite" />
        </ellipse>
        <defs>
          <radialGradient id="auth-gradient-2" cx="0" cy="0" r="1" gradientTransform="translate(250 150) scale(250 150)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#3B82F6" stopOpacity="0.2" />
          </radialGradient>
        </defs>
      </motion.svg>

      {/* Auth Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="w-full max-w-md mx-auto relative z-10"
      >
        <div className="glassmorphism-card p-6 sm:p-8 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-white/10">
          {/* Show Pro plan intent message */}
          {intendedPlan === 'pro' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-gradient-to-r from-scan-blue/10 to-scan-purple/10 border border-scan-blue/20 rounded-xl"
            >
              <div className="flex items-center gap-2 text-scan-blue mb-2">
                <span className="text-lg">👑</span>
                <span className="font-semibold">Pro Plan Selected</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Sign in to continue with your Pro subscription setup.
              </p>
            </motion.div>
          )}
          <LightLogin />
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="mt-6 sm:mt-8 text-center text-sm text-gray-500 dark:text-gray-400 relative z-10 px-4"
      >
                  <p>Transform your networking with smart digital profiles</p>
      </motion.div>
    </div>
  );
} 