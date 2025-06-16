import { supabase } from '@/lib/supabaseClient';
import { PaystackService } from './paystackService';
import { PlanType, SubscriptionStatus } from '@/contexts/ProfileContext';

export interface SubscriptionInfo {
  plan_type: PlanType;
  subscription_status?: SubscriptionStatus;
  subscription_started_at?: string;
  subscription_expires_at?: string;
  paystack_customer_code?: string;
  paystack_subscription_code?: string;
}

// Database row type for type safety
interface SubscriptionRow {
  plan_type: string | null;
  subscription_status: string | null;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  paystack_customer_code: string | null;
  paystack_subscription_code: string | null;
}

export class SubscriptionService {
  /**
   * Get user's current subscription information
   */
  static async getUserSubscription(userId: string): Promise<SubscriptionInfo | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          plan_type,
          subscription_status,
          subscription_started_at,
          subscription_expires_at,
          paystack_customer_code,
          paystack_subscription_code
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Cast database types to our typed interface
      const row = data as SubscriptionRow;
      
      return {
        plan_type: (row.plan_type as PlanType) || 'free',
        subscription_status: row.subscription_status as SubscriptionStatus | undefined,
        subscription_started_at: row.subscription_started_at || undefined,
        subscription_expires_at: row.subscription_expires_at || undefined,
        paystack_customer_code: row.paystack_customer_code || undefined,
        paystack_subscription_code: row.paystack_subscription_code || undefined,
      };
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  /**
   * Check if user has active subscription
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return false;

    return this.isSubscriptionActive(
      subscription.subscription_status,
      subscription.subscription_expires_at
    );
  }

  /**
   * Check if subscription is currently active
   */
  static isSubscriptionActive(
    status?: SubscriptionStatus,
    expiresAt?: string
  ): boolean {
    if (!status || status === 'expired') return false;
    
    if (status === 'cancelled') {
      // Cancelled subscriptions are active until expiry
      if (!expiresAt) return false;
      return new Date(expiresAt) > new Date();
    }

    if (status === 'active') {
      if (!expiresAt) return true; // Assume active if no expiry
      return new Date(expiresAt) > new Date();
    }

    return false;
  }

  /**
   * Get user's effective plan (considering subscription status)
   */
  static async getUserPlan(userId: string): Promise<PlanType> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return 'free';

    // If subscription is active, return the plan type
    if (this.isSubscriptionActive(
      subscription.subscription_status,
      subscription.subscription_expires_at
    )) {
      return subscription.plan_type || 'free';
    }

