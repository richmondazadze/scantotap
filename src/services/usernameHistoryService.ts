import { supabase } from '@/lib/supabaseClient';

export interface UsernameHistory {
  id: string;
  user_id: string;
  username: string;
  created_at: string;
  is_current: boolean;
}

export class UsernameHistoryService {
  /**
   * Add a username to the history
   */
  static async addUsernameHistory(userId: string, username: string, isCurrent: boolean = true): Promise<{ success: boolean; error?: string }> {
    try {
      // First, mark all existing usernames for this user as not current
      if (isCurrent) {
        await supabase
          .from('username_history')
          .update({ is_current: false })
          .eq('user_id', userId);
      }

      // Add the new username to history
      const { error } = await supabase
        .from('username_history')
        .insert({
          user_id: userId,
          username: username,
          is_current: isCurrent
        });

      if (error) {
        console.error('Error adding username to history:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception adding username to history:', error);
      return { success: false, error: 'Failed to add username to history' };
    }
  }

  /**
   * Get the current username for a user
   */
  static async getCurrentUsername(userId: string): Promise<{ username?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('username_history')
        .select('username')
        .eq('user_id', userId)
        .eq('is_current', true)
        .single();

      if (error) {
        console.error('Error getting current username:', error);
        return { error: error.message };
      }

      return { username: data?.username };
    } catch (error) {
      console.error('Exception getting current username:', error);
      return { error: 'Failed to get current username' };
    }
  }

  /**
   * Get the user ID for a given username (including historical)
   */
  static async getUserIdByUsername(username: string): Promise<{ userId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('username_history')
        .select('user_id')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error getting user ID by username:', error);
        return { error: error.message };
      }

      return { userId: data?.user_id };
    } catch (error) {
      console.error('Exception getting user ID by username:', error);
      return { error: 'Failed to get user ID by username' };
    }
  }

  /**
   * Get all usernames for a user
   */
  static async getUserUsernames(userId: string): Promise<{ usernames: UsernameHistory[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('username_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting user usernames:', error);
        return { usernames: [], error: error.message };
      }

      return { usernames: data || [] };
    } catch (error) {
      console.error('Exception getting user usernames:', error);
      return { usernames: [], error: 'Failed to get user usernames' };
    }
  }

  /**
   * Check if a username is available (not used by anyone)
   */
  static async isUsernameAvailable(username: string, currentUserId?: string): Promise<{ available: boolean; error?: string }> {
    try {
      // Check if username exists in history (any user, any time)
      const { data, error } = await supabase
        .from('username_history')
        .select('user_id, is_current')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        console.error('Error checking username availability:', error);
        return { available: false, error: error.message };
      }

      // If username doesn't exist in history, it's available
      if (!data) {
        return { available: true };
      }

      // If username exists, check if current user owns it
      if (currentUserId && data.user_id === currentUserId) {
        return { available: true }; // User can keep their own username
      }

      // Username is taken by someone else
      return { available: false };
    } catch (error) {
      console.error('Exception checking username availability:', error);
      return { available: false, error: 'Failed to check username availability' };
    }
  }

  /**
   * Update username for a user (with history tracking)
   */
  static async updateUsername(userId: string, newUsername: string, oldUsername: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Add old username to history (not current)
      await this.addUsernameHistory(userId, oldUsername, false);

      // Add new username to history (current)
      const result = await this.addUsernameHistory(userId, newUsername, true);

      return result;
    } catch (error) {
      console.error('Exception updating username:', error);
      return { success: false, error: 'Failed to update username' };
    }
  }
} 