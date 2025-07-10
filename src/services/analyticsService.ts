import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// Types for analytics data
export interface ProfileAnalytics {
  id: string;
  profile_id: string;
  total_views: number;
  unique_visitors: number;
  views_this_month: number;
  views_this_week: number;
  views_today: number;
  total_link_clicks: number;
  link_clicks_this_month: number;
  link_clicks_this_week: number;
  link_clicks_today: number;
  mobile_views: number;
  desktop_views: number;
  tablet_views: number;
  last_view_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileVisit {
  id: string;
  profile_id: string;
  visitor_id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string;
  browser: string;
  os: string;
  country: string | null;
  city: string | null;
  referrer_url: string | null;
  referrer_domain: string | null;
  visited_at: string;
  session_duration: number;
}

export interface LinkClick {
  id: string;
  profile_id: string;
  link_type: string;
  link_label: string;
  link_url: string;
  platform: string | null;
  visitor_id: string;
  device_type: string;
  clicked_at: string;
}

export interface AnalyticsChartData {
  date: string;
  views: number;
  clicks: number;
}

export interface TopLinksData {
  platform: string;
  clicks: number;
  percentage: number;
}

export interface DeviceBreakdown {
  device: string;
  views: number;
  percentage: number;
}

class AnalyticsService {
  // Utility function to detect device type
  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/tablet|ipad|playbook|silk/.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  // Utility function to get browser info
  private getBrowserInfo(): { browser: string; os: string } {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect browser
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    // Detect OS
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'MacOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    return { browser, os };
  }

  // Generate anonymous visitor ID (GDPR compliant)
  private generateVisitorId(): string {
    const userAgent = navigator.userAgent;
    const screen = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    
    // Create a hash of non-personal identifiable information
    const fingerprint = `${userAgent}-${screen}-${timezone}-${language}`;
    
    // Simple hash function (in production, consider using crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  // Get referrer information
  private getReferrerInfo(): { referrer_url: string | null; referrer_domain: string | null } {
    const referrer = document.referrer;
    if (!referrer) return { referrer_url: null, referrer_domain: null };
    
    try {
      const url = new URL(referrer);
      return {
        referrer_url: referrer,
        referrer_domain: url.hostname
      };
    } catch {
      return { referrer_url: referrer, referrer_domain: null };
    }
  }

  // Track a profile visit
  async trackProfileVisit(profileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const deviceType = this.getDeviceType();
      const { browser, os } = this.getBrowserInfo();
      const visitorId = this.generateVisitorId();
      const { referrer_url, referrer_domain } = this.getReferrerInfo();

      const { error } = await supabase
        .from('profile_visits')
        .insert({
          profile_id: profileId,
          visitor_id: visitorId,
          device_type: deviceType,
          browser,
          os,
          referrer_url,
          referrer_domain,
          visited_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error tracking profile visit:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error tracking profile visit:', error);
      return { success: false, error: 'Failed to track visit' };
    }
  }

  // Track a link click
  async trackLinkClick(
    profileId: string,
    linkType: string,
    linkLabel: string,
    linkUrl: string,
    platform?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const deviceType = this.getDeviceType();
      const visitorId = this.generateVisitorId();

      const { error } = await supabase
        .from('link_clicks')
        .insert({
          profile_id: profileId,
          link_type: linkType,
          link_label: linkLabel,
          link_url: linkUrl,
          platform: platform || null,
          visitor_id: visitorId,
          device_type: deviceType,
          clicked_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error tracking link click:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error tracking link click:', error);
      return { success: false, error: 'Failed to track click' };
    }
  }

  // Get profile analytics summary
  async getProfileAnalytics(profileId: string): Promise<{ success: boolean; data?: ProfileAnalytics; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('profile_analytics')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile analytics:', error);
        return { success: false, error: error.message };
      }

      // If no analytics record exists, return default values
      if (!data) {
        const defaultAnalytics: ProfileAnalytics = {
          id: '',
          profile_id: profileId,
          total_views: 0,
          unique_visitors: 0,
          views_this_month: 0,
          views_this_week: 0,
          views_today: 0,
          total_link_clicks: 0,
          link_clicks_this_month: 0,
          link_clicks_this_week: 0,
          link_clicks_today: 0,
          mobile_views: 0,
          desktop_views: 0,
          tablet_views: 0,
          last_view_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { success: true, data: defaultAnalytics };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching profile analytics:', error);
      return { success: false, error: 'Failed to fetch analytics' };
    }
  }

  // Get chart data for the last 30 days
  async getAnalyticsChartData(profileId: string, days: number = 30): Promise<{ success: boolean; data?: AnalyticsChartData[]; error?: string }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // Get daily views
      const { data: visitsData, error: visitsError } = await supabase
        .from('profile_visits')
        .select('visited_at')
        .eq('profile_id', profileId)
        .gte('visited_at', startDate.toISOString())
        .lte('visited_at', endDate.toISOString());

      if (visitsError) {
        console.error('Error fetching visits data:', visitsError);
        return { success: false, error: visitsError.message };
      }

      // Get daily clicks
      const { data: clicksData, error: clicksError } = await supabase
        .from('link_clicks')
        .select('clicked_at')
        .eq('profile_id', profileId)
        .gte('clicked_at', startDate.toISOString())
        .lte('clicked_at', endDate.toISOString());

      if (clicksError) {
        console.error('Error fetching clicks data:', clicksError);
        return { success: false, error: clicksError.message };
      }

      // Process data into daily buckets
      const chartData: AnalyticsChartData[] = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        const viewsCount = visitsData?.filter(visit => 
          visit.visited_at.startsWith(dateStr)
        ).length || 0;

        const clicksCount = clicksData?.filter(click => 
          click.clicked_at.startsWith(dateStr)
        ).length || 0;

        chartData.push({
          date: dateStr,
          views: viewsCount,
          clicks: clicksCount
        });
      }

      return { success: true, data: chartData };
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return { success: false, error: 'Failed to fetch chart data' };
    }
  }

