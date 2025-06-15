import { SubscriptionService } from './subscriptionService';

/**
 * Background service for subscription maintenance tasks
 * This service handles periodic cleanup and synchronization of subscription data
 */
export class SubscriptionMaintenanceService {
  
  /**
   * Run all maintenance tasks
   */
  static async runMaintenanceTasks(): Promise<{
    expiredSubscriptions: { expired: number; errors: number };
    syncResults: { processed: number; updated: number; errors: number };
    timestamp: string;
  }> {
    console.log('Starting subscription maintenance tasks...');
    
    const timestamp = new Date().toISOString();
    
    try {
      // Task 1: Expire overdue subscriptions
      const expiredSubscriptions = await SubscriptionService.expireOverdueSubscriptions();
      
      // Task 2: Sync all user plan types
      const syncResults = await SubscriptionService.batchSyncAllUsers();
      
      console.log('Subscription maintenance completed:', {
        expiredSubscriptions,
        syncResults,
        timestamp
      });
      
      return {
        expiredSubscriptions,
        syncResults,
        timestamp
      };
    } catch (error) {
      console.error('Error during subscription maintenance:', error);
      throw error;
    }
  }

  /**
   * Validate a specific user's subscription data
   */
  static async validateUserSubscription(userId: string): Promise<{
    isValid: boolean;
    issues: string[];
    fixed: boolean;
  }> {
    return await SubscriptionService.validateAndFixSubscriptionData(userId);
  }

  /**
   * Force sync a user's plan type (useful for manual intervention)
   */
  static async forceSyncUser(userId: string): Promise<{ updated: boolean; newPlan: string }> {
    return await SubscriptionService.syncUserPlanType(userId);
  }

  /**
   * Get subscription statistics for monitoring
   */
  static async getSubscriptionStats(): Promise<{
    totalUsers: number;
    freeUsers: number;
    proUsers: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    expiredSubscriptions: number;
    inconsistentData: number;
  }> {
    try {
      // This would require database queries to get actual stats
      // For now, returning a placeholder structure
      return {
        totalUsers: 0,
        freeUsers: 0,
        proUsers: 0,
        activeSubscriptions: 0,
        cancelledSubscriptions: 0,
        expiredSubscriptions: 0,
        inconsistentData: 0
      };
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      throw error;
    }
  }

  /**
   * Schedule maintenance tasks (would be called by a cron job or similar)
   */
  static async scheduleMaintenanceTasks(): Promise<void> {
    // This would typically be called by a cron job every hour or daily
    try {
      await this.runMaintenanceTasks();
    } catch (error) {
      console.error('Scheduled maintenance failed:', error);
      // In production, you might want to send alerts here
    }
  }
} 