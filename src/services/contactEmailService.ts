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
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Thank You - ${this.brandName}</title>
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
    
    /* Main Container */
    .email-wrapper {
      width: 100%; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 40px 20px; min-height: 100vh;
    }
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
    
    /* Modern Logo */
    .logo-container { position: relative; z-index: 10; margin-bottom: 24px; }
    .logo {
      display: inline-block; padding: 20px 32px; 
      background: rgba(255,255,255,0.15);
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
    
    /* Content Area */
    .content {
      padding: 40px; background: var(--card-bg);
      color: var(--text-primary);
    }
    
    /* Typography */
    .greeting { 
      font-size: 28px; font-weight: 700; margin-bottom: 20px;
      color: var(--text-primary);
    }
    .message { 
      font-size: 16px; line-height: 1.7; margin-bottom: 32px;
      color: var(--text-secondary);
    }
    
    /* Info Box */
    .info-box {
      background: var(--info-bg);
      border: 2px solid var(--info-border);
      border-radius: 12px; padding: 24px; margin: 32px 0;
      color: var(--info-text);
    }
    .info-title {
      font-size: 18px; font-weight: 600; margin-bottom: 16px;
      color: var(--info-text);
    }
    .reference-id {
      font-family: 'Monaco', 'Consolas', monospace;
      background: rgba(255,255,255,0.8); padding: 8px 16px;
      border-radius: 8px; font-weight: 600; font-size: 16px;
      color: var(--text-primary);
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
  <div class="email-wrapper">
    <div class="email-container">
              <!-- Header -->
        <div class="header">
          <div class="logo-container">
            <div class="logo">
              <span class="logo-letter logo-letter-normal">SCAN</span><span class="logo-letter logo-letter-2">2</span><span class="logo-letter logo-letter-normal">TAP</span>
            </div>
            <p class="brand-subtitle">Digital Business Cards Reimagined</p>
          </div>
        </div>
      
      <!-- Main Content -->
      <div class="content">
        <h2 class="greeting">Thank you for contacting us, ${data.name}! 🙏</h2>
        
        <p class="message">
          We've received your message and really appreciate you taking the time to reach out to us. 
          Our team reviews all inquiries carefully and we'll get back to you as soon as possible.
        </p>
        
        <!-- Message Summary -->
        <div class="summary-card">
          <div class="summary-title">
            <span class="summary-icon">📋</span>
            Your Message Summary
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Subject:</span>
            <span class="detail-value">${data.subject}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${data.email}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Submitted:</span>
            <span class="detail-value">${new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Message:</span>
            <span class="detail-value">${data.message}</span>
          </div>
        </div>
        
        <!-- Reference ID -->
        <div class="reference-section">
          <div class="reference-title">Your Reference ID</div>
          <div class="reference-id">${referenceId}</div>
          <div class="reference-note">Please keep this for your records</div>
        </div>
        
        <!-- Response Time Info -->
        <div class="info-card">
          <h3>⏱️ Response Time</h3>
          <p>We typically respond within 24 hours during business days. For urgent matters, feel free to call us directly.</p>
        </div>
        
        <!-- Quick Help -->
        <div class="info-card">
          <h3>📞 Need immediate help?</h3>
          <p>Check out our FAQ section in our pricing page or contact us at <strong>${this.fromEmail}</strong></p>
        </div>
        
        <!-- CTA Button -->
        <div class="action-section">
          <a href="https://scan2tap.com" class="cta-button">
            Visit Our Website →
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <div class="footer-brand">Scan2Tap</div>
        <div class="footer-tagline">Making networking effortless with digital business cards</div>
        <a href="https://scan2tap.com" class="footer-link">www.scan2tap.com</a>
        
        <div class="footer-note">
          This email was sent because you contacted us through our website.<br>
          If you didn't submit this request, please ignore this email.
        </div>
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
