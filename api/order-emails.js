import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);
const supabase = createClient(
  process.env.VITE_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, userId, orderData } = req.body;

    if (!type || !userId || !orderData) {
      return res.status(400).json({ error: 'Missing required fields: type, userId, orderData' });
    }

    // Check if user has email order updates enabled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email_order_updates, email, name')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(400).json({ error: 'User profile not found' });
    }

    if (!profile.email_order_updates) {
      console.log(`Order email skipped - user ${userId} has disabled order notifications`);
      return res.status(200).json({ 
        success: true, 
        skipped: true, 
        message: 'Email skipped - user has disabled order notifications' 
      });
    }

    if (!profile.email) {
      return res.status(400).json({ error: 'User email not found' });
    }

    let subject, html;

    switch (type) {
      case 'order-confirmation':
        subject = `Order Confirmation - ${orderData.orderNumber}`;
        html = generateOrderConfirmationEmail(orderData, profile.name);
        break;
      case 'order-processing':
        subject = `Order Processing - ${orderData.orderNumber}`;
        html = generateOrderProcessingEmail(orderData, profile.name);
        break;
      case 'order-shipped':
        subject = `Order Shipped - ${orderData.orderNumber}`;
        html = generateOrderShippedEmail(orderData, profile.name);
        break;
      case 'order-delivered':
        subject = `Order Delivered - ${orderData.orderNumber}`;
        html = generateOrderDeliveredEmail(orderData, profile.name);
        break;
      case 'order-cancelled':
        subject = `Order Cancelled - ${orderData.orderNumber}`;
        html = generateOrderCancelledEmail(orderData, profile.name);
        break;
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    const result = await resend.emails.send({
      from: 'SCAN2TAP Orders <orders@richverseecotech.com>',
      to: [profile.email],
      subject: subject,
      html: html,
    });

    return res.status(200).json({ success: true, id: result.id });
  } catch (error) {
    console.error('Order email sending error:', error);
    return res.status(500).json({ error: 'Failed to send order email' });
  }
}

