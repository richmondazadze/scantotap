import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface NotificationPreferences {
  email_order_updates: boolean;
  email_marketing: boolean;
}

export interface NotificationResponse {
  success: boolean;
  preferences?: NotificationPreferences;
  error?: string;
}

export class ProfileNotificationService {
  /**
   * Get user notification preferences from profile
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationResponse> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email_order_updates, email_marketing')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching notification preferences:', error);
        return { success: false, error: error.message };
      }

      if (!profile) {
        return { success: false, error: 'Profile not found' };
      }

      return {
        success: true,
        preferences: {
          email_order_updates: profile.email_order_updates,
          email_marketing: profile.email_marketing,
        }
      };
    } catch (error) {
      console.error('Unexpected error in getNotificationPreferences:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Update user notification preferences in profile
   */
  static async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationResponse> {
    try {
      const updates: ProfileUpdate = {
        ...preferences,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select('email_order_updates, email_marketing')
        .single();

      if (error) {
        console.error('Error updating notification preferences:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        preferences: {
          email_order_updates: data.email_order_updates,
          email_marketing: data.email_marketing,
        }
      };
    } catch (error) {
      console.error('Unexpected error in updateNotificationPreferences:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Update a single notification preference
   */
  static async updateSinglePreference(
    userId: string,
    preferenceKey: keyof NotificationPreferences,
    value: boolean
  ): Promise<NotificationResponse> {
    try {
      const updates = { [preferenceKey]: value };
      return await this.updateNotificationPreferences(userId, updates);
    } catch (error) {
      console.error('Unexpected error in updateSinglePreference:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Check if user has enabled a specific notification type
   * This is useful for email services to check before sending
   */
  static async hasNotificationEnabled(
    userId: string,
    notificationType: keyof NotificationPreferences
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(notificationType)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.error('Error checking notification preference:', error);
        // Default to true for order updates, false for marketing
        return notificationType === 'email_order_updates';
      }

      return data[notificationType] as boolean;
    } catch (error) {
      console.error('Unexpected error in hasNotificationEnabled:', error);
      // Default to true for order updates (important), false for marketing
      return notificationType === 'email_order_updates';
    }
  }

  /**
   * Migrate existing localStorage settings to profile table
   * This is for one-time migration of existing users
   */
  static async migrateLocalStorageSettings(userId: string, localSettings: any): Promise<NotificationResponse> {
    try {
      // Check if user already has notification preferences set (not null)
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('email_order_updates, email_marketing')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error checking existing profile:', fetchError);
        return { success: false, error: fetchError.message };
      }

      // If preferences are already set, don't migrate
      if (existingProfile && 
          existingProfile.email_order_updates !== null && 
          existingProfile.email_marketing !== null) {
        return { 
          success: true, 
          preferences: {
            email_order_updates: existingProfile.email_order_updates,
            email_marketing: existingProfile.email_marketing,
          }
        };
      }

      // Map localStorage settings to profile format
      const preferencesToMigrate: ProfileUpdate = {
        email_order_updates: localSettings?.notifications?.email_orders ?? true,
        email_marketing: localSettings?.notifications?.email_marketing ?? false,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(preferencesToMigrate)
        .eq('user_id', userId)
        .select('email_order_updates, email_marketing')
        .single();

      if (error) {
        console.error('Error migrating localStorage settings:', error);
        return { success: false, error: error.message };
      }

      // Clear localStorage after successful migration
      localStorage.removeItem(`user_settings_${userId}`);

      return { 
        success: true, 
        preferences: {
          email_order_updates: data.email_order_updates,
          email_marketing: data.email_marketing,
        }
      };
    } catch (error) {
      console.error('Unexpected error in migrateLocalStorageSettings:', error);
      return { success: false, error: 'An unexpected error occurred during migration' };
    }
  }
}

export default ProfileNotificationService; 