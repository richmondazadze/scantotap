import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useProfile } from '@/contexts/ProfileContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { createProfile } = useProfile();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          navigate('/auth');
          return;
        }

        if (session) {
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error checking profile:', profileError);
            navigate('/auth');
            return;
          }

          if (!profile) {
            // Create profile for new OAuth user
            try {
              console.log('Creating profile for new OAuth user:', session.user.email);
              
              const newProfile = await createProfile({
                email: session.user.email,
                name: session.user.user_metadata?.full_name || 
                      session.user.user_metadata?.name ||
                      session.user.email?.split('@')[0] || '',
                plan_type: 'free',
                onboarding_complete: false
              });

              if (!newProfile) {
                throw new Error('Failed to create profile');
              }
              
              console.log('Profile created successfully, redirecting to onboarding');
              // Redirect to onboarding for new users
              navigate('/onboarding', { replace: true });
            } catch (profileCreationError) {
              console.error('Failed to create profile:', profileCreationError);
              navigate('/auth', { 
                state: { 
                  error: 'Failed to create your profile. Please try again.' 
                } 
              });
            }
          } else {
            // Existing user - check onboarding status
            console.log('Existing user found, onboarding_complete:', profile.onboarding_complete);
            
            if (!profile.onboarding_complete) {
              navigate('/onboarding', { replace: true });
            } else {
          navigate('/dashboard/profile', { replace: true });
            }
          }
        } else {
          // No session found, redirect to auth page
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/auth', { 
          state: { 
            error: 'Authentication failed. Please try again.' 
          } 
        });
      }
    };
    
    handleAuthCallback();
  }, [navigate, createProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/80 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-scan-blue mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Completing authentication...</p>
      </div>
    </div>
  );
} 