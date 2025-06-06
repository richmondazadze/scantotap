export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const PAYSTACK_SECRET_KEY = process.env.VITE_PAYSTACK_SECRET_KEY;
  const { reference } = req.body;

  if (!reference) {
    return res.status(400).json({
      success: false,
      error: 'Payment reference is required'
    });
  }

  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Paystack secret key not configured'
    });
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.status && data.data.status === 'success') {
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
        error: data.message || 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
} 