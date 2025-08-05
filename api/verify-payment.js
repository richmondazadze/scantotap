// Payment Verification Handler - ES Module version
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
    const PAYSTACK_SECRET_KEY = process.env.VITE_PAYSTACK_SECRET_KEY || 
                               process.env.PAYSTACK_SECRET_KEY;
    const { reference } = req.body;



    if (!reference) {
      console.error('No reference provided in request body');
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required'
      });
    }

    if (!PAYSTACK_SECRET_KEY) {
      console.error('Missing Paystack secret key - available env vars:', 
        Object.keys(process.env).filter(key => key.includes('PAYSTACK')));
      return res.status(500).json({
        success: false,
        error: 'Paystack secret key not configured'
      });
    }



    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();



    if (response.ok && data.status && data.data && data.data.status === 'success') {

      res.json({
        success: true,
        data: {
          reference: data.data.reference,
          amount: data.data.amount,
          currency: data.data.currency,
          status: data.data.status,
          paid_at: data.data.paid_at,
          customer: data.data.customer,
          metadata: data.data.metadata
        }
      });
    } else {

      res.status(400).json({
        success: false,
        error: data.message || 'Payment verification failed',
        details: data
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
} 