import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.VITE_RESEND_API_KEY);

// Generate a unique reference ID for the contact submission
function generateReferenceId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `CT-${timestamp}-${random}`.toUpperCase();
}

// Thank you email to the user
async function sendThankYouEmail(data) {
  const referenceId = generateReferenceId();
  
  try {
    const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Thank You - Scan2Tap</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    /* Email Client Reset */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      margin: 0; padding: 0; width: 100%; height: 100%;
      font-family: 'Inter', Arial, sans-serif; line-height: 1.6;
      -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;
    }
    
    /* Color Variables for Light Mode (Default) */
    :root {
      --primary-bg: #ffffff;
      --secondary-bg: #f8fafc;
      --text-primary: #1a202c;
      --text-secondary: #4a5568;
      --text-muted: #718096;
      --border-color: #e2e8f0;
      --header-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      --card-bg: #ffffff;
      --card-shadow: rgba(0, 0, 0, 0.1);
      --accent-color: #3b82f6;
      --success-color: #10b981;
      --info-bg: #eff6ff;
      --info-border: #bfdbfe;
      --info-text: #1e40af;
    }
    
    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      :root {
        --primary-bg: #1a202c;
        --secondary-bg: #2d3748;
        --text-primary: #f7fafc;
        --text-secondary: #e2e8f0;
        --text-muted: #a0aec0;
        --border-color: #4a5568;
        --header-bg: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
        --card-bg: #2d3748;
        --card-shadow: rgba(0, 0, 0, 0.3);
        --accent-color: #60a5fa;
        --success-color: #34d399;
        --info-bg: #1e3a8a;
        --info-border: #3b82f6;
        --info-text: #93c5fd;
      }
    }
    
    /* Container */
    .email-container {
      max-width: 600px; margin: 0 auto;
      background: var(--primary-bg);
      box-shadow: 0 10px 30px var(--card-shadow);
      border-radius: 16px; overflow: hidden;
      border: 1px solid var(--border-color);
    }
    
    /* Header */
    .header {
      background: var(--header-bg);
      padding: 40px 20px; text-align: center; position: relative;
      border-bottom: 3px solid var(--accent-color);
    }
    .header::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
    }
    
    /* Modern 3D Logo */
    .logo-container { position: relative; z-index: 10; margin-bottom: 24px; }
    .logo {
      display: inline-block; padding: 20px 32px; background: rgba(255,255,255,0.15);
      border-radius: 20px; border: 2px solid rgba(255,255,255,0.25);
      font-family: 'Inter', sans-serif; font-size: 40px; font-weight: 900;
      letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px;
      box-shadow: 
        0 8px 32px rgba(0,0,0,0.3),
        inset 0 2px 0 rgba(255,255,255,0.4),
        inset 0 -2px 0 rgba(0,0,0,0.1);
      backdrop-filter: blur(12px);
      text-shadow: 
        0 1px 0 rgba(255,255,255,0.8),
        0 2px 3px rgba(0,0,0,0.3),
        0 4px 8px rgba(0,0,0,0.2),
        0 8px 16px rgba(0,0,0,0.1);
    }
    
    .logo-letter {
      display: inline-block; position: relative;
    }
    
    .logo-letter-normal {
      color: #ffffff;
      text-shadow: 
        0 1px 0 rgba(255,255,255,0.9),
        0 2px 4px rgba(0,0,0,0.4),
        0 4px 8px rgba(0,0,0,0.3),
        0 8px 16px rgba(0,0,0,0.2);
    }
    
    .logo-letter-2 {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: #3b82f6;
      text-shadow: 
        0 1px 0 rgba(59, 130, 246, 0.9),
        0 2px 4px rgba(29, 78, 216, 0.7),
        0 4px 8px rgba(30, 64, 175, 0.5),
        0 8px 16px rgba(37, 99, 235, 0.3);
    }
    
    /* Dark Mode Logo Adjustments */
    @media (prefers-color-scheme: dark) {
      .logo-letter-2 {
        background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        color: #60a5fa;
        text-shadow: 
          0 1px 0 rgba(96, 165, 250, 0.9),
          0 2px 4px rgba(59, 130, 246, 0.7),
          0 4px 8px rgba(37, 99, 235, 0.5),
          0 8px 16px rgba(29, 78, 216, 0.3);
      }
    }
    
    .brand-subtitle {
      color: rgba(255,255,255,0.95); font-size: 16px; font-weight: 400;
      margin: 16px 0 0 0; opacity: 0.95; text-align: center;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    
    /* Content */
    .content {
      padding: 40px; background: var(--card-bg);
      color: var(--text-primary);
    }
    
    /* Typography */
    .greeting { 
      font-size: 28px; font-weight: 700; margin-bottom: 20px;
      color: var(--text-primary); text-align: center;
    }
    .message { 
      font-size: 16px; line-height: 1.7; margin-bottom: 32px;
      color: var(--text-secondary); text-align: center;
    }
    
    /* Info Box */
    .info-box {
      background: var(--info-bg);
      border: 2px solid var(--info-border);
      border-radius: 12px; padding: 24px; margin: 32px 0;
      color: var(--info-text); text-align: center;
    }
    .info-title {
      font-size: 18px; font-weight: 600; margin-bottom: 16px;
      color: var(--info-text);
    }
    .reference-id {
      font-family: 'Monaco', 'Consolas', monospace;
      background: rgba(255,255,255,0.8); padding: 8px 16px;
      border-radius: 8px; font-weight: 600; font-size: 16px;
      color: var(--text-primary); display: inline-block;
      border: 1px solid var(--border-color);
    }
    
    /* Dark Mode Info Box */
    @media (prefers-color-scheme: dark) {
      .reference-id {
        background: rgba(0,0,0,0.3);
        color: var(--text-primary);
      }
    }
    
    /* Next Steps */
    .next-steps {
      background: var(--secondary-bg);
      border-radius: 12px; padding: 24px; margin: 32px 0;
      border: 1px solid var(--border-color);
    }
    .steps-title {
      font-size: 20px; font-weight: 600; margin-bottom: 16px;
      color: var(--text-primary);
    }
    .step-item {
      display: flex; align-items: flex-start; margin-bottom: 12px;
    }
    .step-number {
      background: var(--accent-color); color: white;
      width: 24px; height: 24px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 14px; margin-right: 12px;
      flex-shrink: 0;
    }
    .step-text {
      font-size: 15px; line-height: 1.5;
      color: var(--text-secondary);
    }
    
    /* CTA Button */
    .cta-button {
      display: inline-block; background: var(--accent-color);
      color: white; padding: 16px 32px; border-radius: 12px;
      text-decoration: none; font-weight: 600; font-size: 16px;
      margin: 24px 0; text-align: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      background: #2563eb;
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
      transform: translateY(-2px);
    }
    
    /* Footer */
    .footer {
      background: var(--secondary-bg);
      padding: 32px 20px; text-align: center;
      border-top: 1px solid var(--border-color);
    }
    .footer-text {
      font-size: 14px; line-height: 1.6; margin-bottom: 16px;
      color: var(--text-muted);
    }
    .social-links a {
      color: var(--accent-color); text-decoration: none;
      margin: 0 12px; font-weight: 500;
    }
    .social-links a:hover {
      color: #2563eb;
    }
    
    /* Mobile Responsive */
    @media only screen and (max-width: 600px) {
      .email-container { margin: 10px; border-radius: 12px; }
      .header { padding: 32px 16px; }
      .content { padding: 24px 20px; }
      .logo { font-size: 32px; padding: 16px 24px; }
      .greeting { font-size: 24px; }
      .message { font-size: 15px; }
      .info-box, .next-steps { padding: 20px; margin: 24px 0; }
      .footer { padding: 24px 16px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-container">
        <div class="logo">
          <span class="logo-letter logo-letter-normal">SCAN</span><span class="logo-letter logo-letter-2">2</span><span class="logo-letter logo-letter-normal">TAP</span>
        </div>
        <p class="brand-subtitle">Digital Business Cards Reimagined</p>
      </div>
    </div>
    
    <div class="content">
      <h2 class="greeting">Thank you for contacting us, ${data.name}! 🙏</h2>
      
      <p class="message">
        We've received your message and really appreciate you taking the time to reach out to us. 
        Our team reviews all inquiries carefully and we'll get back to you as soon as possible.
      </p>
      
      <div class="info-box">
        <div class="info-title">Your Message Summary</div>
        
        <div class="step-item">
          <span class="step-number">1</span>
          <span class="step-text">Subject: ${data.subject}</span>
        </div>
        
        <div class="step-item">
          <span class="step-number">2</span>
          <span class="step-text">Email: ${data.email}</span>
        </div>
        
        <div class="step-item">
          <span class="step-number">3</span>
          <span class="step-text">Submitted: ${new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
        
        <div class="step-item">
          <span class="step-number">4</span>
          <span class="step-text">Message: ${data.message}</span>
        </div>
      </div>
      
      <div class="reference-id">${referenceId}</div>
      
      <div class="next-steps">
        <div class="steps-title">What happens next?</div>
        <div class="step-item">
          <span class="step-number">1</span>
          <span class="step-text">We'll review your message and get back to you within 24 hours.</span>
        </div>
        <div class="step-item">
          <span class="step-number">2</span>
          <span class="step-text">If you need immediate assistance, check out our FAQ section in our pricing page or contact us at <strong>scan2tap@richverseecotech.com</strong></span>
        </div>
      </div>
      
      <div class="cta-button">
        <a href="https://scan2tap.com" class="cta-button">
          Visit Our Website →
        </a>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-text">
        Scan2Tap
      </div>
      <div class="social-links">
        <a href="https://facebook.com/scan2tap">Facebook</a>
        <a href="https://twitter.com/scan2tap">Twitter</a>
        <a href="https://instagram.com/scan2tap">Instagram</a>
      </div>
      <div class="footer-text">
        Making networking effortless with digital business cards
      </div>
      <a href="https://scan2tap.com" class="footer-text">www.scan2tap.com</a>
      
      <div class="footer-text">
        This email was sent because you contacted us through our website.<br>
        If you didn't submit this request, please ignore this email.
      </div>
    </div>
  </div>
</body>
</html>`;

    const result = await resend.emails.send({
      from: 'Scan2Tap <scan2tap@richverseecotech.com>',
      to: data.email,
      subject: '✅ Thank you for contacting Scan2Tap!',
      html: html,
    });

    return {
      success: !!result.data,
      referenceId: referenceId
    };
  } catch (error) {
    console.error('Failed to send thank you email:', error);
    return {
      success: false,
      referenceId: 'ERROR'
    };
  }
}

// Admin notification email
async function sendAdminNotification(data, referenceId) {
  try {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission - Scan2Tap</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      background: #f8fafc;
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333333;
    }
    
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
    }
    
    .alert-header {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      padding: 30px;
      text-align: center;
      color: white;
    }
    
    .alert-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }
    
    .alert-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }
    
    .alert-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin-top: 8px;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .priority-badge {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
    }
    
    .contact-card {
      background: #f8fafc;
      border-radius: 12px;
      padding: 24px;
      margin: 20px 0;
      border-left: 4px solid #dc2626;
    }
    
    .contact-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    
    .contact-name {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
    }
    
    .contact-time {
      font-size: 14px;
      color: #64748b;
      background: white;
      padding: 4px 12px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 12px;
      margin: 16px 0;
    }
    
    .detail-label {
      font-weight: 600;
      color: #475569;
      font-size: 14px;
    }
    
    .detail-value {
      color: #1e293b;
      font-size: 14px;
    }
    
    .message-section {
      margin: 24px 0;
    }
    
    .message-header {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    
    .message-content {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      font-style: italic;
      color: #374151;
      line-height: 1.6;
    }
    
    .action-buttons {
      text-align: center;
      margin: 30px 0;
    }
    
    .reply-button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    
    .reference-section {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border: 1px solid #93c5fd;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      margin: 20px 0;
    }
    
    .reference-id {
      font-family: 'Courier New', monospace;
      font-size: 16px;
      font-weight: 700;
      color: #1d4ed8;
    }
    
    .footer {
      background: #f1f5f9;
      padding: 20px 30px;
      border-top: 1px solid #e2e8f0;
      font-size: 14px;
      color: #64748b;
    }
    
    .reminder-list {
      margin: 16px 0;
      padding-left: 0;
      list-style: none;
    }
    
    .reminder-list li {
      padding: 6px 0;
      padding-left: 20px;
      position: relative;
    }
    
    .reminder-list li::before {
      content: "•";
      color: #dc2626;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    
    /* Mobile Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        margin: 10px;
      }
      
      .content {
        padding: 20px;
      }
      
      .contact-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .contact-time {
        margin-top: 8px;
      }
      
      .detail-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }
      
      .reply-button {
        display: block;
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="alert-header">
      <div class="alert-icon">🚨</div>
      <h1 class="alert-title">New Contact Form Submission</h1>
      <p class="alert-subtitle">Immediate attention required</p>
    </div>
    
    <div class="content">
      <div class="priority-badge">🔥 New Customer Inquiry</div>
      
      <div class="contact-card">
        <div class="contact-header">
          <div class="contact-name">${data.name}</div>
          <div class="contact-time">📅 ${new Date().toLocaleString()}</div>
        </div>
        
        <div class="detail-grid">
          <div class="detail-label">📧 Email:</div>
          <div class="detail-value">
            <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a>
          </div>
          
          <div class="detail-label">📝 Subject:</div>
          <div class="detail-value">${data.subject}</div>
          
          <div class="detail-label">🆔 Reference:</div>
          <div class="detail-value" style="font-family: 'Courier New', monospace; font-weight: 600;">${referenceId}</div>
        </div>
        
        <div class="message-section">
          <div class="message-header">
            💬 Customer Message:
          </div>
          <div class="message-content">
            "${data.message}"
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <a href="mailto:${data.email}?subject=Re: ${data.subject} (Ref: ${referenceId})&body=Hi ${data.name},%0D%0A%0D%0AThank you for contacting Scan2Tap. I'm following up on your inquiry about "${data.subject}".%0D%0A%0D%0A" class="reply-button">
          📧 Reply to Customer
        </a>
      </div>
      
      <div class="reference-section">
        <p style="margin: 0; color: #1d4ed8; font-weight: 600;">Customer Reference ID</p>
        <p class="reference-id">${referenceId}</p>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Customer has been sent this reference number</p>
      </div>
      
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h4 style="color: #dc2626; margin: 0 0 8px 0;">⚡ Action Required:</h4>
        <ul class="reminder-list">
          <li>Respond to customer within 24 hours</li>
          <li>Update CRM with inquiry details</li>
          <li>Set follow-up reminder if needed</li>
          <li>Log resolution in customer service system</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Scan2Tap Customer Service Alert</strong></p>
      <p>This email was automatically generated from the contact form on your website.</p>
      <p>Please respond promptly to maintain high customer satisfaction.</p>
    </div>
  </div>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: 'Scan2Tap Alert <scan2tap@richverseecotech.com>',
      to: 'scan2tap@gmail.com',
      subject: `🚨 New Contact: ${data.subject} - ${data.name} (${referenceId})`,
      html: html,
    });

    return !!result.data;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return false;
  }
}

// Main function to send both emails
async function sendContactEmails(data) {
  try {
    // Send thank you email first to get reference ID
    const thankYouResult = await sendThankYouEmail(data);
    
    // Send admin notification with the same reference ID
    const adminResult = await sendAdminNotification(data, thankYouResult.referenceId);
    
    return {
      thankYouSent: thankYouResult.success,
      adminNotificationSent: adminResult,
      referenceId: thankYouResult.referenceId
    };
  } catch (error) {
    console.error('Failed to send contact emails:', error);
    return {
      thankYouSent: false,
      adminNotificationSent: false,
      referenceId: 'ERROR'
    };
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields. Please provide name, email, subject, and message.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format.'
      });
    }

    // Validate field lengths
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Name must be between 2 and 100 characters.'
      });
    }

    if (subject.length < 2 || subject.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'Subject must be between 2 and 200 characters.'
      });
    }

    if (message.length < 10 || message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Message must be between 10 and 2000 characters.'
      });
    }

    // Prepare contact form data
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    };

    console.log(`📧 Processing contact form submission from ${contactData.email}`);

    // Send emails using the contact email service
    const emailResult = await sendContactEmails(contactData);

    // Return response based on email sending results
    if (emailResult.thankYouSent && emailResult.adminNotificationSent) {
      console.log(`✅ Both emails sent successfully for ${contactData.email} (Ref: ${emailResult.referenceId})`);
      
      return res.status(200).json({
        success: true,
        message: 'Thank you for your message! We\'ll get back to you soon.',
        referenceId: emailResult.referenceId
      });
    } else if (emailResult.thankYouSent) {
      console.log(`⚠️ Thank you email sent but admin notification failed for ${contactData.email}`);
      
      return res.status(200).json({
        success: true,
        message: 'Thank you for your message! We\'ll get back to you soon.',
        referenceId: emailResult.referenceId,
        warning: 'Admin notification may be delayed.'
      });
    } else {
      console.error(`❌ Failed to send emails for ${contactData.email}`);
      
      return res.status(500).json({
        success: false,
        error: 'Unable to send confirmation email. Please try again or contact us directly.',
        referenceId: emailResult.referenceId
      });
    }

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again later.'
    });
  }
} 