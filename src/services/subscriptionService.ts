import { supabase } from '@/lib/supabaseClient';
import { PaystackService } from './paystackService';

export type PlanType = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export interface SubscriptionInfo {
  plan_type: PlanType;
  subscription_status?: SubscriptionStatus;
}

// Simplified database row type for type safety
interface SubscriptionRow {
  plan_type: string | null;
  subscription_status: string | null;
}

export class SubscriptionService {
  
  /**
   * Get user subscription info (simplified)
   */
  static async getUserSubscription(userId: string): Promise<SubscriptionInfo | null> {
    try {
      const { data: row, error } = await supabase
        .from('profiles')
        .select('plan_type, subscription_status')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      if (!row) return null;

      return {
        plan_type: (row.plan_type as PlanType) || 'free',
        subscription_status: row.subscription_status as SubscriptionStatus | undefined,
      };
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      return null;
    }
  }

  /**
   * Check if user has active subscription (simplified)
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return false;
    
    return this.isSubscriptionActive(subscription.subscription_status);
  }

  /**
   * Check if subscription status indicates active subscription (simplified)
   */
  static isSubscriptionActive(status?: SubscriptionStatus): boolean {
    return status === 'active' || status === 'trial';
  }

  /**
   * Get user's current plan type
   */
  static async getUserPlan(userId: string): Promise<PlanType> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return 'free';
    
    // If subscription is active, return pro plan
    if (this.isSubscriptionActive(subscription.subscription_status)) {
      return 'pro';
    }
    
