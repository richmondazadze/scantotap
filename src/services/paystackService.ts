import { supabase } from '@/lib/supabaseClient';
import { PlanType, SubscriptionStatus } from '@/contexts/ProfileContext';

// Paystack configuration
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY;

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
      plan_code: 'PLN_wqbbt20tf5ru5li', // You'll get this from Paystack dashboard
      amount: 40, // $4 in kobo (400 kobo = $4 for USD, adjust for your currency)
      interval: 'monthly' as const,
      currency: 'USD'
    },
    pro_annually: {
      name: 'Pro Annual',
      plan_code: 'PLN_bi0vr5cavabiwyz', // You'll get this from Paystack dashboard
      amount: 400, // $40 in kobo (4000 kobo = $40 for USD)
      interval: 'annually' as const,
      currency: 'USD'
    }
  };

  // Initialize Paystack payment
  static initializePayment(
    email: string,
    amount: number,
    planCode: string,
    metadata: any = {}
  ): Promise<{ authorization_url: string; access_code: string; reference: string }> {
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
      currency: 'USD', // or your preferred currency
      metadata: {
        ...metadata,
        cancel_action: window.location.href
      },
      callback: function(response: any) {
        resolve({
          authorization_url: '',
          access_code: response.trxref,
          reference: response.reference
        });
      },
      onClose: function() {
        reject(new Error('Payment cancelled by user'));
      }
    });
    
    handler.openIframe();
  }

  // Create customer on Paystack
  static async createCustomer(customer: PaystackCustomer): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/customer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Create subscription
  static async createSubscription(
    customerCode: string,
    planCode: string,
    authorization: string
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: customerCode,
          plan: planCode,
          authorization: authorization,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionCode: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: subscriptionCode,
          token: subscriptionCode, // Paystack requires this
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Get subscription details
  static async getSubscription(subscriptionCode: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription/${subscriptionCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  // Update user's subscription in database
  static async updateUserSubscription(userId: string, subscriptionData: SubscriptionData) {
    const updateData: any = {
      plan_type: subscriptionData.plan_type,
      subscription_status: subscriptionData.subscription_status,
      subscription_started_at: subscriptionData.subscription_started_at,
      subscription_expires_at: subscriptionData.subscription_expires_at,
      updated_at: new Date().toISOString(),
    };

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
      
      // Initialize payment
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

      return paymentResult;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  }

  // Verify payment and activate subscription
  static async verifyPaymentAndActivate(reference: string, userId: string) {
    try {
      // Verify payment with Paystack
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const transaction = data.data;
      
      if (transaction.status === 'success') {
        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        
        // Determine subscription period based on plan
        const isAnnual = transaction.metadata?.billing_cycle === 'annually';
        if (isAnnual) {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        // Update user subscription in database
        await this.updateUserSubscription(userId, {
          plan_type: 'pro',
          subscription_status: 'active',
          subscription_started_at: startDate.toISOString(),
          subscription_expires_at: endDate.toISOString(),
          paystack_customer_code: transaction.customer?.customer_code,
          paystack_subscription_code: transaction.subscription?.subscription_code,
        });

        return {
          success: true,
          subscription: {
            plan_type: 'pro',
            status: 'active',
            started_at: startDate.toISOString(),
            expires_at: endDate.toISOString(),
          }
        };
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
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