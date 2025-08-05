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

      // Get processed subscription data
      const subscription = await SubscriptionService.getUserSubscription(userId);

      // Get subscription details
      const details = await SubscriptionService.getSubscriptionDetails(userId);

      return {
        rawData,
        subscription,
        details,
        canCancel: details.canCancel,
        error: null
      };
    } catch (error) {
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
      return ['Error checking subscription data'];
    }
  }
} 