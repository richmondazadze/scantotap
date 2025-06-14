// Debug Environment Variables - ES Module version
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const envCheck = {
      supabase: {
        url: !!process.env.VITE_PUBLIC_SUPABASE_URL,
        key: !!process.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
        urlAlt: !!process.env.SUPABASE_URL,
        keyAlt: !!process.env.SUPABASE_ANON_KEY
      },
      paystack: {
        secretKey: !!process.env.VITE_PAYSTACK_SECRET_KEY,
        secretKeyAlt: !!process.env.PAYSTACK_SECRET_KEY
      },
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      availableEnvVars: Object.keys(process.env).filter(key => 
        key.includes('SUPABASE') || key.includes('PAYSTACK')
      )
    };

    res.json({
      success: true,
      environment: envCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
} 