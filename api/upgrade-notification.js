import { Resend } from 'resend';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

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
    const { emails, upgradeDate } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Missing required field: emails array' });
    }

    const subject = 'SCAN2TAP Database Reset Notice';
    const html = generateUpgradeNotificationEmail({ upgradeDate });

    const results = [];
    const errors = [];

    // Send emails to all users
    for (const email of emails) {
      try {
        const result = await resend.emails.send({
          from: 'SCAN2TAP <scan2tap@richverseecotech.com>',
          to: [email],
          subject: subject,
          html: html,
        });
        
        results.push({ email, success: true, id: result.id });
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        errors.push({ email, error: error.message });
      }
    }

    return res.status(200).json({ 
      success: true, 
      totalSent: results.length,
      totalFailed: errors.length,
      results,
      errors 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send emails' });
  }
}

function generateUpgradeNotificationEmail(data) {
  const { upgradeDate } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SCAN2TAP Platform Enhancement</title>
  
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
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    
    .logo .number-2 {
      color: #60a5fa;
      text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
    }
    
    .tagline {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 5px;
    }
    
    .update-badge {
      background-color: rgba(191, 219, 254, 0.2);
      border: 1px solid #60a5fa;
      border-radius: 6px;
      padding: 8px 15px;
      margin-top: 15px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .content {
      padding: 40px 30px;
      background-color: #ffffff;
    }
    
    .greeting {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .enhancement-icon {
      font-size: 48px;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .message {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 20px;
      line-height: 1.7;
    }
    
    .enhancement-notice {
      background-color: #eff6ff;
      border-left: 4px solid #2563eb;
      border-radius: 6px;
      padding: 20px;
      margin: 25px 0;
    }
    
    .enhancement-notice h3 {
      font-size: 18px;
      font-weight: bold;
      color: #1d4ed8;
      margin-bottom: 10px;
    }
    
    .enhancement-notice p {
      color: #1e40af;
      margin-bottom: 10px;
    }
    
    .timeline {
      background-color: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    
    .timeline h3 {
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .timeline-item {
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
      position: relative;
      padding-left: 30px;
    }
    
    .timeline-item:last-child {
      border-bottom: none;
    }
    
    .timeline-item:before {
      content: "📅";
      position: absolute;
      left: 0;
      font-size: 16px;
    }
    
    .timeline-date {
      font-weight: bold;
      color: #2563eb;
    }
    
    .support-section {
      background-color: #ecfdf5;
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      text-align: center;
    }
    
    .support-section h3 {
      color: #047857;
      margin-bottom: 10px;
    }
    
    .support-section p {
      color: #065f46;
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
      margin-bottom: 10px;
    }
    
    /* Mobile Responsive */
    @media only screen and (max-width: 600px) {
      body { padding: 10px; }
      .content { padding: 25px 20px; }
      .header { padding: 25px 15px; }
      .logo { font-size: 28px; }
      .greeting { font-size: 20px; }
      .important-notice, .timeline, .apology { padding: 15px; }
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
      <div class="tagline">Your Digital Identity, One Tap Away</div>
      <div class="update-badge">Database Reset</div>
    </div>
    
    <!-- Content -->
    <div class="content">
      <div class="enhancement-icon">🔄</div>
      <h1 class="greeting">Database Reset Notice</h1>
      
      <p class="message">
        We are performing a complete database reset to improve our platform. This means <strong>all existing user data will be permanently deleted</strong>.
      </p>
      
      <div class="enhancement-notice">
        <h3>📋 What This Means</h3>
        <p><strong>All profiles, settings, and account information will be lost.</strong></p>
        <p>You will need to create a new account after the reset is complete.</p>
      </div>
      
      ${upgradeDate ? `<p class="message">
        <strong>Reset Date:</strong> ${upgradeDate}
      </p>` : ''}
      
      <div class="support-section">
        <h3>🙏 Our Apologies</h3>
        <p>We sincerely apologize for any inconvenience this may cause. This reset is necessary for platform improvements.</p>
      </div>
      
      <p class="message">
        If you have any questions, please contact our support team.
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        <strong>SCAN2TAP Development Team</strong><br>
        Your Digital Identity, One Tap Away
      </div>
      <div class="footer-text">
        © 2025 SCAN2TAP. All rights reserved.
      </div>
      <div class="footer-text" style="font-size: 12px; margin-top: 15px; color: #9ca3af;">
        This is an official communication from SCAN2TAP regarding platform improvements.<br>
        If you have questions, contact us at support@richverseecotech.com
      </div>
    </div>
  </div>
</body>
</html>`;
} 