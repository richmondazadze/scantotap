// Paystack Webhook Handler - ES Module version
// Last updated: 2025-06-14 - Fixed payment_reference column issue
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
      const metadata = event.data.metadata;
      
      if (!reference) {
        console.error('No reference found in webhook data');
        return res.status(400).json({ success: false, error: 'Invalid webhook data' });
      }

      // Extract order ID from metadata (this is the correct way to link payment to order)
      const orderId = metadata?.order_id;
      
      if (!orderId) {
        console.error('No order_id found in payment metadata:', metadata);
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid payment metadata - missing order_id' 
        });
      }

      console.log(`Processing payment confirmation for order ID: ${orderId}, payment reference: ${reference}`);

      // Update order status to confirmed (without payment_reference for now)
      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId)
        .select('id, order_number, status, customer_first_name, customer_last_name')
        .single();

      if (error) {
        console.error(`Failed to update order status for order ID ${orderId}:`, error);
        return res.status(500).json({ 
          success: false, 
          error: 'Database update failed',
          details: error.message,
          orderId,
          reference
        });
      } 

      if (!updatedOrder) {
        console.error(`No order found with ID: ${orderId}`);
        return res.status(404).json({ 
          success: false, 
          error: 'Order not found',
          orderId,
          reference
        });
      }

      console.log(`Order ${updatedOrder.order_number} (ID: ${updatedOrder.id}) for ${updatedOrder.customer_first_name} ${updatedOrder.customer_last_name} marked as confirmed. Payment reference: ${reference}`);
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
} // Force deployment Fri Jun 13 23:42:47 CDT 2025
