import { useProfile } from '@/contexts/ProfileContext';
import type { PlanType } from '@/contexts/ProfileContext';

export interface PlanFeatures {
  // Link limits
  maxLinks: number;
  canAddUnlimitedLinks: boolean;
  
  // Future features
  canAccessAnalytics: boolean;
  canUseCustomThemes: boolean;
  canUseCustomDomains: boolean;
  canDownloadVCard: boolean;
  canAccessTeamFeatures: boolean;
  
  // Plan info
  planType: PlanType;
  isProUser: boolean;
  isFreeUser: boolean;
}

export const usePlanFeatures = (): PlanFeatures => {
  const { profile } = useProfile();
  
  // Default to free plan if not specified
  const planType: PlanType = (profile?.plan_type as PlanType) || 'free';
  const isProUser = planType === 'pro';
  const isFreeUser = planType === 'free';

  return {
    // Link limits
    maxLinks: isProUser ? Infinity : 6,
    canAddUnlimitedLinks: isProUser,
    
    // Future features (all Pro-only)
    canAccessAnalytics: isProUser,
    canUseCustomThemes: isProUser,
    canUseCustomDomains: isProUser,
    canDownloadVCard: isProUser,
    canAccessTeamFeatures: isProUser,
    
    // Plan info
    planType,
    isProUser,
    isFreeUser,
  };
};

// Helper function to check if user can add more links
export const canAddMoreLinks = (currentLinkCount: number, planType: PlanType = 'free'): boolean => {
  if (planType === 'pro') return true;
  return currentLinkCount < 6;
};

// Helper function to get upgrade message for specific features
export const getUpgradeMessage = (feature: string): string => {
  const messages: Record<string, string> = {
    links: 'Upgrade to Pro to add unlimited links to your profile (free users limited to 6 links)',
    analytics: 'Upgrade to Pro to access detailed profile analytics',
    themes: 'Upgrade to Pro to customize your profile with premium themes',
    domains: 'Upgrade to Pro to use your own custom domain',
    vcard: 'Upgrade to Pro to enable vCard downloads for your visitors',
    team: 'Upgrade to Pro to access team management features',
  };
  
  return messages[feature] || 'Upgrade to Pro to unlock this feature';
}; 