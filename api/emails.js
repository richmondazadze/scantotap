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
    const { type, to, data } = req.body;

    if (!type || !to || !data) {
      return res.status(400).json({ error: 'Missing required fields: type, to, data' });
    }

    let subject, html;

    switch (type) {
      case 'welcome':
        subject = 'Welcome to SCAN2TAP!';
        html = generateWelcomeEmail(data);
        break;
      case 'onboarding-complete':
        subject = 'Welcome to SCAN2TAP - Your Profile is Ready!';
        html = generateOnboardingCompleteEmail(data);
        break;
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    const result = await resend.emails.send({
      from: 'SCAN2TAP <scan2tap@richverseecotech.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    return res.status(200).json({ success: true, id: result.id });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

function generateWelcomeEmail(data) {
  const { userName, profileUrl } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SCAN2TAP</title>
  
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
    
    .message {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 20px;
      text-align: center;
      line-height: 1.7;
    }
    
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: white !important;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    
    .cta-button:hover {
      background-color: #1d4ed8;
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
    </div>
    
    <!-- Content -->
    <div class="content">
      <h1 class="greeting">Welcome to SCAN2TAP, ${userName}! 🎉</h1>
      
      <p class="message">
        Thank you for joining SCAN2TAP! We're excited to help you create your digital presence and connect with others effortlessly.
      </p>
      
      <p class="message">
        Get started by completing your profile setup and customizing your digital business card.
      </p>
      
      <!-- CTA -->
      <div style="text-align: center;">
        <a href="${profileUrl}" class="cta-button">Complete Your Profile</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        <strong>SCAN2TAP</strong><br>
        Your Digital Identity, One Tap Away
      </div>
      <div class="footer-text">
        © 2024 SCAN2TAP. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateOnboardingCompleteEmail(data) {
  const { userName, profileUrl } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile Ready - SCAN2TAP</title>
  
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
    
    .message {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 20px;
      text-align: center;
      line-height: 1.7;
    }
    
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: white !important;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    
    .cta-button:hover {
      background-color: #1d4ed8;
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
    </div>
    
    <!-- Content -->
    <div class="content">
      <h1 class="greeting">🎉 Congratulations, ${userName}!</h1>
      
      <p class="message">
        Your SCAN2TAP profile is now complete and ready to share! You've successfully set up your digital business card.
      </p>
      
      <p class="message">
        Start networking and sharing your professional information with just one tap. Your digital identity is now at your fingertips!
      </p>
      
      <!-- CTA -->
      <div style="text-align: center;">
        <a href="${profileUrl}" class="cta-button">View Your Profile</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        <strong>SCAN2TAP</strong><br>
        Your Digital Identity, One Tap Away
      </div>
      <div class="footer-text">
        © 2024 SCAN2TAP. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;
} 