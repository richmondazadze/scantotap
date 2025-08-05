import { SubscriptionService } from '@/services/subscriptionService';
import { PlanType, SubscriptionStatus } from '@/contexts/ProfileContext';

/**
 * Comprehensive subscription state management utility
 * Handles all subscription scenarios and state transitions
 */
export class SubscriptionStateManager {
  
  /**
   * Get the current subscription state with detailed analysis
   */
  static async getSubscriptionState(userId: string) {
    const subscription = await SubscriptionService.getUserSubscription(userId);
    const details = await SubscriptionService.getSubscriptionDetails(userId);
    
    if (!subscription) {
      return {
        state: 'no_subscription',
        canSubscribe: true,
        canCancel: false,
        canResubscribe: false,
        message: 'No subscription found',
        subscription: null,
        details
      };
    }

    const isActive = SubscriptionService.isSubscriptionActive(
      subscription.subscription_status,
      subscription.subscription_expires_at
    );

    // Determine current state
    let state: string;
    let canSubscribe = false;
    let canCancel = false;
    let canResubscribe = false;
    let message = '';

    if (subscription.subscription_status === 'active' && isActive) {
      state = 'active';
      canCancel = true;
      message = 'Subscription is active';
    } else if (subscription.subscription_status === 'cancelled') {
      if (isActive) {
        state = 'cancelled_but_active';
        message = 'Subscription cancelled but still active until expiry';
      } else {
        state = 'cancelled_and_expired';
        canResubscribe = true;
        canSubscribe = true;
        message = 'Subscription cancelled and expired - can resubscribe';
      }
    } else if (subscription.subscription_status === 'expired') {
      state = 'expired';
      canResubscribe = true;
      canSubscribe = true;
      message = 'Subscription expired - can resubscribe';
    } else if (!subscription.subscription_status) {
      state = 'incomplete';
      canSubscribe = true;
      message = 'Incomplete subscription data - can subscribe';
    } else {
      state = 'unknown';
      canSubscribe = true;
      message = 'Unknown subscription state';
    }

    return {
      state,
      canSubscribe,
      canCancel,
      canResubscribe,
      message,
      subscription,
      details,
      isActive
    };
  }

  /**
   * Handle subscription cancellation with proper state management
   */
  static async cancelSubscription(userId: string) {
    const currentState = await this.getSubscriptionState(userId);
    
    if (!currentState.canCancel) {
      return { 
        success: false, 
        error: `Cannot cancel subscription in state: ${currentState.state}` 
      };
    }

    return await SubscriptionService.cancelSubscription(userId);
  }

  /**
   * Handle subscription upgrade/resubscription with proper state management
   */
  static async handleSubscription(
    userId: string, 
    userEmail: string, 
    userName: string, 
    billingCycle: 'monthly' | 'annually'
  ) {
    const currentState = await this.getSubscriptionState(userId);
    


    if (!currentState.canSubscribe && !currentState.canResubscribe) {
      return { 
        success: false, 
        error: `Cannot subscribe in current state: ${currentState.state}` 
      };
    }

    // Use the existing upgrade method which now handles re-subscriptions
    return await SubscriptionService.upgradeUser(userId, userEmail, userName, billingCycle);
  }

  /**
   * Validate subscription data consistency
   */
  static async validateSubscriptionConsistency(userId: string) {
    const issues: string[] = [];
    const subscription = await SubscriptionService.getUserSubscription(userId);
    
    if (!subscription) {
      return { isValid: true, issues: [] };
    }

    const isActive = SubscriptionService.isSubscriptionActive(
      subscription.subscription_status,
      subscription.subscription_expires_at
    );

    // Check plan_type consistency
    if (isActive && subscription.plan_type !== 'pro') {
      issues.push('User has active subscription but plan_type is not pro');
    }
    
    if (!isActive && subscription.plan_type === 'pro') {
      issues.push('User has inactive subscription but plan_type is still pro');
    }

    // Check expiry date consistency
    if (subscription.subscription_status === 'active' && subscription.subscription_expires_at) {
      const expiryDate = new Date(subscription.subscription_expires_at);
      const now = new Date();
      
      if (expiryDate < now) {
        issues.push('Subscription marked as active but has expired');
      }
    }

    // Check for missing data
    if (subscription.subscription_status === 'active' && !subscription.subscription_started_at) {
      issues.push('Active subscription missing start date');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Fix subscription data inconsistencies
   */
  static async fixSubscriptionInconsistencies(userId: string) {
    const validation = await this.validateSubscriptionConsistency(userId);
    
    if (validation.isValid) {
      return { fixed: false, message: 'No issues found' };
    }

    // Use the existing sync method to fix issues
    const syncResult = await SubscriptionService.syncUserPlanType(userId);
    
    return {
      fixed: syncResult.updated,
      message: syncResult.updated 
        ? `Fixed plan type: updated to ${syncResult.newPlan}` 
        : 'No fixes applied',
      issues: validation.issues
    };
  }

  /**
   * Get user-friendly subscription status message
   */
  static async getStatusMessage(userId: string): Promise<string> {
    const state = await this.getSubscriptionState(userId);
    
    switch (state.state) {
      case 'active':
        const daysRemaining = state.details.daysRemaining;
        if (daysRemaining && daysRemaining > 0) {
          return `Pro subscription active (${daysRemaining} days remaining)`;
        }
        return 'Pro subscription active';
        
      case 'cancelled_but_active':
        const expiryDate = state.details.expiresAt;
        if (expiryDate) {
          return `Subscription cancelled, expires ${expiryDate.toLocaleDateString()}`;
        }
        return 'Subscription cancelled but still active';
        
      case 'cancelled_and_expired':
        return 'Subscription cancelled and expired - you can resubscribe anytime';
        
      case 'expired':
        return 'Subscription expired - upgrade to Pro to continue';
        
      case 'no_subscription':
        return 'Free plan - upgrade to Pro for unlimited features';
        
      default:
        return 'Free plan';
    }
  }
} 