    // If subscription is not active, return free
    return 'free';
  }

  /**
   * Upgrade user to Pro plan (handles new subscriptions and re-subscriptions)
   */
  static async upgradeUser(
    userId: string,
    userEmail: string,
    userName: string,
    billingCycle: 'monthly' | 'annually'
  ): Promise<{ success: boolean; error?: string; paymentUrl?: string }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      // Check if user already has active subscription
      const hasActive = await this.hasActiveSubscription(userId);
      if (hasActive) {
        return { success: false, error: 'User already has active subscription' };
      }

      // Log the upgrade attempt for debugging
      console.log('Upgrade attempt for user:', userId);
      console.log('Current subscription:', subscription);
      console.log('Has active subscription:', hasActive);

      // Clear any previous subscription data to ensure clean re-subscription
      if (subscription && (subscription.subscription_status === 'cancelled' || subscription.subscription_status === 'expired')) {
        console.log('Clearing previous subscription data for clean re-subscription');
        await this.clearSubscriptionData(userId);
      }

      // Initialize Paystack payment
      const result = await PaystackService.upgradeSubscription(
        userId,
        userEmail,
        userName,
        billingCycle
      );

      return { success: true, paymentUrl: result.authorization_url };
    } catch (error) {
      console.error('Error upgrading user:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Cancel user subscription
   */
  static async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      console.log('Cancellation attempt for user:', userId);
      console.log('Subscription data:', subscription);
      
      if (!subscription) {
        return { success: false, error: 'No subscription found for this user' };
      }

      // Check if user has an active subscription
      const isActive = this.isSubscriptionActive(
        subscription.subscription_status,
        subscription.subscription_expires_at
      );

      if (!isActive) {
        return { success: false, error: 'No active subscription to cancel' };
      }

      // If we have a Paystack subscription code, try to cancel it on Paystack
      if (subscription.paystack_subscription_code) {
        try {
          await PaystackService.cancelSubscription(subscription.paystack_subscription_code);
          console.log('Successfully cancelled subscription on Paystack');
        } catch (paystackError) {
          console.error('Failed to cancel on Paystack, but continuing with local cancellation:', paystackError);
          // Continue with local cancellation even if Paystack fails
        }
      } else {
        console.log('No Paystack subscription code found, performing local cancellation only');
      }

      // Determine cancellation strategy based on subscription data
      let cancellationData;
      
      if (subscription.subscription_expires_at) {
        const expiryDate = new Date(subscription.subscription_expires_at);
        const now = new Date();
        
        if (expiryDate > now) {
          // Subscription has time remaining - mark as cancelled but keep pro until expiry
          cancellationData = {
            plan_type: 'pro' as PlanType, // Keep pro until expiry
            subscription_status: 'cancelled' as SubscriptionStatus,
            subscription_started_at: subscription.subscription_started_at,
            subscription_expires_at: subscription.subscription_expires_at,
          };
          console.log(`Subscription will remain active until ${expiryDate.toISOString()}`);
        } else {
          // Subscription already expired - downgrade immediately
          cancellationData = {
            plan_type: 'free' as PlanType,
            subscription_status: 'cancelled' as SubscriptionStatus,
            subscription_started_at: undefined,
            subscription_expires_at: undefined,
          };
          console.log('Subscription expired, downgrading immediately');
        }
      } else {
        // No expiry date - immediate downgrade (likely a data issue)
        cancellationData = {
          plan_type: 'free' as PlanType,
          subscription_status: 'cancelled' as SubscriptionStatus,
          subscription_started_at: undefined,
          subscription_expires_at: undefined,
        };
        console.log('No expiry date found, performing immediate downgrade');
      }

      // Update local database
      await PaystackService.updateUserSubscription(userId, cancellationData);

      // Sync plan type to ensure consistency
      await this.syncUserPlanType(userId);

      console.log('Successfully cancelled subscription locally');
      return { success: true };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred while cancelling subscription' 
      };
    }
  }

  /**
   * Get subscription details for display
   */
  static async getSubscriptionDetails(userId: string): Promise<{
    plan: PlanType;
    status: SubscriptionStatus | null;
    isActive: boolean;
    expiresAt: Date | null;
    daysRemaining: number | null;
    canUpgrade: boolean;
    canCancel: boolean;
  }> {
    const subscription = await this.getUserSubscription(userId);
    const plan = await this.getUserPlan(userId);
    
    if (!subscription) {
      return {
        plan: 'free',
        status: null,
        isActive: false,
        expiresAt: null,
        daysRemaining: null,
        canUpgrade: true,
        canCancel: false,
      };
    }

    const isActive = this.isSubscriptionActive(
      subscription.subscription_status,
      subscription.subscription_expires_at
    );

    const expiresAt = subscription.subscription_expires_at 
      ? new Date(subscription.subscription_expires_at) 
      : null;

    const daysRemaining = expiresAt 
      ? Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Determine if user can upgrade (re-subscribe)
    const canUpgrade = !isActive || (subscription.subscription_status === 'cancelled' && (!expiresAt || expiresAt <= new Date()));
    
    // Determine if user can cancel (only active subscriptions that aren't already cancelled)
    const canCancel = isActive && subscription.subscription_status === 'active';

    return {
      plan,
      status: subscription.subscription_status || null,
      isActive,
      expiresAt,
      daysRemaining,
      canUpgrade,
      canCancel,
    };
  }

  /**
   * Check if user can perform action based on plan
   */
  static async canPerformAction(
    userId: string,
    action: 'add_link' | 'premium_cards' | 'analytics' | 'custom_domain'
  ): Promise<boolean> {
    const plan = await this.getUserPlan(userId);
    
    switch (action) {
      case 'add_link':
        // Free users have link limits, Pro users don't
        if (plan === 'pro') return true;
        
        // Check current link count for free users
        const { data } = await supabase
          .from('profiles')
          .select('links')
          .eq('id', userId)
          .single();
        
        const links = data?.links as any[] || [];
        return links.length < 10; // Free plan limit
      
      case 'premium_cards':
      case 'analytics':
      case 'custom_domain':
        return plan === 'pro';
      
      default:
        return false;
    }
  }

  /**
   * Get plan features and limits
   */
  static getPlanFeatures(plan: PlanType) {
    const features = {
      free: {
        maxLinks: 10,
        premiumCards: false,
        analytics: false,
        customDomain: false,
        prioritySupport: false,
        features: [
          'Up to 10 social links',
          'Basic card designs',
          'Standard support'
        ]
      },
      pro: {
        maxLinks: Infinity,
        premiumCards: true,
        analytics: true,
        customDomain: true,
        prioritySupport: true,
        features: [
          'Unlimited social links',
          'Premium card designs',
          'Advanced analytics',
          'Custom domain support',
          'Priority support'
        ]
      }
    };

    return features[plan];
  }

  /**
   * Process webhook events (called by webhook handler)
   */
  static async processWebhookEvent(
    eventType: string,
    customerEmail: string,
    eventData: any
  ): Promise<void> {
    // Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .single();

    if (!profile) {
      console.error('User not found for webhook event:', customerEmail);
      return;
    }

    switch (eventType) {
      case 'subscription_activated':
        await this.activateSubscription(profile.id, eventData);
        break;
      
      case 'subscription_cancelled':
        await this.markSubscriptionCancelled(profile.id, eventData);
        break;
      
      case 'subscription_expired':
        await this.expireSubscription(profile.id);
        break;
      
      case 'payment_failed':
        await this.handlePaymentFailure(profile.id, eventData);
        break;
    }
  }

  private static async activateSubscription(userId: string, eventData: any): Promise<void> {
    const startDate = new Date();
    const endDate = new Date();
    
    // Determine billing cycle from event data
    const isAnnual = eventData.billing_cycle === 'annually';
    if (isAnnual) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    await PaystackService.updateUserSubscription(userId, {
      plan_type: 'pro',
      subscription_status: 'active',
      subscription_started_at: startDate.toISOString(),
      subscription_expires_at: endDate.toISOString(),
    });
  }

  private static async markSubscriptionCancelled(userId: string, eventData: any): Promise<void> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return;

    await PaystackService.updateUserSubscription(userId, {
      plan_type: subscription.plan_type || 'free',
      subscription_status: 'cancelled',
      subscription_started_at: subscription.subscription_started_at,
      subscription_expires_at: subscription.subscription_expires_at,
    });
  }

  private static async expireSubscription(userId: string): Promise<void> {
    await PaystackService.updateUserSubscription(userId, {
      plan_type: 'free',
      subscription_status: 'expired',
      subscription_started_at: undefined,
      subscription_expires_at: undefined,
    });
  }

  private static async handlePaymentFailure(userId: string, eventData: any): Promise<void> {
    // Implement grace period logic
    // For now, just log the failure
    console.log(`Payment failed for user ${userId}:`, eventData);
    
    // You could implement:
    // - Send notification email
    // - Start grace period countdown
    // - Temporarily suspend some features
  }

  /**
   * Sync user plan type based on subscription status
   * This ensures the plan_type field accurately reflects the user's current access level
   */
  static async syncUserPlanType(userId: string): Promise<{ updated: boolean; newPlan: PlanType }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        // No subscription data, ensure user is on free plan
        await this.updatePlanType(userId, 'free');
        return { updated: true, newPlan: 'free' };
      }

      const isActive = this.isSubscriptionActive(
        subscription.subscription_status,
        subscription.subscription_expires_at
      );

      const correctPlanType: PlanType = isActive ? 'pro' : 'free';
      
      // Check if plan_type needs updating
      if (subscription.plan_type !== correctPlanType) {
        await this.updatePlanType(userId, correctPlanType);
        console.log(`Synced plan_type for user ${userId}: ${subscription.plan_type} → ${correctPlanType}`);
        return { updated: true, newPlan: correctPlanType };
      }

      return { updated: false, newPlan: correctPlanType };
    } catch (error) {
      console.error('Error syncing user plan type:', error);
      throw error;
    }
  }

  /**
   * Update user's plan type in the database
   */
  private static async updatePlanType(userId: string, planType: PlanType): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        plan_type: planType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating plan type:', error);
      throw error;
    }
  }

  /**
   * Clear subscription data for clean re-subscription
   */
  private static async clearSubscriptionData(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        plan_type: 'free',
        subscription_status: null,
        subscription_started_at: null,
        subscription_expires_at: null,
        paystack_customer_code: null,
        paystack_subscription_code: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error clearing subscription data:', error);
      throw error;
    }
    
    console.log(`Cleared subscription data for user ${userId}`);
  }

  /**
   * Reactivate a cancelled subscription (for re-subscription scenarios)
   */
  static async reactivateSubscription(
    userId: string,
    billingCycle: 'monthly' | 'annually'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return { success: false, error: 'No subscription found' };
      }

      if (subscription.subscription_status === 'active') {
        return { success: false, error: 'Subscription is already active' };
      }

      // Calculate new subscription dates
      const startDate = new Date();
      const endDate = new Date();
      
      if (billingCycle === 'annually') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // Reactivate subscription
      await PaystackService.updateUserSubscription(userId, {
        plan_type: 'pro',
        subscription_status: 'active',
        subscription_started_at: startDate.toISOString(),
        subscription_expires_at: endDate.toISOString(),
      });

      // Sync plan type
      await this.syncUserPlanType(userId);

      console.log(`Reactivated subscription for user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reactivate subscription' 
      };
    }
  }

  /**
   * Batch sync all users' plan types (for maintenance/cleanup)
   */
  static async batchSyncAllUsers(): Promise<{ processed: number; updated: number; errors: number }> {
    let processed = 0;
    let updated = 0;
    let errors = 0;

    try {
      // Get all users with subscription data
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, plan_type, subscription_status, subscription_expires_at')
        .not('subscription_status', 'is', null);

      if (error) throw error;

      for (const user of users || []) {
        try {
          processed++;
          const result = await this.syncUserPlanType(user.id);
          if (result.updated) {
            updated++;
          }
        } catch (error) {
          console.error(`Error syncing user ${user.id}:`, error);
          errors++;
        }
      }

      console.log(`Batch sync completed: ${processed} processed, ${updated} updated, ${errors} errors`);
      return { processed, updated, errors };
    } catch (error) {
      console.error('Error in batch sync:', error);
      throw error;
    }
  }

  /**
   * Check and expire subscriptions that have passed their expiry date
   */
  static async expireOverdueSubscriptions(): Promise<{ expired: number; errors: number }> {
    let expired = 0;
    let errors = 0;

    try {
      const now = new Date().toISOString();
      
      // Find subscriptions that should be expired
      const { data: overdueSubscriptions, error } = await supabase
        .from('profiles')
        .select('id, email, subscription_expires_at, plan_type')
        .eq('plan_type', 'pro')
        .lt('subscription_expires_at', now)
        .not('subscription_expires_at', 'is', null);

      if (error) throw error;

      for (const user of overdueSubscriptions || []) {
        try {
          await PaystackService.updateUserSubscription(user.id, {
            plan_type: 'free',
            subscription_status: 'expired',
            subscription_started_at: undefined,
            subscription_expires_at: undefined,
          });
          
          console.log(`Expired subscription for user ${user.id} (${user.email})`);
          expired++;
        } catch (error) {
          console.error(`Error expiring subscription for user ${user.id}:`, error);
          errors++;
        }
      }

      console.log(`Expired ${expired} overdue subscriptions with ${errors} errors`);
      return { expired, errors };
    } catch (error) {
      console.error('Error expiring overdue subscriptions:', error);
      throw error;
    }
  }

  /**
   * Validate and fix subscription data inconsistencies
   */
  static async validateAndFixSubscriptionData(userId: string): Promise<{
    isValid: boolean;
    issues: string[];
    fixed: boolean;
  }> {
    const issues: string[] = [];
    let fixed = false;

    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        return { isValid: true, issues: [], fixed: false };
      }

      // Check for inconsistencies
      const isActive = this.isSubscriptionActive(
        subscription.subscription_status,
        subscription.subscription_expires_at
      );

      // Issue 1: Plan type doesn't match subscription status
      if (isActive && subscription.plan_type !== 'pro') {
        issues.push('User has active subscription but plan_type is not pro');
        await this.updatePlanType(userId, 'pro');
        fixed = true;
      } else if (!isActive && subscription.plan_type === 'pro') {
        issues.push('User has inactive subscription but plan_type is still pro');
        await this.updatePlanType(userId, 'free');
        fixed = true;
      }

      // Issue 2: Expired subscription with active status
      if (subscription.subscription_expires_at) {
        const expiryDate = new Date(subscription.subscription_expires_at);
        const now = new Date();
        
        if (expiryDate < now && subscription.subscription_status === 'active') {
          issues.push('Subscription is marked as active but has expired');
          await PaystackService.updateUserSubscription(userId, {
            plan_type: 'free',
            subscription_status: 'expired',
            subscription_started_at: subscription.subscription_started_at,
            subscription_expires_at: subscription.subscription_expires_at,
          });
          fixed = true;
        }
      }

      // Issue 3: Missing subscription dates for active subscriptions
      if (subscription.subscription_status === 'active' && !subscription.subscription_expires_at) {
        issues.push('Active subscription missing expiry date');
        // This would need manual intervention or webhook replay
      }

      return {
        isValid: issues.length === 0,
        issues,
        fixed
      };
    } catch (error) {
      console.error('Error validating subscription data:', error);
      throw error;
    }
  }
} 