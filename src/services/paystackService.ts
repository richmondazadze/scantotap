import { supabase } from '@/lib/supabaseClient';
import { PlanType, SubscriptionStatus } from '@/contexts/ProfileContext';

// Paystack configuration
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

export interface PaystackCustomer {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface SubscriptionPlan {
  name: string;
  plan_code: string;
  amount: number; // in kobo (smallest currency unit)
  interval: 'monthly' | 'annually';
  currency: string;
}

export interface SubscriptionData {
  plan_type: PlanType;
  subscription_status: SubscriptionStatus;
  subscription_started_at?: string;
  subscription_expires_at?: string;
  paystack_customer_code?: string;
  paystack_subscription_code?: string;
}

export class PaystackService {
  private static baseUrl = 'https://api.paystack.co';

  // Subscription plans configuration
  static readonly PLANS = {
    pro_monthly: {
      name: 'Pro Monthly',
      plan_code: 'PLN_i256tzoat6rkqom', // Updated with new Paystack account plan code
      // IMPORTANT: amount must be in the smallest currency unit
      // For USD this is cents; for NGN this is kobo. Adjust per your Paystack currency setup.
      amount: 400, // $4.00 expressed in cents
      interval: 'monthly' as const,
      currency: 'USD'
    },
    pro_annually: {
      name: 'Pro Annual',
      plan_code: 'PLN_fdlwxe47s2x6ho1', // Updated with new Paystack account plan code
      amount: 4000, // $40.00 expressed in cents
      interval: 'annually' as const,
      currency: 'USD'
    }
  };

  // Helper methods for environment detection
  static isTestMode(): boolean {
    return PAYSTACK_PUBLIC_KEY?.startsWith('pk_test_') || false;
  }

  static getEnvironmentInfo() {
    return {
      isTestMode: this.isTestMode(),
      hasPublicKey: !!PAYSTACK_PUBLIC_KEY,
      // Frontend must never reference secret keys. Keep this false to avoid accidental usage checks.
      hasSecretKey: false,
      publicKeyPrefix: PAYSTACK_PUBLIC_KEY?.substring(0, 7) || 'none'
    };
  }

  // Initialize Paystack payment
  static initializePayment(
    email: string,
    amount: number,
    planCode: string,
    metadata: any = {}
  ): Promise<{ authorization_url: string; access_code: string; reference: string; authorization?: string }> {
    return new Promise((resolve, reject) => {
      // Load Paystack inline script if not already loaded
      if (!window.PaystackPop) {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => this.processPayment(email, amount, planCode, metadata, resolve, reject);
        document.head.appendChild(script);
      } else {
        this.processPayment(email, amount, planCode, metadata, resolve, reject);
      }
    });
  }

  private static processPayment(
    email: string,
    amount: number,
    planCode: string,
    metadata: any,
    resolve: Function,
    reject: Function
  ) {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount,
      plan: planCode,
      currency: 'USD',
      channels: ['card'], // Restrict to card payments only for subscriptions
      metadata: {
        ...metadata,
        cancel_action: window.location.href
      },
      callback: function(response: any) {
        // Handle both test and live mode responses
        if (response.authorization && response.authorization.authorization_code) {
          resolve({
            authorization_url: '',
            access_code: response.trxref,
            reference: response.reference,
            authorization: response.authorization.authorization_code
          });
        } else if (response.status === 'success') {
          // For test mode or when authorization is not available
          resolve({
            authorization_url: '',
            access_code: response.trxref,
            reference: response.reference
          });
        } else {
          reject(new Error('Payment failed'));
        }
      },
      onClose: function() {
        reject(new Error('Payment cancelled by user'));
      }
    });
    
    handler.openIframe();
  }

  // Update user's subscription in database
  static async updateUserSubscription(userId: string, subscriptionData: SubscriptionData) {
    const updateData: any = {
      plan_type: subscriptionData.plan_type,
      subscription_status: subscriptionData.subscription_status,
      updated_at: new Date().toISOString(),
    };

    // Only update date fields if they are provided and not undefined
    if (subscriptionData.subscription_started_at !== undefined) {
      updateData.subscription_started_at = subscriptionData.subscription_started_at;
    }
    if (subscriptionData.subscription_expires_at !== undefined) {
      updateData.subscription_expires_at = subscriptionData.subscription_expires_at;
    }

    // Only update Paystack codes if they are provided
    if (subscriptionData.paystack_customer_code !== undefined) {
      updateData.paystack_customer_code = subscriptionData.paystack_customer_code;
    }
    if (subscriptionData.paystack_subscription_code !== undefined) {
      updateData.paystack_subscription_code = subscriptionData.paystack_subscription_code;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Handle subscription upgrade
  static async upgradeSubscription(
    userId: string,
    userEmail: string,
    userName: string,
    planType: 'monthly' | 'annually'
  ) {
    try {
      const plan = planType === 'monthly' ? this.PLANS.pro_monthly : this.PLANS.pro_annually;
      
      // Initialize payment with card-only restriction
      const paymentResult = await this.initializePayment(
        userEmail,
        plan.amount,
        plan.plan_code,
        {
          user_id: userId,
          plan_type: 'pro',
          billing_cycle: planType
        }
      );

      // Rely on webhook to activate subscription post-payment
      return {
        success: true,
        reference: paymentResult.reference,
        message: 'Payment initialized. Your subscription will be activated after confirmation.'
      };
    } catch (error) {
      throw error;
    }
  }

  // Check if subscription is active
  static isSubscriptionActive(subscription_status?: string, subscription_expires_at?: string): boolean {
    if (!subscription_status) return false;
    if (subscription_status === 'cancelled' || subscription_status === 'expired') return false;
    
    if (subscription_expires_at) {
      const expiryDate = new Date(subscription_expires_at);
      const now = new Date();
      return expiryDate > now;
    }
    
    return subscription_status === 'active';
  }

  // Get plan display info
  static getPlanDisplayInfo(planType: PlanType) {
    return {
      free: {
        name: 'Free Plan',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: '🆓'
      },
      pro: {
        name: 'Pro Plan',
        color: 'text-scan-blue',
        bgColor: 'bg-scan-blue/10',
        icon: '👑'
      }
    }[planType];
  }
}

// Extend Window interface for Paystack
declare global {
  interface Window {
    PaystackPop: any;
  }
} 