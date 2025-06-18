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
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Thank You - ${this.brandName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    /* Reset styles with email client compatibility */
    * { 
      margin: 0 !important; 
      padding: 0 !important; 
      box-sizing: border-box !important; 
    }
    
    /* Dark mode fixes and email client compatibility */
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #f8fafc !important;
      background: #f8fafc !important;
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif !important;
      line-height: 1.6 !important;
      color: #333333 !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      -webkit-text-size-adjust: 100% !important;
      -ms-text-size-adjust: 100% !important;
    }
    
    /* Dark mode overrides */
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #f8fafc !important;
        color: #333333 !important;
      }
      .email-container {
        background-color: #ffffff !important;
        color: #333333 !important;
      }
      .content {
        background-color: #ffffff !important;
        color: #333333 !important;
      }
      .greeting {
        color: #1f2937 !important;
      }
      .message {
        color: #4b5563 !important;
      }
      .summary-card {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
        color: #1e293b !important;
      }
      .brand-name {
        color: #ffffff !important;
      }
      .tagline {
        color: rgba(255,255,255,0.95) !important;
      }
    }
    
    /* Email client specific fixes */
    table {
      border-collapse: collapse !important;
      border-spacing: 0 !important;
    }
    
    img {
      border: 0 !important;
      line-height: 100% !important;
      outline: none !important;
      text-decoration: none !important;
      display: block !important;
    }
    
    .email-container {
      max-width: 600px !important;
      margin: 0 auto !important;
      background-color: #ffffff !important;
      background: #ffffff !important;
      border-radius: 16px !important;
      overflow: hidden !important;
      box-shadow: 0 25px 50px rgba(0,0,0,0.15) !important;
      -webkit-border-radius: 16px !important;
      -moz-border-radius: 16px !important;
    }
    
    .header {
      background-color: #3b82f6 !important;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 25%, #6366f1 50%, #8b5cf6 75%, #a855f7 100%) !important;
      padding: 50px 40px !important;
      text-align: center !important;
      position: relative !important;
      overflow: hidden !important;
    }
    
    /* Simplified header effects for better email client support */
    .header::before {
      content: '' !important;
      position: absolute !important;
      top: -100% !important;
      left: -100% !important;
      width: 300% !important;
      height: 300% !important;
      background: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%) !important;
      pointer-events: none !important;
    }
    
    .header::after {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px) !important;
      pointer-events: none !important;
    }
    
    /* Simplified animations that work across email clients */
    @keyframes shimmer {
      0%, 100% { opacity: 1 !important; }
      50% { opacity: 0.8 !important; }
    }
    
    .logo-container {
      position: relative !important;
      z-index: 10 !important;
      margin-bottom: 24px !important;
    }
    
    .logo {
      width: 80px !important;
      height: 80px !important;
      background-color: rgba(255,255,255,0.25) !important;
      background: rgba(255,255,255,0.25) !important;
      border-radius: 20px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      border: 2px solid rgba(255,255,255,0.4) !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important;
      position: relative !important;
      overflow: hidden !important;
      -webkit-border-radius: 20px !important;
      -moz-border-radius: 20px !important;
    }
    
    .logo::before {
      content: '' !important;
      position: absolute !important;
      top: -50% !important;
      left: -50% !important;
      width: 200% !important;
      height: 200% !important;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent) !important;
      pointer-events: none !important;
    }
    
    .logo img {
      width: 60px !important;
      height: 60px !important;
      object-fit: contain !important;
      position: relative !important;
      z-index: 2 !important;
      filter: brightness(1.1) contrast(1.05) !important;
      max-width: 60px !important;
      max-height: 60px !important;
    }
    
    .brand-container {
      position: relative !important;
      z-index: 10 !important;
    }
    
    .brand-name {
      font-family: 'Roboto', Arial, sans-serif !important;
      font-size: 32px !important;
      font-weight: 700 !important;
      color: #ffffff !important;
      margin: 0 !important;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
      letter-spacing: 0.5px !important;
      position: relative !important;
      line-height: 1.2 !important;
    }
    
    .brand-name::after {
      content: '' !important;
      position: absolute !important;
      bottom: -4px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 60px !important;
      height: 2px !important;
      background: rgba(255,255,255,0.8) !important;
      border-radius: 2px !important;
      -webkit-transform: translateX(-50%) !important;
      -moz-transform: translateX(-50%) !important;
      -webkit-border-radius: 2px !important;
      -moz-border-radius: 2px !important;
    }
    
    .tagline {
      color: rgba(255,255,255,0.95) !important;
      font-size: 18px !important;
      margin-top: 12px !important;
      font-weight: 400 !important;
      letter-spacing: 0.3px !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
      line-height: 1.4 !important;
    }
    
    .content {
      padding: 50px 40px !important;
      background-color: #ffffff !important;
      background: #ffffff !important;
    }
    
    .greeting {
      font-size: 24px !important;
      font-weight: 600 !important;
      color: #1f2937 !important;
      margin-bottom: 20px !important;
      line-height: 1.3 !important;
      font-family: 'Roboto', Arial, sans-serif !important;
    }
    
    .message {
      font-size: 16px !important;
      line-height: 1.8 !important;
      color: #4b5563 !important;
      margin-bottom: 30px !important;
      font-family: 'Roboto', Arial, sans-serif !important;
    }
    
    .summary-card {
      background-color: #f8fafc !important;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
      border-radius: 12px !important;
      padding: 24px !important;
      margin: 24px 0 !important;
      border-left: 4px solid #2563eb !important;
      -webkit-border-radius: 12px !important;
      -moz-border-radius: 12px !important;
    }
    
    .summary-card h3 {
      color: #1e293b !important;
      font-size: 18px !important;
      font-weight: 600 !important;
      margin-bottom: 12px !important;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin: 8px 0;
      padding: 8px 0;
      border-bottom: 1px solid rgba(226, 232, 240, 0.5);
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      font-weight: 600;
      color: #475569;
      flex-shrink: 0;
      margin-right: 16px;
    }
    
    .detail-value {
      color: #1e293b;
      text-align: right;
      flex-grow: 1;
    }
    
    .reference-highlight {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border: 1px solid #93c5fd;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      margin: 20px 0;
    }
    
    .reference-id {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: 700;
      color: #1d4ed8;
      margin: 8px 0;
    }
    
    .footer {
      background: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.6;
    }
    
    /* Mobile Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        margin: 10px;
        border-radius: 12px;
      }
      
      .header {
        padding: 30px 20px;
      }
      
      .content {
        padding: 30px 20px;
      }
      
      .greeting {
        font-size: 20px;
      }
      
      .detail-row {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .detail-value {
        text-align: left;
        margin-top: 4px;
      }
      
      .footer {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-container">
        <div class="logo">
          <img src="https://scan2tap.vercel.app/logo.png" alt="Scan2Tap Logo">
        </div>
      </div>
      <div class="brand-container">
        <h1 class="brand-name">${this.brandName}</h1>
        <p class="tagline">Digital Business Cards Reimagined</p>
      </div>
    </div>
    
    <div class="content">
      <h2 class="greeting">Thank you for contacting us, ${data.name}! 🙏</h2>
      
      <div class="message">
        <p>We've received your message and really appreciate you taking the time to reach out to us. Our team reviews all inquiries carefully and we'll get back to you as soon as possible.</p>
      </div>
      
      <div class="summary-card">
        <h3>📋 Your Message Summary</h3>
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
          <span class="detail-value">${new Date().toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Message:</span>
          <span class="detail-value">${data.message}</span>
        </div>
      </div>
      
      <div class="reference-highlight">
        <p style="margin: 0; color: #1d4ed8; font-weight: 600;">Your Reference ID</p>
        <p class="reference-id">${referenceId}</p>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Please keep this for your records</p>
      </div>
      
      <div class="message">
        <p><strong>⏰ Response Time:</strong> We typically respond within 24 hours during business days. For urgent matters, feel free to call us directly.</p>
        
        <p><strong>📞 Need immediate help?</strong> Check out our <a href="https://scan2tap.com/faq" style="color: #2563eb; text-decoration: none;">FAQ section</a> or contact us at <a href="mailto:${this.fromEmail}" style="color: #2563eb; text-decoration: none;">${this.fromEmail}</a></p>
      </div>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        <strong>${this.brandName}</strong><br>
        Making networking effortless with digital business cards<br>
        <a href="https://scan2tap.com" style="color: #2563eb; text-decoration: none;">www.scan2tap.com</a>
      </p>
      
      <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
        This email was sent because you contacted us through our website.<br>
        If you didn't submit this request, please ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
      `;

      const result = await resend.emails.send({
        from: `${this.brandName} <${this.fromEmail}>`,
        to: data.email,
        subject: `Thank you for contacting ${this.brandName} - Ref: ${referenceId}`,
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
        referenceId: referenceId
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
  <title>New Contact Form Submission - ${this.brandName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    /* Reset styles with email client compatibility */
    * { 
      margin: 0 !important; 
      padding: 0 !important; 
      box-sizing: border-box !important; 
    }
    
    /* Dark mode fixes and email client compatibility */
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #f8fafc !important;
      background: #f8fafc !important;
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif !important;
      line-height: 1.6 !important;
      color: #333333 !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      -webkit-text-size-adjust: 100% !important;
      -ms-text-size-adjust: 100% !important;
    }
    
    /* Dark mode overrides */
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #f8fafc !important;
        color: #333333 !important;
      }
      .email-container {
        background-color: #ffffff !important;
        color: #333333 !important;
      }
      .content {
        background-color: #ffffff !important;
        color: #333333 !important;
      }
      .contact-card {
        background-color: #f8fafc !important;
        color: #1e293b !important;
      }
      .contact-name {
        color: #1e293b !important;
      }
      .contact-time {
        color: #64748b !important;
      }
      .alert-header {
        color: #ffffff !important;
      }
      .alert-title {
        color: #ffffff !important;
      }
      .alert-subtitle {
        color: rgba(255,255,255,0.95) !important;
      }
    }
    
    /* Email client specific fixes */
    table {
      border-collapse: collapse !important;
      border-spacing: 0 !important;
    }
    
    img {
      border: 0 !important;
      line-height: 100% !important;
      outline: none !important;
      text-decoration: none !important;
      display: block !important;
    }
    
    .email-container {
      max-width: 600px !important;
      margin: 20px auto !important;
      background-color: #ffffff !important;
      background: #ffffff !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
      border: 1px solid #e2e8f0 !important;
      -webkit-border-radius: 12px !important;
      -moz-border-radius: 12px !important;
    }
    
    .alert-header {
      background-color: #dc2626 !important;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%) !important;
      padding: 50px 40px !important;
      text-align: center !important;
      color: white !important;
      position: relative !important;
      overflow: hidden !important;
    }
    
    /* Simplified alert header effects for better email client support */
    .alert-header::before {
      content: '' !important;
      position: absolute !important;
      top: -100% !important;
      left: -100% !important;
      width: 300% !important;
      height: 300% !important;
      background: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.12) 0%, transparent 50%) !important;
      pointer-events: none !important;
    }
    
    .alert-header::after {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px) !important;
      pointer-events: none !important;
    }
    
    /* Simplified animations that work across email clients */
    @keyframes alertShimmer {
      0%, 100% { opacity: 1 !important; }
      50% { opacity: 0.9 !important; }
    }
    
    .alert-logo-container {
      position: relative !important;
      z-index: 10 !important;
      margin-bottom: 20px !important;
    }
    
    .alert-logo {
      width: 70px !important;
      height: 70px !important;
      background-color: rgba(255,255,255,0.2) !important;
      background: rgba(255,255,255,0.2) !important;
      border-radius: 18px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      border: 2px solid rgba(255,255,255,0.3) !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
      position: relative !important;
      overflow: hidden !important;
      -webkit-border-radius: 18px !important;
      -moz-border-radius: 18px !important;
    }
    
    .alert-logo::before {
      content: '' !important;
      position: absolute !important;
      top: -50% !important;
      left: -50% !important;
      width: 200% !important;
      height: 200% !important;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.08), transparent) !important;
      pointer-events: none !important;
    }
    
    .alert-logo img {
      width: 50px !important;
      height: 50px !important;
      object-fit: contain !important;
      position: relative !important;
      z-index: 2 !important;
      filter: brightness(1.2) contrast(1.1) !important;
      max-width: 50px !important;
      max-height: 50px !important;
    }
    
    .alert-icon {
      font-size: 48px !important;
      margin-bottom: 12px !important;
      position: relative !important;
      z-index: 10 !important;
    }
    
    .alert-title {
      font-family: 'Roboto', Arial, sans-serif !important;
      font-size: 28px !important;
      font-weight: 700 !important;
      margin: 0 !important;
      position: relative !important;
      z-index: 10 !important;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
      letter-spacing: 0.3px !important;
      color: #ffffff !important;
      line-height: 1.2 !important;
    }
    
    .alert-subtitle {
      font-size: 16px !important;
      opacity: 0.95 !important;
      margin-top: 8px !important;
      position: relative !important;
      z-index: 10 !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
      color: rgba(255,255,255,0.95) !important;
      line-height: 1.4 !important;
    }
    
    .content {
      padding: 40px 30px !important;
      background-color: #ffffff !important;
      background: #ffffff !important;
    }
    
    .priority-badge {
      display: inline-block !important;
      background-color: #f59e0b !important;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
      color: white !important;
      padding: 6px 16px !important;
      border-radius: 20px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      margin-bottom: 20px !important;
      -webkit-border-radius: 20px !important;
      -moz-border-radius: 20px !important;
    }
    
    .contact-card {
      background-color: #f8fafc !important;
      background: #f8fafc !important;
      border-radius: 12px !important;
      padding: 24px !important;
      margin: 20px 0 !important;
      border-left: 4px solid #dc2626 !important;
      -webkit-border-radius: 12px !important;
      -moz-border-radius: 12px !important;
    }
    
    .contact-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      margin-bottom: 16px !important;
      flex-wrap: wrap !important;
    }
    
    .contact-name {
      font-size: 20px !important;
      font-weight: 700 !important;
      color: #1e293b !important;
      font-family: 'Roboto', Arial, sans-serif !important;
      line-height: 1.3 !important;
    }
    
    .contact-time {
      font-size: 14px !important;
      color: #64748b !important;
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
      <div class="alert-logo-container">
        <div class="alert-logo">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAACAASURBVHic7N13eBTV+vDx7zO7m0YooSQQCG2xgKKoIIpYULrYO2KhCCKoeLGBFRv2iryCgqh4VUBEQRFRROwVG1hQAQsqRXpLISHtvOfvj4lsJpOdTbJJNhPvz3Xl4syx7Dz9PWdmzpxnBGOMISIismNHuAsQERH/qcGKiGzMjrfQBw8eTI8ePQgEAuEuRUROJO/8lWXOY7HVAGu//Ci1d//H69qjBz9mzgcfhrkCETkhzKp7XKbfQouIbEwNVkRkY2qwIiIbU4MVEdmYGqyIyMbUYEVENqYGKyKyMTVYEZGNqcGKiGxMDVZEZGNqsCIiG1ODFRHZmBqsiMjG1GBFRDamBisisjE1WBGR1HXqQMdXoR/w2XdgWnp9gKAarIhIalpN/0tI8qrBioik7P9+Aw==" alt="Scan2Tap Logo">
        </div>
      </div>
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
        <a href="mailto:${data.email}?subject=Re: ${data.subject} (Ref: ${referenceId})&body=Hi ${data.name},%0D%0A%0D%0AThank you for contacting ${this.brandName}. I'm following up on your inquiry about "${data.subject}".%0D%0A%0D%0A" class="reply-button">
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
      <p><strong>${this.brandName} Customer Service Alert</strong></p>
      <p>This email was automatically generated from the contact form on your website.</p>
      <p>Please respond promptly to maintain high customer satisfaction.</p>
    </div>
  </div>
</body>
</html>
      `;

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
