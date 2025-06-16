import { SubscriptionService } from '@/services/subscriptionService';
import { supabase } from '@/lib/supabaseClient';

/**
 * Debug utility to check subscription data
 * This helps troubleshoot subscription-related issues
 */
export class SubscriptionDebug {
  /**
   * Debug a user's subscription data
   */
  static async debugUserSubscription(userId: string) {
    console.log('=== SUBSCRIPTION DEBUG ===');
    console.log('User ID:', userId);
    
    try {
      // Get raw database data
      const { data: rawData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          plan_type,
          subscription_status,
          subscription_started_at,
          subscription_expires_at,
          paystack_customer_code,
          paystack_subscription_code
        `)
        .eq('id', userId)
        .single();

      console.log('Raw database data:', rawData);
      console.log('Database error:', error);

      // Get processed subscription data
      const subscription = await SubscriptionService.getUserSubscription(userId);
      console.log('Processed subscription data:', subscription);

      // Get subscription details
      const details = await SubscriptionService.getSubscriptionDetails(userId);
      console.log('Subscription details:', details);

      // Check if subscription is active
      if (subscription) {
        const isActive = SubscriptionService.isSubscriptionActive(
          subscription.subscription_status,
          subscription.subscription_expires_at
        );
        console.log('Is subscription active?', isActive);
        
        // Check expiry
        if (subscription.subscription_expires_at) {
          const expiryDate = new Date(subscription.subscription_expires_at);
          const now = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          console.log('Days until expiry:', daysUntilExpiry);
          console.log('Expiry date:', expiryDate.toISOString());
        }
      }

      console.log('=== END DEBUG ===');

      return {
        rawData,
        subscription,
        details,
        canCancel: details.canCancel,
        error: null
      };
    } catch (error) {
      console.error('Debug error:', error);
      return { error };
    }
  }

  /**
   * Quick check if a user can cancel their subscription
   */
  static async canUserCancel(userId: string): Promise<boolean> {
    try {
      const details = await SubscriptionService.getSubscriptionDetails(userId);
      return details.canCancel;
    } catch (error) {
      console.error('Error checking if user can cancel:', error);
      return false;
    }
  }

  /**
   * Get a summary of subscription issues
   */
  static async getSubscriptionIssues(userId: string): Promise<string[]> {
    const issues: string[] = [];
    
    try {
      const subscription = await SubscriptionService.getUserSubscription(userId);
      
      if (!subscription) {
        issues.push('No subscription data found');
        return issues;
      }

      // Check for missing Paystack codes
      if (!subscription.paystack_customer_code) {
        issues.push('Missing Paystack customer code');
      }
      
      if (!subscription.paystack_subscription_code) {
        issues.push('Missing Paystack subscription code');
      }

      // Check for inconsistent data
      const isActive = SubscriptionService.isSubscriptionActive(
        subscription.subscription_status,
        subscription.subscription_expires_at
      );

      if (subscription.plan_type === 'pro' && !isActive) {
        issues.push('User has pro plan but inactive subscription');
      }

      if (subscription.plan_type === 'free' && isActive) {
        issues.push('User has free plan but active subscription');
      }

      // Check for expired subscriptions
      if (subscription.subscription_expires_at) {
        const expiryDate = new Date(subscription.subscription_expires_at);
        const now = new Date();
        
        if (expiryDate < now && subscription.subscription_status === 'active') {
          issues.push('Subscription is marked as active but has expired');
        }
      }

      return issues;
    } catch (error) {
      console.error('Error getting subscription issues:', error);
      return ['Error checking subscription data'];
    }
  }
} 