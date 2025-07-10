import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactEmailResponse {
  thankYouSent: boolean;
  adminNotificationSent: boolean;
  referenceId: string;
}

class ContactEmailService {
  private readonly fromEmail = 'scan2tap@richverseecotech.com';
  private readonly adminEmail = 'scan2tap@gmail.com';
  private readonly brandName = 'Scan2Tap';

  // Generate a unique reference ID for the contact submission
  private generateReferenceId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `CT-${timestamp}-${random}`.toUpperCase();
  }

  // Thank you email to the user
  async sendThankYouEmail(data: ContactFormData): Promise<{ success: boolean; referenceId: string }> {
    const referenceId = this.generateReferenceId();
    
    try {
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You - ${this.brandName}</title>
  
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

      const result = await resend.emails.send({
        from: `${this.brandName} <${this.fromEmail}>`,
        to: data.email,
        subject: `✅ Thank you for contacting ${this.brandName}!`,
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
  async sendAdminNotification(data: ContactFormData, referenceId: string): Promise<boolean> {
    try {
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Submission - ${this.brandName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a202c;
      background: #f7fafc; padding: 20px;
    }
    .email-container {
      max-width: 600px; margin: 0 auto; background: #ffffff;
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .alert-header {
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      color: white; padding: 30px; text-align: center;
    }
    .alert-title {
      font-size: 24px; font-weight: 700; margin-bottom: 8px;
    }
    .alert-subtitle {
      opacity: 0.9; font-size: 16px;
    }
    .content {
      padding: 40px 32px;
    }
    .priority-badge {
      display: inline-block; background: #fef2f2; color: #dc2626;
      padding: 8px 16px; border-radius: 20px; font-size: 12px;
      font-weight: 600; text-transform: uppercase; letter-spacing: 1px;
      margin-bottom: 24px;
    }
    .customer-card {
      background: #f8fafc; border-radius: 12px; padding: 24px;
      border-left: 4px solid #3b82f6; margin: 24px 0;
    }
    .customer-name {
      font-size: 20px; font-weight: 700; color: #2d3748; margin-bottom: 16px;
    }
    .detail-grid {
      display: grid; grid-template-columns: auto 1fr; gap: 12px 24px;
      margin: 16px 0;
    }
    .detail-label {
      font-weight: 600; color: #4a5568; font-size: 14px;
    }
    .detail-value {
      color: #2d3748; word-break: break-word;
    }
    .message-section {
      background: #fffbeb; border-radius: 8px; padding: 20px;
      border-left: 4px solid #f59e0b; margin: 20px 0;
    }
    .message-header {
      font-weight: 600; color: #92400e; margin-bottom: 12px;
    }
    .message-content {
      color: #78350f; font-style: italic; line-height: 1.6;
    }
    .action-buttons {
      text-align: center; margin: 32px 0;
    }
    .reply-button {
      display: inline-block; background: #3b82f6; color: white;
      padding: 12px 24px; border-radius: 8px; text-decoration: none;
      font-weight: 600; box-shadow: 0 4px 12px rgba(59,130,246,0.3);
    }
    .reference-section {
      background: #f0f9ff; border-radius: 8px; padding: 20px;
      text-align: center; margin: 20px 0;
    }
    .reference-id {
      font-family: monospace; font-size: 16px; font-weight: 700;
      color: #1e40af; background: white; padding: 8px 16px;
      border-radius: 6px; display: inline-block; margin: 8px 0;
    }
    .urgency-reminder {
      background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
      padding: 16px; margin: 20px 0;
    }
    .urgency-title {
      color: #dc2626; font-weight: 700; margin-bottom: 8px;
    }
    .urgency-list {
      color: #991b1b; margin: 8px 0; padding-left: 20px;
    }
    .urgency-list li {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="alert-header">
      <div class="alert-title">🚨 New Customer Contact</div>
      <div class="alert-subtitle">Immediate attention required</div>
    </div>
    
    <div class="content">
      <div class="priority-badge">HIGH PRIORITY</div>
      
      <div class="customer-card">
        <div class="customer-name">${data.name}</div>
        
        <div class="detail-grid">
          <div class="detail-label">📧 Email:</div>
          <div class="detail-value">
            <a href="mailto:${data.email}" style="color: #3b82f6; text-decoration: none;">${data.email}</a>
          </div>
          
          <div class="detail-label">📝 Subject:</div>
          <div class="detail-value">${data.subject}</div>
          
          <div class="detail-label">🆔 Reference:</div>
          <div class="detail-value">${referenceId}</div>
          
          <div class="detail-label">⏰ Submitted:</div>
          <div class="detail-value">${new Date().toLocaleString()}</div>
        </div>
        
        <div class="message-section">
          <div class="message-header">💬 Customer Message:</div>
          <div class="message-content">"${data.message}"</div>
        </div>
      </div>
      
      <div class="action-buttons">
        <a href="mailto:${data.email}?subject=Re: ${data.subject} (Ref: ${referenceId})&body=Hi ${data.name},%0D%0A%0D%0AThank you for contacting ${this.brandName}. I'm following up on your inquiry about "${data.subject}".%0D%0A%0D%0A" class="reply-button">
          📧 Reply to Customer
        </a>
      </div>
      
      <div class="reference-section">
        <p style="margin: 0; color: #1e40af; font-weight: 600;">Customer Reference ID</p>
        <div class="reference-id">${referenceId}</div>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Customer has been sent this reference number</p>
      </div>
      
      <div class="urgency-reminder">
        <h4 class="urgency-title">⚡ Action Required:</h4>
        <ul class="urgency-list">
          <li>Respond to customer within 24 hours</li>
          <li>Update CRM with inquiry details</li>
          <li>Set follow-up reminder if needed</li>
          <li>Log resolution in customer service system</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>`;

      const result = await resend.emails.send({
        from: `${this.brandName} Alert <${this.fromEmail}>`,
        to: this.adminEmail,
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
  async sendContactEmails(data: ContactFormData): Promise<ContactEmailResponse> {
    try {
      // Send thank you email first to get reference ID
      const thankYouResult = await this.sendThankYouEmail(data);
      
      // Send admin notification with the same reference ID
      const adminResult = await this.sendAdminNotification(data, thankYouResult.referenceId);
      
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
}

export default new ContactEmailService();
