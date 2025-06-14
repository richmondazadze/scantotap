// Paystack Webhook Handler - ES Module version
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

    // Parse the webhook event
    const event = req.body;

    // Log the event for debugging
    console.log('Received Paystack webhook:', JSON.stringify(event, null, 2));

    // Handle charge.success event
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      
      if (!reference) {
        console.error('No reference found in webhook data');
        return res.status(400).json({ success: false, error: 'Invalid webhook data' });
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('reference', reference);

      if (error) {
        console.error(`Failed to update order status for reference ${reference}:`, error);
        return res.status(500).json({ 
          success: false, 
          error: 'Database update failed' 
        });
      } else {
        console.log(`Order with reference ${reference} marked as confirmed.`);
      }
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