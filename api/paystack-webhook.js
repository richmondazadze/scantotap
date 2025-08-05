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

    // Use service role key for webhook operations to bypass RLS
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                              process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables:', {
        url: !!supabaseUrl,
        serviceKey: !!supabaseServiceKey,
        env: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
      });
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error - missing Supabase credentials' 
      });
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        // Unhandled webhook event
        break;
    }

    // Respond to Paystack
    res.status(200).json({ received: true, processed: true });

  } catch (error) {
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


}

// ============================================================================
// ORDER PAYMENT HANDLER (Your existing logic)
// ============================================================================
async function handleOrderPayment(data, supabase) {
  const orderId = data.metadata.order_id;
  const reference = data.reference;
  
  if (!orderId) {
    throw new Error('Invalid payment metadata - missing order_id');
  }

  // Update order status to confirmed (your existing logic)
  const { data: updatedOrder, error } = await supabase
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('id', orderId)
    .select('*') // Select all columns for email data
    .single();

  if (error) {
    console.error(`Failed to update order status for order ID ${orderId}:`, error);
    throw error;
  } 

  if (!updatedOrder) {
    throw new Error('Order not found');
  }

  // Send order confirmation email
  try {
    // Prepare email data
    const orderEmailData = {
      orderNumber: updatedOrder.order_number,
      total: updatedOrder.total,
      items: [{
        name: `${updatedOrder.design_name} (${updatedOrder.material_name})`,
        quantity: updatedOrder.quantity,
        price: updatedOrder.design_price + (updatedOrder.material_price_modifier || 0)
      }],
      shippingAddress: `${updatedOrder.shipping_address}, ${updatedOrder.shipping_city}, ${updatedOrder.shipping_state} ${updatedOrder.shipping_zip_code}, ${updatedOrder.shipping_country}`,
             estimatedDelivery: '2-5 business days'
    };

    // Send email via the order email API
    const emailResponse = await fetch(`${process.env.VITE_APP_URL || 'http://localhost:3000'}/api/order-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'order-confirmation',
        userId: updatedOrder.user_id,
        orderData: orderEmailData,
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      // Don't fail the payment processing if email fails
    }
  } catch (emailError) {
    // Don't fail the payment processing if email fails
  }
}

// ============================================================================
// SUBSCRIPTION PAYMENT HANDLERS (SIMPLIFIED)
// ============================================================================
async function handleSubscriptionPayment(data, supabase) {
  const userId = data.metadata.user_id;
  const planType = data.metadata.plan_type;
  const billingCycle = data.metadata.billing_cycle || 'monthly';
  


  try {
    // First check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('id, plan_type, subscription_status, email')
      .eq('id', userId)
      .single();

    if (userError) {
      throw userError;
    }

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Update user subscription (simplified - no date tracking)
    const { data: updateResult, error } = await supabase
      .from('profiles')
      .update({
        plan_type: 'pro',
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, plan_type, subscription_status'); // Return updated data

    if (error) {
      console.error('Failed to update user subscription:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    if (!updateResult || updateResult.length === 0) {
      console.error('No rows were updated. User ID might not exist:', userId);
      throw new Error('Database update failed - no rows affected');
    }


  } catch (error) {
    throw error;
  }
}

async function handleSubscriptionPaymentByEmail(data, supabase) {
  const customerEmail = data.customer.email;
  

  
  // Find user by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, plan_type, onboarding_complete, subscription_status')
    .eq('email', customerEmail)
    .single();

  if (!profile) {
    return;
  }

  // CRITICAL: Only upgrade users who haven't explicitly chosen free plan during onboarding
  // This prevents auto-upgrading users who selected "free" in onboarding
  const shouldUpgrade = !profile.onboarding_complete || 
                       profile.plan_type !== 'free' ||
                       profile.subscription_status === 'active';

  if (!shouldUpgrade) {
    return;
  }

  // Update subscription (simplified)
  const { error } = await supabase
    .from('profiles')
    .update({
      plan_type: 'pro',
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id);

  if (error) {
    throw error;
  }
}

// ============================================================================
// SUBSCRIPTION EVENT HANDLERS
// ============================================================================
async function handleSubscriptionCreate(event, supabase) {
  const { data } = event;
  
  // Find user by customer email
  const customerEmail = data.customer?.email;
  if (!customerEmail) {
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', customerEmail)
    .single();

  if (!profile) {
    return;
  }

  // Update to pro plan with active status (simplified)
  const { error } = await supabase
    .from('profiles')
    .update({
      plan_type: 'pro',
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id);

  if (error) {
    return;
  }
}

async function handleSubscriptionDisable(event, supabase) {
  const { data } = event;
  
  // Find user by customer email
  const customerEmail = data.customer?.email;
  if (!customerEmail) {
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', customerEmail)
    .single();

  if (!profile) {
    return;
  }

  // Update to free plan with cancelled status (simplified)
  const { error } = await supabase
    .from('profiles')
    .update({
      plan_type: 'free',
      subscription_status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id);

  if (error) {
    return;
  }
}

async function handleSubscriptionNotRenew(event, supabase) {
  const { data } = event;
  
  // Find user by customer email
  const customerEmail = data.customer?.email;
  if (!customerEmail) {
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', customerEmail)
    .single();

  if (!profile) {
    return;
  }

  // Update to free plan with expired status (simplified)
  const { error } = await supabase
    .from('profiles')
    .update({
      plan_type: 'free',
      subscription_status: 'expired',
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id);

  if (error) {
    return;
  }
}

async function handleInvoiceCreate(event, supabase) {
  const { data } = event;
  
  // You can send email notifications here about upcoming payment
  // This is fired when a subscription invoice is created
}

async function handleInvoiceUpdate(event, supabase) {
  const { data } = event;
  
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


  }
}

async function handleInvoicePaymentFailed(event, supabase) {
  const { data } = event;
  const customerEmail = data.customer?.email;
  
  if (!customerEmail) return;


  
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
}

// Force deployment - Unified webhook handler
