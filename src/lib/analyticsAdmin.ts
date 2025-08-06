import { supabase } from './supabaseClient';
import { analyticsService } from '../services/analyticsService';

export class AnalyticsAdmin {
  // Get analytics status for all profiles
  static async getAnalyticsStatus() {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, slug, name, created_at');

      if (error) {
        console.error('Error fetching profiles:', error);
        return { success: false, error: error.message };
      }

      const status = await Promise.all(
        profiles.map(async (profile) => {
          const analytics = await analyticsService.getProfileAnalytics(profile.id);
          const visits = await analyticsService.getRecentVisits(profile.id, 1);
          const clicks = await analyticsService.getRecentClicks(profile.id, 1);

          return {
            profile_id: profile.id,
            slug: profile.slug,
            name: profile.name,
            created_at: profile.created_at,
            has_analytics: analytics.success && analytics.data,
            total_views: analytics.data?.total_views || 0,
            unique_visitors: analytics.data?.unique_visitors || 0,
            total_clicks: analytics.data?.total_link_clicks || 0,
            has_visits: visits.success && visits.data && visits.data.length > 0,
            has_clicks: clicks.success && clicks.data && clicks.data.length > 0,
            last_visit: visits.data?.[0]?.visited_at || null,
            last_click: clicks.data?.[0]?.clicked_at || null
          };
        })
      );

      return { success: true, data: status };
    } catch (error) {
      console.error('Error getting analytics status:', error);
      return { success: false, error: 'Failed to get analytics status' };
    }
  }

  // Fix analytics for a specific profile
  static async fixProfileAnalytics(profileId: string) {
    try {
      // First, recalculate analytics
      const recalcResult = await analyticsService.recalculateAnalytics(profileId);
      if (!recalcResult.success) {
        return recalcResult;
      }

      // Then, get the updated analytics
      const analyticsResult = await analyticsService.getProfileAnalytics(profileId);
      if (!analyticsResult.success) {
        return analyticsResult;
      }

      return {
        success: true,
        data: analyticsResult.data,
        message: 'Analytics recalculated successfully'
      };
    } catch (error) {
      console.error('Error fixing profile analytics:', error);
      return { success: false, error: 'Failed to fix analytics' };
    }
  }

  // Fix analytics for all profiles
  static async fixAllAnalytics() {
    try {
      const recalcResult = await analyticsService.recalculateAllAnalytics();
      if (!recalcResult.success) {
        return recalcResult;
      }

      // Get updated status
      const statusResult = await this.getAnalyticsStatus();
      if (!statusResult.success) {
        return statusResult;
      }

      return {
        success: true,
        data: statusResult.data,
        message: 'All analytics recalculated successfully'
      };
    } catch (error) {
      console.error('Error fixing all analytics:', error);
      return { success: false, error: 'Failed to fix all analytics' };
    }
  }

  // Test analytics for a profile
  static async testProfileAnalytics(profileId: string) {
    try {
      // Insert test data
      const testResult = await analyticsService.testAnalyticsInsertion(profileId);
      if (!testResult.success) {
        return testResult;
      }

      // Wait a moment for triggers to process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get updated analytics
      const analyticsResult = await analyticsService.getProfileAnalytics(profileId);
      if (!analyticsResult.success) {
        return analyticsResult;
      }

      return {
        success: true,
        data: analyticsResult.data,
        message: 'Test data inserted and analytics updated'
      };
    } catch (error) {
      console.error('Error testing profile analytics:', error);
      return { success: false, error: 'Failed to test analytics' };
    }
  }

  // Get raw analytics data for debugging
  static async getRawAnalyticsData(profileId: string) {
    try {
      const [visitsResult, clicksResult, analyticsResult] = await Promise.all([
        supabase
          .from('profile_visits')
          .select('*')
          .eq('profile_id', profileId)
          .order('visited_at', { ascending: false }),
        supabase
          .from('link_clicks')
          .select('*')
          .eq('profile_id', profileId)
          .order('clicked_at', { ascending: false }),
        supabase
          .from('profile_analytics')
          .select('*')
          .eq('profile_id', profileId)
          .single()
      ]);

      return {
        success: true,
        data: {
          visits: visitsResult.data || [],
          clicks: clicksResult.data || [],
          analytics: analyticsResult.data || null,
          visitsError: visitsResult.error,
          clicksError: clicksResult.error,
          analyticsError: analyticsResult.error
        }
      };
    } catch (error) {
      console.error('Error getting raw analytics data:', error);
      return { success: false, error: 'Failed to get raw analytics data' };
    }
  }

  // Clear test data for a profile
  static async clearTestData(profileId: string) {
    try {
      const { error: visitsError } = await supabase
        .from('profile_visits')
        .delete()
        .eq('profile_id', profileId)
        .like('visitor_id', 'test_%');

      const { error: clicksError } = await supabase
        .from('link_clicks')
        .delete()
        .eq('profile_id', profileId)
        .like('visitor_id', 'test_%');

      if (visitsError || clicksError) {
        return {
          success: false,
          error: `Failed to clear test data: ${visitsError?.message || ''} ${clicksError?.message || ''}`
        };
      }

      // Recalculate analytics after clearing test data
      const recalcResult = await analyticsService.recalculateAnalytics(profileId);
      if (!recalcResult.success) {
        return recalcResult;
      }

      return {
        success: true,
        message: 'Test data cleared and analytics recalculated'
      };
    } catch (error) {
      console.error('Error clearing test data:', error);
      return { success: false, error: 'Failed to clear test data' };
    }
  }
} 