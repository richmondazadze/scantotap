import { supabase } from './supabase-client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // TODO: For production, verify the request is from Paystack (e.g., check IP or signature)

  const event = req.body;

  // Log the event for debugging
  console.log('Received Paystack webhook:', JSON.stringify(event, null, 2));

  // Handle charge.success event
  if (event.event === 'charge.success') {
    const reference = event.data.reference;
    const { error } = await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('reference', reference);

    if (error) {
      console.error(`Failed to update order status for reference ${reference}:`, error);
    } else {
      console.log(`Order with reference ${reference} marked as confirmed.`);
    }
  }

  // You can handle other event types as needed

  // Respond to Paystack
  res.status(200).json({ received: true });
} 