  // Get top performing links
  async getTopLinks(profileId: string, limit: number = 10): Promise<{ success: boolean; data?: TopLinksData[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('link_clicks')
        .select('platform, link_label')
        .eq('profile_id', profileId)
        .not('platform', 'is', null);

      if (error) {
        console.error('Error fetching top links:', error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { success: true, data: [] };
      }

      // Count clicks by platform
      const platformCounts: { [key: string]: number } = {};
      data.forEach(click => {
        if (click.platform) {
          platformCounts[click.platform] = (platformCounts[click.platform] || 0) + 1;
        }
      });

      // Calculate total clicks for percentage
      const totalClicks = Object.values(platformCounts).reduce((sum, count) => sum + count, 0);

      // Convert to array and sort
      const topLinks = Object.entries(platformCounts)
        .map(([platform, clicks]) => ({
          platform,
          clicks,
          percentage: Math.round((clicks / totalClicks) * 100)
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, limit);

      return { success: true, data: topLinks };
    } catch (error) {
      console.error('Error fetching top links:', error);
      return { success: false, error: 'Failed to fetch top links' };
    }
  }

  // Get device breakdown
  async getDeviceBreakdown(profileId: string): Promise<{ success: boolean; data?: DeviceBreakdown[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('profile_visits')
        .select('device_type')
        .eq('profile_id', profileId);

      if (error) {
        console.error('Error fetching device breakdown:', error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { success: true, data: [] };
      }

      // Count visits by device type
      const deviceCounts: { [key: string]: number } = {};
      data.forEach(visit => {
        deviceCounts[visit.device_type] = (deviceCounts[visit.device_type] || 0) + 1;
      });

      // Calculate total visits for percentage
      const totalVisits = data.length;

      // Convert to array and sort
      const deviceBreakdown = Object.entries(deviceCounts)
        .map(([device, views]) => ({
          device: device.charAt(0).toUpperCase() + device.slice(1),
          views,
          percentage: Math.round((views / totalVisits) * 100)
        }))
        .sort((a, b) => b.views - a.views);

      return { success: true, data: deviceBreakdown };
    } catch (error) {
      console.error('Error fetching device breakdown:', error);
      return { success: false, error: 'Failed to fetch device breakdown' };
    }
  }

  // Get recent visits (for activity feed)
  async getRecentVisits(profileId: string, limit: number = 20): Promise<{ success: boolean; data?: ProfileVisit[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('profile_visits')
        .select('*')
        .eq('profile_id', profileId)
        .order('visited_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent visits:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching recent visits:', error);
      return { success: false, error: 'Failed to fetch recent visits' };
    }
  }

  // Get recent link clicks (for activity feed)
  async getRecentClicks(profileId: string, limit: number = 20): Promise<{ success: boolean; data?: LinkClick[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('link_clicks')
        .select('*')
        .eq('profile_id', profileId)
        .order('clicked_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent clicks:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching recent clicks:', error);
      return { success: false, error: 'Failed to fetch recent clicks' };
    }
  }

  // Privacy-focused function to clear analytics data (GDPR compliance)
  async clearAnalyticsData(profileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear profile visits
      const { error: visitsError } = await supabase
        .from('profile_visits')
        .delete()
        .eq('profile_id', profileId);

      if (visitsError) {
        console.error('Error clearing visits:', visitsError);
        return { success: false, error: visitsError.message };
      }

      // Clear link clicks
      const { error: clicksError } = await supabase
        .from('link_clicks')
        .delete()
        .eq('profile_id', profileId);

      if (clicksError) {
        console.error('Error clearing clicks:', clicksError);
        return { success: false, error: clicksError.message };
      }

      // Reset analytics counters
      const { error: analyticsError } = await supabase
        .from('profile_analytics')
        .delete()
        .eq('profile_id', profileId);

      if (analyticsError) {
        console.error('Error clearing analytics:', analyticsError);
        return { success: false, error: analyticsError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error clearing analytics data:', error);
      return { success: false, error: 'Failed to clear analytics data' };
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService; 