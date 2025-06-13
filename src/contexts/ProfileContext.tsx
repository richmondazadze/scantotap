import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { Json } from '@/types/supabase';

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
    if (!error && data) setProfile(data);
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
        ...profileData
      })
      .select()
      .single();
    
    if (!error && data) {
      setProfile(data);
      return data;
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
