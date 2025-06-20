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

    const subject = 'Important: SCAN2TAP Database Upgrade Notice';
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
  <title>Important: SCAN2TAP Database Upgrade Notice</title>
  
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
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
      color: #fca5a5;
      text-shadow: 0 0 10px rgba(252, 165, 165, 0.5);
    }
    
    .tagline {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 5px;
    }
    
    .warning-badge {
      background-color: rgba(254, 202, 202, 0.2);
      border: 1px solid #fca5a5;
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
    
    .warning-icon {
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
    
    .important-notice {
      background-color: #fef2f2;
      border-left: 4px solid #dc2626;
      border-radius: 6px;
      padding: 20px;
      margin: 25px 0;
    }
    
    .important-notice h3 {
      font-size: 18px;
      font-weight: bold;
      color: #dc2626;
      margin-bottom: 10px;
    }
    
    .important-notice p {
      color: #7f1d1d;
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
      color: #dc2626;
    }
    
    .apology {
      background-color: #f0f9ff;
      border: 1px solid #7dd3fc;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      text-align: center;
    }
    
    .apology h3 {
      color: #0c4a6e;
      margin-bottom: 10px;
    }
    
    .apology p {
      color: #075985;
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
      <div class="warning-badge">Important System Notice</div>
    </div>
    
    <!-- Content -->
    <div class="content">
      <div class="warning-icon">⚠️</div>
      <h1 class="greeting">Important Database Upgrade Notice</h1>
      
      <p class="message">
        We hope this message finds you well. We are writing to inform you about an important system upgrade that will affect your SCAN2TAP account.
      </p>
      
      <div class="important-notice">
        <h3>🔴 Critical Information</h3>
        <p><strong>We will be performing a final database upgrade that requires clearing all existing user data.</strong></p>
        <p>This means that all current profiles, settings, and user information will be permanently deleted from our system.</p>
      </div>
      
      <p class="message">
        This upgrade is necessary to implement significant improvements to our platform, enhance security, and provide you with a better overall experience in the future.
      </p>
      
      <div class="timeline">
        <h3>📋 What You Need to Know</h3>
        <div class="timeline-item">
          <span class="timeline-date">Before the upgrade:</span> Please save any important information from your profile
        </div>
        <div class="timeline-item">
          <span class="timeline-date">During the upgrade:</span> The platform will be temporarily unavailable
        </div>
        <div class="timeline-item">
          <span class="timeline-date">After the upgrade:</span> You can create a new account with improved features
        </div>
        ${upgradeDate ? `<div class="timeline-item">
          <span class="timeline-date">Scheduled Date:</span> ${upgradeDate}
        </div>` : ''}
      </div>
      
      <p class="message">
        We understand this may cause inconvenience, and we want to ensure you're fully informed about these changes. The new system will offer enhanced features, better performance, and improved security for all users.
      </p>
      
      <div class="apology">
        <h3>💙 Our Sincere Apologies</h3>
        <p>We sincerely apologize for any inconvenience this may cause. We appreciate your understanding and continued support as we work to improve SCAN2TAP for everyone.</p>
      </div>
      
      <p class="message">
        If you have any questions or concerns about this upgrade, please don't hesitate to reach out to our support team. We're here to help and ensure a smooth transition.
      </p>
      
      <p class="message">
        Thank you for being part of the SCAN2TAP community. We look forward to serving you with our enhanced platform soon.
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        <strong>SCAN2TAP Support Team</strong><br>
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