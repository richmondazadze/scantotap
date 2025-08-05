// Example webhook endpoint for handling Paystack webhooks
// This would typically be in your backend (Next.js API route, Express.js, etc.)

import { WebhookHandler } from '../../services/webhookHandler';

// Environment variables you need to set
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || '';

/**
 * Paystack Webhook Handler
 * 
 * This endpoint should be configured in your Paystack dashboard:
 * 1. Go to Settings > Webhooks in your Paystack dashboard
 * 2. Add this endpoint URL: https://yourdomain.com/api/webhooks/paystack
 * 3. Select the events you want to receive:
 *    - charge.success
 *    - subscription.create
 *    - subscription.disable
 *    - subscription.not_renew
 *    - invoice.create
 *    - invoice.update
 *    - invoice.payment_failed
 * 4. Copy the webhook secret and add it to your environment variables
 */

// Example for Next.js API route
export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the raw body and signature
    const payload = JSON.stringify(req.body);
    const signature = req.headers['x-paystack-signature'];

    if (!signature) {
      console.error('Missing Paystack signature');
      return res.status(400).json({ error: 'Missing signature' });
    }

    if (!PAYSTACK_WEBHOOK_SECRET) {
      console.error('Missing webhook secret');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Process the webhook using our handler
    const success = await WebhookHandler.processWebhook(
      payload,
      signature,
      PAYSTACK_WEBHOOK_SECRET
    );

    if (success) {
  
      return res.status(200).json({ message: 'Webhook processed' });
    } else {
      console.error('Failed to process webhook');
      return res.status(400).json({ error: 'Invalid webhook' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Example for Express.js
export function expressWebhookHandler(req: any, res: any) {
  // Ensure you have raw body parsing middleware
  // app.use('/api/webhooks/paystack', express.raw({ type: 'application/json' }));
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body.toString();
  const signature = req.headers['x-paystack-signature'];

  if (!signature) {
    return res.status(400).json({ error: 'Missing signature' });
  }

  WebhookHandler.processWebhook(payload, signature, PAYSTACK_WEBHOOK_SECRET)
    .then(success => {
      if (success) {
        res.status(200).json({ message: 'Webhook processed' });
      } else {
        res.status(400).json({ error: 'Invalid webhook' });
      }
    })
    .catch(error => {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
}

// Example webhook events you'll receive from Paystack:

/*
1. charge.success - When a payment is successful
{
  "event": "charge.success",
  "data": {
    "id": 302961,
    "domain": "live",
    "status": "success",
    "reference": "qTPrJoy9Bx",
    "amount": 10000,
    "message": null,
    "gateway_response": "Approved by Financial Institution",
    "paid_at": "2016-09-30T21:10:19.000Z",
    "created_at": "2016-09-30T21:09:56.000Z",
    "channel": "card",
    "currency": "NGN",
    "ip_address": "41.242.49.37",
    "metadata": {
      "user_id": "user_123",
      "plan_type": "pro",
      "billing_cycle": "monthly"
    },
    "customer": {
      "id": 84312,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "customer_code": "CUS_xnxdt6s1zg5f4nx",
      "phone": "+233203285781",
      "metadata": {}
    }
  }
}

2. subscription.create - When a subscription is created
{
  "event": "subscription.create",
  "data": {
    "customer": {
      "email": "john@example.com",
      "customer_code": "CUS_xnxdt6s1zg5f4nx"
    },
    "plan": {
      "plan_code": "PLN_pro_monthly"
    },
    "subscription": {
      "subscription_code": "SUB_vsyqdmlzble3uii",
      "next_payment_date": "2023-11-30T00:00:00.000Z",
      "status": "active"
    }
  }
}

3. subscription.disable - When a subscription is cancelled
{
  "event": "subscription.disable",
  "data": {
    "customer": {
      "email": "john@example.com"
    },
    "subscription": {
      "subscription_code": "SUB_vsyqdmlzble3uii",
      "status": "cancelled"
    }
  }
}

4. invoice.payment_failed - When a recurring payment fails
{
  "event": "invoice.payment_failed",
  "data": {
    "customer": {
      "email": "john@example.com"
    },
    "amount": 4000,
    "currency": "USD"
  }
}
*/ 