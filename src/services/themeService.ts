import { supabase } from '@/lib/supabaseClient';

export class ThemeService {
  /**
   * Update user's theme preference
   */
  static async updateThemePreference(profileId: string, themePreference: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme_preference: themePreference })
        .eq('id', profileId);

      if (error) {
        console.error('Error updating theme preference:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception updating theme preference:', error);
      return { success: false, error: 'Failed to update theme preference' };
    }
  }

  /**
   * Get user's theme preference
   */
  static async getThemePreference(profileId: string): Promise<{ themePreference: string | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('theme_preference')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching theme preference:', error);
        return { themePreference: null, error: error.message };
      }

      return { themePreference: data?.theme_preference || 'default' };
    } catch (error) {
      console.error('Exception fetching theme preference:', error);
      return { themePreference: null, error: 'Failed to fetch theme preference' };
    }
  }
} 