import { supabase } from '@/lib/supabaseClient';
import { PaystackService } from './paystackService';
import { WebhookVerification } from './webhookVerification';
import { PlanType } from '@/contexts/ProfileContext';
import { SubscriptionService } from './subscriptionService';

export interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
      user_id?: string;
      plan_type?: PlanType;
      billing_cycle?: string;
      [key: string]: any;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: any;
    };
    plan?: {
      id: number;
      name: string;
      plan_code: string;
      description: string;
      amount: number;
      interval: string;
      currency: string;
    };
    subscription?: {
      id: number;
      subscription_code: string;
      email_token: string;
      amount: number;
      cron_expression: string;
      next_payment_date: string;
      open_invoice: string;
      status: string;
      quantity: number;
      plan: any;
      customer: any;
    };
  };
}

export class WebhookHandler {
  // Handle Paystack webhook events
  static async handlePaystackWebhook(event: PaystackWebhookEvent) {
    console.log('Processing Paystack webhook:', event.event, 'for reference:', event.data.reference);

    try {
      switch (event.event) {
        // Subscription events (primary)
        case 'subscription.create':
          await this.handleSubscriptionCreate(event);
          break;
        
        case 'subscription.disable':
          await this.handleSubscriptionDisable(event);
          break;
        
        case 'subscription.not_renew':
          await this.handleSubscriptionNotRenew(event);
          break;

        // Payment events
        case 'charge.success':
          await this.handleChargeSuccess(event);
          break;

        // Invoice events
        case 'invoice.create':
          await this.handleInvoiceCreate(event);
          break;
        
        case 'invoice.update':
          await this.handleInvoiceUpdate(event);
          break;
        
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event);
          break;

        // Customer events
        case 'customeridentification.success':
          await this.handleCustomerIdentificationSuccess(event);
          break;
        
        default:
          console.log('Unhandled webhook event:', event.event);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }

  // Handle successful charge (one-time payment or subscription payment)
  private static async handleChargeSuccess(event: PaystackWebhookEvent) {
    const { data } = event;
    const userId = data.metadata?.user_id;
    
    if (!userId) {
      console.log('No user_id in metadata, skipping charge.success');
      return;
    }

    // If this is a subscription payment, activate the subscription
    if (data.metadata?.plan_type === 'pro') {
      const startDate = new Date();
      const endDate = new Date();
      
      // Determine subscription period
      const isAnnual = data.metadata?.billing_cycle === 'annually';
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
        paystack_customer_code: data.customer?.customer_code,
        paystack_subscription_code: data.subscription?.subscription_code,
      });

      // Sync plan type to ensure consistency
      await SubscriptionService.syncUserPlanType(userId);

      console.log(`Activated Pro subscription for user ${userId}`);
    }
  }

  // Handle subscription creation
  private static async handleSubscriptionCreate(event: PaystackWebhookEvent) {
    const { data } = event;
    const subscription = data.subscription;
    
    if (!subscription) {
      console.error('No subscription data in webhook');
      return;
    }

    // Extract customer email
    const customerEmail = data.customer?.email || subscription.customer?.email;
    
    if (!customerEmail) {
      console.error('No customer email found in subscription webhook');
      return;
    }
    
    // Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .single();

    if (!profile) {
      console.error('No user found for email:', customerEmail);
      return;
    }

    // Calculate subscription dates
    const startDate = new Date();
    const nextPaymentDate = new Date(subscription.next_payment_date);

    // Update user subscription with Paystack details
    await PaystackService.updateUserSubscription(profile.id, {
      plan_type: 'pro',
      subscription_status: 'active',
      subscription_started_at: startDate.toISOString(),
      subscription_expires_at: nextPaymentDate.toISOString(),
      paystack_customer_code: data.customer?.customer_code,
      paystack_subscription_code: subscription.subscription_code,
    });

    // Sync plan type to ensure consistency
    await SubscriptionService.syncUserPlanType(profile.id);

    console.log(`Created subscription for user ${profile.id} with code ${subscription.subscription_code}`);
  }

  // Handle subscription disable/cancellation
  private static async handleSubscriptionDisable(event: PaystackWebhookEvent) {
    const { data } = event;
    const subscription = data.subscription;
    
    if (!subscription) {
      console.error('No subscription data in disable webhook');
      return;
    }

    const customerEmail = data.customer?.email || subscription.customer?.email;
    
    if (!customerEmail) {
      console.error('No customer email found in disable webhook');
      return;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, subscription_expires_at')
      .eq('email', customerEmail)
      .single();

    if (!profile) {
      console.error('No user found for email:', customerEmail);
      return;
    }

    // Keep subscription active until expiry date, then downgrade
    const now = new Date();
    const expiryDate = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : now;
    
    if (expiryDate > now) {
      // Subscription is still valid, mark as cancelled but keep pro features until expiry
      await PaystackService.updateUserSubscription(profile.id, {
        plan_type: 'pro', // Keep pro until expiry
        subscription_status: 'cancelled', // But mark as cancelled
        subscription_started_at: profile.subscription_expires_at,
        subscription_expires_at: profile.subscription_expires_at,
        paystack_customer_code: data.customer?.customer_code,
        paystack_subscription_code: data.subscription?.subscription_code,
      });
      
      // Sync plan type to ensure consistency
      await SubscriptionService.syncUserPlanType(profile.id);
      
      console.log(`Marked subscription as cancelled for user ${profile.id}, will expire on ${expiryDate.toISOString()}`);
    } else {
      // Subscription has already expired, downgrade immediately
      await PaystackService.updateUserSubscription(profile.id, {
        plan_type: 'free',
        subscription_status: 'cancelled',
        subscription_started_at: undefined,
        subscription_expires_at: undefined,
        paystack_customer_code: data.customer?.customer_code,
        paystack_subscription_code: data.subscription?.subscription_code,
      });
      
      // Sync plan type to ensure consistency
      await SubscriptionService.syncUserPlanType(profile.id);
      
      console.log(`Downgraded user ${profile.id} to free plan`);
    }
  }

  // Handle subscription not renewing
  private static async handleSubscriptionNotRenew(event: PaystackWebhookEvent) {
    const { data } = event;
    const customerEmail = data.customer?.email;
    
    if (!customerEmail) {
      console.error('No customer email found in not_renew webhook');
      return;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .single();

    if (!profile) {
      console.error('No user found for email:', customerEmail);
      return;
    }

    // Subscription will not renew, downgrade to free plan
    await PaystackService.updateUserSubscription(profile.id, {
      plan_type: 'free',
      subscription_status: 'expired',
      subscription_started_at: undefined,
      subscription_expires_at: undefined,
      paystack_customer_code: data.customer?.customer_code,
      paystack_subscription_code: data.subscription?.subscription_code,
    });

    // Sync plan type to ensure consistency
    await SubscriptionService.syncUserPlanType(profile.id);

    console.log(`Expired subscription for user ${profile.id} - will not renew`);
  }

  // Handle invoice creation (upcoming payment)
  private static async handleInvoiceCreate(event: PaystackWebhookEvent) {
    const { data } = event;
    console.log('Invoice created for customer:', data.customer?.email);
    
    // You can send email notifications here about upcoming payment
    // This is fired when a subscription invoice is created
  }

  // Handle invoice updates
  private static async handleInvoiceUpdate(event: PaystackWebhookEvent) {
    const { data } = event;
    console.log('Invoice updated:', data.reference);
    
    // Handle invoice status changes
    if (data.status === 'success') {
      // Invoice was paid successfully
      await this.handleSuccessfulInvoicePayment(event);
    }
  }

  // Handle successful invoice payment (recurring subscription payment)
  private static async handleSuccessfulInvoicePayment(event: PaystackWebhookEvent) {
    const { data } = event;
    const customerEmail = data.customer?.email;
    
    if (!customerEmail) return;

    // Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, subscription_expires_at')
      .eq('email', customerEmail)
      .single();

    if (!profile) return;

    // Extend subscription by one billing cycle
    const currentExpiry = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : new Date();
    const newExpiry = new Date(currentExpiry);
    
    // Determine if it's monthly or annual based on plan
    const isAnnual = data.metadata?.billing_cycle === 'annually';
    if (isAnnual) {
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    } else {
      newExpiry.setMonth(newExpiry.getMonth() + 1);
    }

    await PaystackService.updateUserSubscription(profile.id, {
      plan_type: 'pro',
      subscription_status: 'active',
      subscription_started_at: profile.subscription_expires_at || new Date().toISOString(),
      subscription_expires_at: newExpiry.toISOString(),
      paystack_customer_code: data.customer?.customer_code,
      paystack_subscription_code: data.subscription?.subscription_code,
    });

    // Sync plan type to ensure consistency
    await SubscriptionService.syncUserPlanType(profile.id);

    console.log(`Extended subscription for user ${profile.id} until ${newExpiry.toISOString()}`);
  }

  // Handle failed payment
  private static async handleInvoicePaymentFailed(event: PaystackWebhookEvent) {
    const { data } = event;
    const customerEmail = data.customer?.email;
    
    if (!customerEmail) return;

    console.log('Payment failed for:', customerEmail);
    
    // Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .single();

    if (!profile) return;

    // Implement grace period logic
    // For now, we'll mark as payment failed but keep subscription active
    // You might want to implement a 3-day grace period before downgrading
    
    // Optional: Send notification email to user about failed payment
    console.log(`Payment failed for user ${profile.id}, implementing grace period`);
  }

  // Handle customer identification success
  private static async handleCustomerIdentificationSuccess(event: PaystackWebhookEvent) {
    const { data } = event;
    console.log('Customer identification successful:', data.customer?.email);
    
    // This event is fired when a customer completes KYC
    // You can update customer verification status here
  }

  /**
   * Verify webhook signature and process event
   * @param payload - Raw webhook payload
   * @param signature - X-Paystack-Signature header
   * @param secret - Webhook secret from environment
   * @returns Promise<boolean> indicating success
   */
  static async processWebhook(payload: string, signature: string, secret: string): Promise<boolean> {
    try {
      // Verify signature first
      if (!WebhookVerification.verifyPaystackSignature(payload, signature, secret)) {
        console.error('Invalid webhook signature');
        return false;
      }

      // Parse and validate payload
      const event = WebhookVerification.parseWebhookPayload(payload);
      if (!event) {
        console.error('Invalid webhook payload');
        return false;
      }

      // Validate event structure
      if (!WebhookVerification.validateEventStructure(event)) {
        console.error('Invalid webhook event structure');
        return false;
      }

      // Process the webhook event
      await this.handlePaystackWebhook(event);
      return true;
    } catch (error) {
      console.error('Error processing webhook:', error);
      return false;
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use processWebhook instead
   */
  static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    return WebhookVerification.verifyPaystackSignature(payload, signature, secret);
  }
} 