    // Otherwise return the stored plan type (usually 'free')
    return subscription.plan_type || 'free';
  }

  /**
   * Upgrade user to Pro plan
   */
  static async upgradeUser(
    userId: string,
    userEmail: string,
    userName: string,
    billingCycle: 'monthly' | 'annually'
  ): Promise<{ success: boolean; error?: string; paymentUrl?: string }> {
    try {
      const result = await PaystackService.upgradeSubscription(
        userId,
        userEmail,
        userName,
        billingCycle
      );

      return {
        success: true,
        paymentUrl: result.authorization_url
      };
    } catch (error) {
      console.error('Error upgrading user:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Cancel subscription (simplified)
   */
  static async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return { success: false, error: 'No subscription found' };
      }

      // Update status to cancelled
      await this.updateSubscriptionInfo(userId, 'free', 'cancelled');
      
      return { success: true };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { success: false, error: 'Failed to cancel subscription' };
    }
  }

  /**
   * Get subscription details (simplified)
   */
  static async getSubscriptionDetails(userId: string): Promise<{
    plan: PlanType;
    status: SubscriptionStatus | null;
    isActive: boolean;
    canUpgrade: boolean;
    canCancel: boolean;
  }> {
    const subscription = await this.getUserSubscription(userId);
    const plan = subscription?.plan_type || 'free';
    const status = subscription?.subscription_status || null;
    const isActive = this.isSubscriptionActive(status);

    return {
      plan,
      status,
      isActive,
      canUpgrade: !isActive,
      canCancel: isActive,
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
        if (plan === 'pro') return true;
        
        // Check current link count for free users
        const { data } = await supabase
          .from('profiles')
          .select('links')
          .eq('id', userId)
          .single();
        
        const links = data?.links as any[] || [];
        return links.length < 7; // Free plan limit
      
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
        maxLinks: 6,
        premiumCards: false,
        analytics: false,
        customDomain: false,
        prioritySupport: false,
        features: [
          'Up to 7 social links',
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
   * Update subscription status
   */
  static async updateSubscriptionStatus(userId: string, status: SubscriptionStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating subscription status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating subscription status:', error);
      return false;
    }
  }

  /**
   * Update user subscription info (simplified)
   */
  static async updateSubscriptionInfo(
    userId: string, 
    planType: PlanType,
    status?: SubscriptionStatus
  ): Promise<boolean> {
    try {
      const updateData: any = {
        plan_type: planType,
        updated_at: new Date().toISOString()
      };

      if (status) {
        updateData.subscription_status = status;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Error updating subscription info:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating subscription info:', error);
      return false;
    }
  }

  /**
   * Sync user plan type based on subscription status (simplified)
   */
  static async syncUserPlanType(userId: string): Promise<{ updated: boolean; newPlan: PlanType }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return { updated: false, newPlan: 'free' };
      }

      // Determine correct plan based on subscription status
      const shouldBePro = this.isSubscriptionActive(subscription.subscription_status);
      const currentPlan = subscription.plan_type || 'free';
      const correctPlan: PlanType = shouldBePro ? 'pro' : 'free';

      // Only update if there's a mismatch
      if (currentPlan !== correctPlan) {
        await this.updateSubscriptionInfo(userId, correctPlan);
        return { updated: true, newPlan: correctPlan };
      }

      return { updated: false, newPlan: currentPlan };
    } catch (error) {
      console.error('Error syncing user plan type:', error);
      return { updated: false, newPlan: 'free' };
    }
  }

  /**
   * Process webhook events (simplified)
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
        await this.updateSubscriptionInfo(profile.id, 'pro', 'active');
        break;
      
      case 'subscription_cancelled':
        await this.updateSubscriptionInfo(profile.id, 'free', 'cancelled');
        break;
      
      case 'subscription_expired':
        await this.updateSubscriptionInfo(profile.id, 'free', 'expired');
        break;
      
      case 'payment_failed':
        console.log(`Payment failed for user ${profile.id}:`, eventData);
        break;
    }
  }

  /**
   * Expire overdue subscriptions
   */
  static async expireOverdueSubscriptions(): Promise<{ expired: number; errors: number }> {
    try {
      let expired = 0;
      let errors = 0;

      // Find subscriptions that should be expired
      // This is a simplified implementation - in production you'd check against payment provider data
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, subscription_status, plan_type')
        .in('subscription_status', ['active', 'trial']);

      if (error) {
        console.error('Error fetching profiles for expiration:', error);
        return { expired: 0, errors: 1 };
      }

      // For now, we'll just count how many would be processed
      // In a real implementation, you'd check against payment provider APIs
      for (const profile of profiles || []) {
        try {
          // Placeholder logic - you'd implement actual expiration logic here
          // For example, checking if payment failed or subscription ended
          
          // For demo purposes, let's just count them as processed
          expired++;
        } catch (error) {
          console.error(`Error expiring subscription for user ${profile.id}:`, error);
          errors++;
        }
      }

      return { expired, errors };
    } catch (error) {
      console.error('Error in expireOverdueSubscriptions:', error);
      return { expired: 0, errors: 1 };
    }
  }

  /**
   * Batch sync all users' plan types
   */
  static async batchSyncAllUsers(): Promise<{ processed: number; updated: number; errors: number }> {
    try {
      let processed = 0;
      let updated = 0;
      let errors = 0;

      // Get all profiles with subscription data
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, subscription_status, plan_type');

      if (error) {
        console.error('Error fetching profiles for sync:', error);
        return { processed: 0, updated: 0, errors: 1 };
      }

      // Sync each user's plan type
      for (const profile of profiles || []) {
        try {
          processed++;
          const result = await this.syncUserPlanType(profile.id);
          if (result.updated) {
            updated++;
          }
        } catch (error) {
          console.error(`Error syncing user ${profile.id}:`, error);
          errors++;
        }
      }

      return { processed, updated, errors };
    } catch (error) {
      console.error('Error in batchSyncAllUsers:', error);
      return { processed: 0, updated: 0, errors: 1 };
    }
  }

  /**
   * Validate and fix subscription data for a user
   */
  static async validateAndFixSubscriptionData(userId: string): Promise<{
    isValid: boolean;
    issues: string[];
    fixed: boolean;
  }> {
    try {
      const issues: string[] = [];
      let fixed = false;

      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        issues.push('No subscription data found');
        // Create default subscription data
        await this.updateSubscriptionInfo(userId, 'free');
        fixed = true;
      } else {
        // Check for inconsistencies
        const shouldBePro = this.isSubscriptionActive(subscription.subscription_status);
        const currentPlan = subscription.plan_type || 'free';
        const correctPlan: PlanType = shouldBePro ? 'pro' : 'free';

        if (currentPlan !== correctPlan) {
          issues.push(`Plan type mismatch: has ${currentPlan}, should be ${correctPlan}`);
          await this.updateSubscriptionInfo(userId, correctPlan);
          fixed = true;
        }

        // Check for missing status
        if (!subscription.subscription_status) {
          issues.push('Missing subscription status');
          await this.updateSubscriptionStatus(userId, 'active');
          fixed = true;
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
        fixed
      };
    } catch (error) {
      console.error('Error validating subscription data:', error);
      return {
        isValid: false,
        issues: ['Validation error occurred'],
        fixed: false
      };
    }
  }
} 