function generateOrderConfirmationEmail(orderData, userName) {
  const { orderNumber, total, items, shippingAddress, estimatedDelivery } = orderData;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${orderNumber}</title>
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      padding: 30px 20px;
      text-align: center;
      color: white;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    
    .logo .number-2 {
      color: #60a5fa;
      text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
    }
    
    .header-subtitle {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .content {
      padding: 30px 25px;
      background-color: #ffffff;
    }
    
    .status-badge {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin: 10px 0 20px 0;
    }
    
    .order-summary {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .order-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .order-row:last-child {
      border-bottom: none;
      font-weight: bold;
      padding-top: 15px;
      margin-top: 10px;
      border-top: 2px solid #e2e8f0;
    }
    
    .shipping-info {
      background-color: #f1f5f9;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 20px 0;
    }
    
    .next-steps {
      background-color: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    
    .next-steps h3 {
      color: #92400e;
      margin-bottom: 10px;
    }
    
    .footer {
      background-color: #f9fafb;
      padding: 25px 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    
    /* Mobile Responsive */
    @media only screen and (max-width: 600px) {
      body { padding: 10px; }
      .content { padding: 20px 15px; }
      .header { padding: 25px 15px; }
      .order-summary { padding: 15px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="logo">
        SCAN<span class="number-2">2</span>TAP
      </div>
      <div class="header-subtitle">Order Confirmation</div>
    </div>
    
    <!-- Content -->
    <div class="content">
      <h2>Thank you for your order, ${userName}! 🎉</h2>
      <div class="status-badge">Order Confirmed</div>
      
      <p>We've received your order and it's being processed. You'll receive another email when your items are shipped.</p>
      
      <!-- Order Summary -->
      <div class="order-summary">
        <h3 style="margin-bottom: 15px; color: #1f2937;">Order Details</h3>
        <div class="order-row">
          <span><strong>Order Number:</strong></span>
          <span>${orderNumber}</span>
        </div>
        ${items.map(item => `
          <div class="order-row">
            <span>${item.name} × ${item.quantity}</span>
            <span>₵${item.price.toFixed(2)}</span>
          </div>
        `).join('')}
        <div class="order-row">
          <span><strong>Total:</strong></span>
          <span><strong>₵${total.toFixed(2)}</strong></span>
        </div>
      </div>
      
      <!-- Shipping Info -->
      <div class="shipping-info">
        <h4 style="margin-bottom: 10px; color: #1f2937;">Shipping Address</h4>
        <p>${shippingAddress}</p>
        ${estimatedDelivery ? `<p style="margin-top: 10px;"><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>` : ''}
      </div>
      
      <!-- Next Steps -->
      <div class="next-steps">
        <h3>What's Next?</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>We'll process your order within 1-2 business days</li>
          <li>You'll receive a shipping confirmation with tracking details</li>
          <li>Track your order status in your dashboard</li>
        </ul>
      </div>
      
      <p style="margin-top: 25px; color: #6b7280;">
        If you have any questions about your order, please don't hesitate to contact our support team.
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        <strong>SCAN2TAP</strong><br>
        Your Digital Identity, One Tap Away
      </div>
      <div class="footer-text">
        © 2025 SCAN2TAP. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateOrderProcessingEmail(orderData, userName) {
  const { orderNumber } = orderData;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Processing - ${orderNumber}</title>
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      padding: 30px 20px;
      text-align: center;
      color: white;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    
    .logo .number-2 {
      color: #60a5fa;
      text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
    }
    
    .content {
      padding: 30px 25px;
      background-color: #ffffff;
      text-align: center;
    }
    
    .status-badge {
      display: inline-block;
      background-color: #f59e0b;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin: 10px 0 20px 0;
    }
    
    .footer {
      background-color: #f9fafb;
      padding: 25px 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">SCAN<span class="number-2">2</span>TAP</div>
    </div>
    
    <div class="content">
      <h2>Your order is being processed! ⏳</h2>
      <div class="status-badge">Processing</div>
      
      <p>Hi ${userName},</p>
      <p>Great news! Your order <strong>${orderNumber}</strong> is now being processed by our team.</p>
      <p>We'll send you another update once your items are shipped with tracking information.</p>
    </div>
    
    <div class="footer">
      <div class="footer-text">
        <strong>SCAN2TAP</strong><br>
        Your Digital Identity, One Tap Away
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateOrderShippedEmail(orderData, userName) {
  const { orderNumber, trackingNumber, carrier } = orderData;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped - ${orderNumber}</title>
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      padding: 30px 20px;
      text-align: center;
      color: white;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    
    .logo .number-2 {
      color: #60a5fa;
      text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
    }
    
    .content {
      padding: 30px 25px;
      background-color: #ffffff;
      text-align: center;
    }
    
    .status-badge {
      display: inline-block;
      background-color: #3b82f6;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin: 10px 0 20px 0;
    }
    
    .tracking-info {
      background-color: #dbeafe;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    
    .tracking-number {
      font-size: 18px;
      font-weight: bold;
      color: #1e40af;
      margin: 10px 0;
    }
    
    .footer {
      background-color: #f9fafb;
      padding: 25px 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">SCAN<span class="number-2">2</span>TAP</div>
    </div>
    
    <div class="content">
      <h2>Your order is on its way! 🚚</h2>
      <div class="status-badge">Shipped</div>
      
      <p>Hi ${userName},</p>
      <p>Exciting news! Your order <strong>${orderNumber}</strong> has been shipped and is on its way to you.</p>
      
      ${trackingNumber ? `
      <div class="tracking-info">
        <h3 style="color: #1e40af; margin-bottom: 10px;">Tracking Information</h3>
        <p><strong>Carrier:</strong> ${carrier || 'Standard Shipping'}</p>
        <div class="tracking-number">${trackingNumber}</div>
        <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
          Use this tracking number to monitor your shipment's progress
        </p>
      </div>
      ` : ''}
      
      <p>Your package should arrive within the estimated delivery timeframe. You'll receive another email confirmation once it's delivered.</p>
    </div>
    
    <div class="footer">
      <div class="footer-text">
        <strong>SCAN2TAP</strong><br>
        Your Digital Identity, One Tap Away
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateOrderDeliveredEmail(orderData, userName) {
  const { orderNumber } = orderData;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Delivered - ${orderNumber}</title>
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      padding: 30px 20px;
      text-align: center;
      color: white;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    
    .logo .number-2 {
      color: #60a5fa;
      text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
    }
    
    .content {
      padding: 30px 25px;
      background-color: #ffffff;
      text-align: center;
    }
    
    .status-badge {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin: 10px 0 20px 0;
    }
    
    .celebration {
      background-color: #ecfdf5;
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    
    .footer {
      background-color: #f9fafb;
      padding: 25px 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">SCAN<span class="number-2">2</span>TAP</div>
    </div>
    
    <div class="content">
      <h2>Your order has been delivered! 🎉</h2>
      <div class="status-badge">Delivered</div>
      
      <p>Hi ${userName},</p>
      <p>Great news! Your order <strong>${orderNumber}</strong> has been successfully delivered.</p>
      
      <div class="celebration">
        <h3 style="color: #059669; margin-bottom: 15px;">Welcome to the SCAN2TAP Community! 🌟</h3>
        <p>We hope you love your new digital business cards. Start sharing your professional profile and make meaningful connections!</p>
      </div>
      
      <p>If you have any issues with your order or need support getting started, our team is here to help.</p>
      <p>Thank you for choosing SCAN2TAP!</p>
    </div>
    
    <div class="footer">
      <div class="footer-text">
        <strong>SCAN2TAP</strong><br>
        Your Digital Identity, One Tap Away
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateOrderCancelledEmail(orderData, userName) {
  const { orderNumber, reason } = orderData;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Cancelled - ${orderNumber}</title>
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      padding: 30px 20px;
      text-align: center;
      color: white;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    
    .logo .number-2 {
      color: #60a5fa;
      text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
    }
    
    .content {
      padding: 30px 25px;
      background-color: #ffffff;
      text-align: center;
    }
    
    .status-badge {
      display: inline-block;
      background-color: #ef4444;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin: 10px 0 20px 0;
    }
    
    .cancellation-info {
      background-color: #fef2f2;
      border: 1px solid #ef4444;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    
    .footer {
      background-color: #f9fafb;
      padding: 25px 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">SCAN<span class="number-2">2</span>TAP</div>
    </div>
    
    <div class="content">
      <h2>Order Cancelled</h2>
      <div class="status-badge">Cancelled</div>
      
      <p>Hi ${userName},</p>
      <p>Your order <strong>${orderNumber}</strong> has been cancelled.</p>
      
      ${reason ? `
      <div class="cancellation-info">
        <h4 style="color: #dc2626; margin-bottom: 10px;">Cancellation Reason</h4>
        <p>${reason}</p>
      </div>
      ` : ''}
      
      <p>If this cancellation was unexpected or if you have any questions, please contact our support team and we'll be happy to help.</p>
      <p>Any charges made to your payment method will be refunded within 3-5 business days.</p>
    </div>
    
    <div class="footer">
      <div class="footer-text">
        <strong>SCAN2TAP</strong><br>
        Your Digital Identity, One Tap Away
      </div>
    </div>
  </div>
</body>
</html>`;
} 