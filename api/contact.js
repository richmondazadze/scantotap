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
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You - Scan2Tap</title>
  
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
      margin-bottom: 30px;
      text-align: center;
      line-height: 1.7;
    }
    
    .info-section {
      background-color: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    
    .info-title {
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .reference-box {
      background-color: #eff6ff;
      border: 2px solid #3b82f6;
      border-radius: 6px;
      padding: 15px;
      text-align: center;
      margin: 20px 0;
    }
    
    .reference-label {
      font-size: 14px;
      color: #1e40af;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .reference-id {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: bold;
      color: #1e40af;
      letter-spacing: 1px;
    }
    
    .details-list {
      list-style: none;
      padding: 0;
    }
    
    .details-list li {
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
    }
    
    .details-list li:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      font-weight: bold;
      color: #374151;
      min-width: 100px;
    }
    
    .detail-value {
      color: #6b7280;
      text-align: right;
      flex: 1;
      margin-left: 15px;
    }
    
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
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
    
    .footer-link {
      color: #2563eb;
      text-decoration: none;
      font-weight: bold;
    }
    
    /* Mobile Responsive */
    @media only screen and (max-width: 600px) {
      body { padding: 10px; }
      .content { padding: 25px 20px; }
      .header { padding: 25px 15px; }
      .logo { font-size: 28px; }
      .greeting { font-size: 20px; }
      .details-list li { flex-direction: column; }
      .detail-value { text-align: left; margin-left: 0; margin-top: 5px; }
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
      <h1 class="greeting">Thank you, ${data.name}! 🙏</h1>
      
      <p class="message">
        We've received your message and truly appreciate you reaching out to us. 
        Our team will review your inquiry and get back to you as soon as possible.
      </p>
      
      <!-- Reference ID -->
      <div class="reference-box">
        <div class="reference-label">Your Reference ID</div>
        <div class="reference-id">${referenceId}</div>
      </div>
      
      <!-- Message Details -->
      <div class="info-section">
        <div class="info-title">Message Summary</div>
        <ul class="details-list">
          <li>
            <span class="detail-label">Subject:</span>
            <span class="detail-value">${data.subject}</span>
          </li>
          <li>
            <span class="detail-label">Email:</span>
            <span class="detail-value">${data.email}</span>
          </li>
          <li>
            <span class="detail-label">Date:</span>
            <span class="detail-value">${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </li>
          <li>
            <span class="detail-label">Message:</span>
            <span class="detail-value">${data.message}</span>
          </li>
        </ul>
      </div>
      
      <!-- What's Next -->
      <div class="info-section">
        <div class="info-title">What happens next?</div>
        <p style="color: #4b5563; margin: 0;">
          • We'll review your message within 24 hours<br>
          • Our team will respond with personalized assistance<br>
          • For urgent matters, contact us directly at scan2tap@richverseecotech.com
        </p>
      </div>
      
      <!-- CTA -->
      <div style="text-align: center;">
        <a href="https://scan2tap.vercel.app" class="cta-button">Visit Our Website</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        <strong>Scan2Tap</strong><br>
        Making networking effortless with digital profiles
      </div>
      <div class="footer-text">
        <a href="https://scan2tap.vercel.app" class="footer-link">www.scan2tap.vercel.app</a>
      </div>
      <div class="footer-text" style="font-size: 12px; margin-top: 15px;">
        This email was sent because you contacted us through our website.<br>
        If you didn't submit this request, please ignore this email.
      </div>
    </div>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from: 'Scan2Tap <scan2tap@richverseecotech.com>',
      to: [data.email],
      subject: 'Thank you for contacting Scan2Tap!',
      html: html,
    });

    console.log('✅ Thank you email sent successfully to:', data.email);
    return { success: true, referenceId };
  } catch (error) {
    console.error('❌ Error sending thank you email:', error);
    return { success: false, referenceId };
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