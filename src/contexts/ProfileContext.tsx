import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { Json } from '@/types/supabase';
import { SubscriptionService } from '@/services/subscriptionService';

export type PlanType = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

interface Profile {
  id: string;
  user_id: string;
  slug?: string;
  name: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  links?: Json;
  created_at?: string;
  updated_at?: string;
  phone?: string;
  email?: string;
  onboarding_complete?: boolean;
  social_layout_style?: string;
  show_email?: boolean;
  show_phone?: boolean;
  use_username_instead_of_name?: boolean;
  wallpaper_preference?: string | null;
  theme_preference?: string | null;
  custom_background?: string | null;
  style_settings?: Json;
  // Remove show_whatsapp field
  paystack_customer_code?: string;
  paystack_subscription_code?: string;
  plan_type?: PlanType;
  subscription_status?: SubscriptionStatus;
  subscription_started_at?: string;
  subscription_expires_at?: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => void;
  setProfile: (profile: Profile) => void;
  createProfile: (profileData: Partial<Profile>) => Promise<Profile | null>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!session?.user.id) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    
    try {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      // Handle errors (but ignore "no rows returned" which is expected for new users)
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        setProfile(null);
        setLoading(false);
        return;
      }
      
      if (data) {
        // Profile exists - process normally
        
        // Cast database types to our typed interface
        const profile: Profile = {
          ...data,
          plan_type: (data.plan_type as PlanType) || 'free',
          subscription_status: data.subscription_status as SubscriptionStatus | undefined,
        };
        setProfile(profile);

        // Only sync plan type in very specific circumstances to prevent free users from being upgraded
        const hasActiveSubscriptionStatus = data.subscription_status === 'active' || 
                                           (data.subscription_status === 'cancelled');
        
        // CRITICAL: Don't sync if user completed onboarding with free plan and has no active subscription
        // This prevents users who selected "free" in onboarding from being incorrectly upgraded to Pro
        // even if they have any subscription metadata from visiting pricing page
        const isExplicitFreePlan = data.onboarding_complete && 
                                  data.plan_type === 'free' && 
                                  data.subscription_status !== 'active';

        if (hasActiveSubscriptionStatus && !isExplicitFreePlan) {
          try {
            const syncResult = await SubscriptionService.syncUserPlanType(session.user.id);
            if (syncResult.updated) {
              // Refetch profile if plan type was updated
              const { data: updatedData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
              
              if (updatedData) {
                const updatedProfile: Profile = {
                  ...updatedData,
                  plan_type: (updatedData.plan_type as PlanType) || 'free',
                  subscription_status: updatedData.subscription_status as SubscriptionStatus | undefined,
                };
                setProfile(updatedProfile);
              }
            }
          } catch (error) {
            console.error('Error syncing plan type:', error);
          }
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [session?.user.id]);

  const refreshProfile = () => {
    fetchProfile();
  };

  const createProfile = async (profileData: Partial<Profile>): Promise<Profile | null> => {
    if (!session?.user.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          user_id: session.user.id,
          email: session.user.email,
          ...profileData,
        })
        .select()
        .single();

      if (error) throw error;

      const newProfile: Profile = {
        ...data,
        plan_type: (data.plan_type as PlanType) || 'free',
        subscription_status: data.subscription_status as SubscriptionStatus | undefined,
      };

      setProfile(newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      loading,
      refreshProfile,
      setProfile,
      createProfile,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
