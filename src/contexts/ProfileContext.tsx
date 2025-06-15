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
  show_whatsapp?: boolean;
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
    if (!session?.user.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (!error && data) {
      // Cast database types to our typed interface
      const profile: Profile = {
        ...data,
        plan_type: (data.plan_type as PlanType) || 'free',
        subscription_status: data.subscription_status as SubscriptionStatus | undefined,
      };
      setProfile(profile);

      // Sync plan type to ensure accuracy
      try {
        const syncResult = await SubscriptionService.syncUserPlanType(session.user.id);
        if (syncResult.updated) {
          // Refetch profile if plan type was updated
          const { data: updatedData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
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
        // Don't fail the profile fetch if sync fails
      }
    }
    setLoading(false);
  };

  const createProfile = async (profileData: Partial<Profile>): Promise<Profile | null> => {
    if (!session?.user.id) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        user_id: session.user.id,
        email: session.user.email,
        name: '',
        onboarding_complete: false,
        plan_type: 'free', // Default to free plan
        ...profileData
      })
      .select()
      .single();
    
    if (!error && data) {
      // Cast database types to our typed interface
      const profile: Profile = {
        ...data,
        plan_type: (data.plan_type as PlanType) || 'free',
        subscription_status: data.subscription_status as SubscriptionStatus | undefined,
      };
      setProfile(profile);
      return profile;
    }
    return null;
  };

  useEffect(() => {
    if (session?.user.id) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [session?.user.id]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile: fetchProfile, setProfile, createProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
}
