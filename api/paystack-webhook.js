// Unified Paystack Webhook Handler - Handles both Orders & Subscriptions
// Supports: E-commerce orders + SaaS subscription management
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Paystack-Signature');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase client with environment variables
    const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL || 
                       process.env.SUPABASE_URL || 
                       process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY || 
                           process.env.SUPABASE_ANON_KEY || 
                           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables:', {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey,
        env: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
      });
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error - missing Supabase credentials' 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get webhook signature and secret for verification
    const signature = req.headers['x-paystack-signature'];
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;

    // Verify webhook signature (recommended for production)
    if (webhookSecret && signature) {
      const payload = JSON.stringify(req.body);
      const hash = crypto.createHmac('sha512', webhookSecret).update(payload).digest('hex');
      
      if (hash !== signature) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ success: false, error: 'Invalid signature' });
      }
    }

    // Parse the webhook event
    const event = req.body;
    console.log('Received Paystack webhook:', event.event, 'Reference:', event.data?.reference);

    // Route to appropriate handler based on event type
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event, supabase);
        break;
      
      case 'subscription.create':
        await handleSubscriptionCreate(event, supabase);
        break;
      
      case 'subscription.disable':
        await handleSubscriptionDisable(event, supabase);
        break;
      
      case 'subscription.not_renew':
        await handleSubscriptionNotRenew(event, supabase);
        break;
      
      case 'invoice.create':
        await handleInvoiceCreate(event, supabase);
        break;
      
      case 'invoice.update':
        await handleInvoiceUpdate(event, supabase);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event, supabase);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    // Respond to Paystack
    res.status(200).json({ received: true, processed: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// ============================================================================
// CHARGE SUCCESS HANDLER - Handles both Orders & Subscriptions
// ============================================================================
async function handleChargeSuccess(event, supabase) {
  const { data } = event;
  const reference = data.reference;
  const metadata = data.metadata || {};
  
  console.log('Processing charge.success:', reference, 'Metadata:', metadata);

  // CASE 1: E-commerce Order Payment (existing logic)
  if (metadata.order_id) {
    return await handleOrderPayment(data, supabase);
  }
  
  // CASE 2: Subscription Payment (one-time or recurring)
  if (metadata.user_id && metadata.plan_type) {
    return await handleSubscriptionPayment(data, supabase);
  }

  // CASE 3: Find user by email for subscription (fallback)
  if (data.customer?.email && !metadata.order_id) {
    return await handleSubscriptionPaymentByEmail(data, supabase);
  }

  console.log('Charge success - no matching handler found for:', metadata);
}

// ============================================================================
// ORDER PAYMENT HANDLER (Your existing logic)
// ============================================================================
async function handleOrderPayment(data, supabase) {
  const orderId = data.metadata.order_id;
  const reference = data.reference;
  
  if (!orderId) {
    console.error('No order_id found in payment metadata:', data.metadata);
    throw new Error('Invalid payment metadata - missing order_id');
  }

  console.log(`Processing ORDER payment for order ID: ${orderId}, payment reference: ${reference}`);

  // Update order status to confirmed (your existing logic)
  const { data: updatedOrder, error } = await supabase
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('id', orderId)
    .select('id, order_number, status, customer_first_name, customer_last_name')
    .single();

  if (error) {
    console.error(`Failed to update order status for order ID ${orderId}:`, error);
    throw error;
  } 

  if (!updatedOrder) {
    console.error(`No order found with ID: ${orderId}`);
    throw new Error('Order not found');
  }

  console.log(`Order ${updatedOrder.order_number} (ID: ${updatedOrder.id}) for ${updatedOrder.customer_first_name} ${updatedOrder.customer_last_name} marked as confirmed. Payment reference: ${reference}`);
}

// ============================================================================
// SUBSCRIPTION PAYMENT HANDLERS
// ============================================================================
async function handleSubscriptionPayment(data, supabase) {
  const userId = data.metadata.user_id;
  const planType = data.metadata.plan_type;
  const billingCycle = data.metadata.billing_cycle || 'monthly';
  
  console.log(`Processing SUBSCRIPTION payment for user: ${userId}, plan: ${planType}, billing: ${billingCycle}`);

  // Calculate subscription dates
  const startDate = new Date();
  const endDate = new Date();
  
  if (billingCycle === 'annually') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  // Update user subscription
  const { error } = await supabase
    .from('profiles')
    .update({
      plan_type: 'pro',
      subscription_status: 'active',
      subscription_started_at: startDate.toISOString(),
      subscription_expires_at: endDate.toISOString(),
      paystack_customer_code: data.customer?.customer_code,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error(`Failed to update subscription for user ${userId}:`, error);
    throw error;
  }

  console.log(`Activated Pro subscription for user ${userId} until ${endDate.toISOString()}`);
}

async function handleSubscriptionPaymentByEmail(data, supabase) {
  const customerEmail = data.customer.email;
  
  console.log(`Processing SUBSCRIPTION payment by email: ${customerEmail}`);
  
  // Find user by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', customerEmail)
    .single();

  if (!profile) {
    console.log('No user found for subscription payment email:', customerEmail);
    return;
  }

  // Treat as subscription payment
  await handleSubscriptionPayment({
    ...data,
    metadata: {
      ...data.metadata,
      user_id: profile.id,
      plan_type: 'pro',
      billing_cycle: 'monthly' // Default to monthly
    }
  }, supabase);
}

// ============================================================================
// SUBSCRIPTION EVENT HANDLERS
// ============================================================================
async function handleSubscriptionCreate(event, supabase) {
  const { data } = event;
  const subscription = data.subscription;
  const customerEmail = data.customer?.email || subscription?.customer?.email;
  
  if (!customerEmail || !subscription) {
    console.error('Missing subscription data in webhook');
    return;
  }

  console.log('Creating subscription for:', customerEmail);

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

  // Update user subscription
  const { error } = await supabase
    .from('profiles')
    .update({
      plan_type: 'pro',
      subscription_status: 'active',
      subscription_started_at: startDate.toISOString(),
      subscription_expires_at: nextPaymentDate.toISOString(),
      paystack_customer_code: data.customer?.customer_code,
      paystack_subscription_code: subscription.subscription_code,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  console.log(`Created subscription for user ${profile.id} with code ${subscription.subscription_code}`);
}

async function handleSubscriptionDisable(event, supabase) {
  const { data } = event;
  const customerEmail = data.customer?.email;
  
  if (!customerEmail) {
    console.error('No customer email in disable webhook');
    return;
  }

  console.log('Disabling subscription for:', customerEmail);

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
    // Mark as cancelled but keep pro features until expiry
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);
    
    console.log(`Marked subscription as cancelled for user ${profile.id}, will expire on ${expiryDate.toISOString()}`);
  } else {
    // Subscription has already expired, downgrade immediately
    await supabase
      .from('profiles')
      .update({
        plan_type: 'free',
        subscription_status: 'cancelled',
        subscription_started_at: null,
        subscription_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);
    
    console.log(`Downgraded user ${profile.id} to free plan`);
  }
}

async function handleSubscriptionNotRenew(event, supabase) {
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
  await supabase
    .from('profiles')
    .update({
      plan_type: 'free',
      subscription_status: 'expired',
      subscription_started_at: null,
      subscription_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  console.log(`Expired subscription for user ${profile.id} - will not renew`);
}

async function handleInvoiceCreate(event, supabase) {
  const { data } = event;
  console.log('Invoice created for customer:', data.customer?.email);
  
  // You can send email notifications here about upcoming payment
  // This is fired when a subscription invoice is created
}

async function handleInvoiceUpdate(event, supabase) {
  const { data } = event;
  console.log('Invoice updated:', data.reference);
  
  // Handle invoice status changes
  if (data.status === 'success') {
    // Invoice was paid successfully - extend subscription
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

    await supabase
      .from('profiles')
      .update({
        plan_type: 'pro',
        subscription_status: 'active',
        subscription_started_at: profile.subscription_expires_at || new Date().toISOString(),
        subscription_expires_at: newExpiry.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    console.log(`Extended subscription for user ${profile.id} until ${newExpiry.toISOString()}`);
  }
}

async function handleInvoicePaymentFailed(event, supabase) {
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

// Force deployment - Unified webhook handler
