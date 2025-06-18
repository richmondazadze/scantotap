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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      height: 100% !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333333;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0,0,0,0.15);
    }
    
    .header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 25%, #6366f1 50%, #8b5cf6 75%, #a855f7 100%);
      padding: 50px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -100%;
      left: -100%;
      width: 300%;
      height: 300%;
      background: 
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%),
        linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%);
      animation: shimmer 8s ease-in-out infinite;
    }
    
    .header::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(255,255,255,0.03) 2px,
          rgba(255,255,255,0.03) 4px
        ),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255,255,255,0.03) 2px,
          rgba(255,255,255,0.03) 4px
        );
    }
    
    @keyframes shimmer {
      0%, 100% { transform: translateX(-50%) translateY(-50%) rotate(0deg); opacity: 1; }
      50% { transform: translateX(-45%) translateY(-45%) rotate(180deg); opacity: 0.8; }
    }
    
    .logo-container {
      position: relative;
      z-index: 10;
      margin-bottom: 24px;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      background: rgba(255,255,255,0.25);
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(15px);
      border: 2px solid rgba(255,255,255,0.4);
      box-shadow: 
        0 8px 32px rgba(0,0,0,0.1),
        inset 0 1px 0 rgba(255,255,255,0.4),
        inset 0 -1px 0 rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .logo::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
      transform: rotate(45deg);
      animation: logoShine 4s ease-in-out infinite;
    }
    
    @keyframes logoShine {
      0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
    
    .logo img {
      width: 60px;
      height: 60px;
      object-fit: contain;
      position: relative;
      z-index: 2;
      filter: brightness(1.1) contrast(1.05);
    }
    
    .brand-container {
      position: relative;
      z-index: 10;
    }
    
    .brand-name {
      font-family: 'Roboto', sans-serif;
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      text-shadow: 
        0 2px 4px rgba(0,0,0,0.2),
        0 4px 8px rgba(0,0,0,0.1),
        0 8px 16px rgba(0,0,0,0.05);
      letter-spacing: 0.5px;
      position: relative;
    }
    
    .brand-name::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
      border-radius: 2px;
    }
    
    .tagline {
      color: rgba(255,255,255,0.95);
      font-size: 18px;
      margin-top: 12px;
      font-weight: 400;
      letter-spacing: 0.3px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .content {
      padding: 50px 40px;
      background: #ffffff;
    }
    
    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
      line-height: 1.3;
    }
    
    .message {
      font-size: 16px;
      line-height: 1.8;
      color: #4b5563;
      margin-bottom: 30px;
    }
    
    .summary-card {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      border-left: 4px solid #2563eb;
    }
    
    .summary-card h3 {
      color: #1e293b;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
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
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
      padding: 50px 40px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }
    
    .alert-header::before {
      content: '';
      position: absolute;
      top: -100%;
      left: -100%;
      width: 300%;
      height: 300%;
      background: 
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.12) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 0%, transparent 50%),
        linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%);
      animation: alertShimmer 8s ease-in-out infinite;
    }
    
    .alert-header::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(255,255,255,0.02) 2px,
          rgba(255,255,255,0.02) 4px
        );
    }
    
    @keyframes alertShimmer {
      0%, 100% { transform: translateX(-50%) translateY(-50%) rotate(0deg); opacity: 1; }
      50% { transform: translateX(-45%) translateY(-45%) rotate(180deg); opacity: 0.9; }
    }
    
    .alert-logo-container {
      position: relative;
      z-index: 10;
      margin-bottom: 20px;
    }
    
    .alert-logo {
      width: 70px;
      height: 70px;
      background: rgba(255,255,255,0.2);
      border-radius: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(12px);
      border: 2px solid rgba(255,255,255,0.3);
      box-shadow: 
        0 8px 32px rgba(0,0,0,0.15),
        inset 0 1px 0 rgba(255,255,255,0.3),
        inset 0 -1px 0 rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
    }
    
    .alert-logo::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.08), transparent);
      transform: rotate(45deg);
      animation: alertLogoShine 4s ease-in-out infinite;
    }
    
    @keyframes alertLogoShine {
      0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
    
    .alert-logo img {
      width: 50px;
      height: 50px;
      object-fit: contain;
      position: relative;
      z-index: 2;
      filter: brightness(1.2) contrast(1.1);
    }
    
    .alert-icon {
      font-size: 48px;
      margin-bottom: 12px;
      position: relative;
      z-index: 10;
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .alert-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      position: relative;
      z-index: 10;
      text-shadow: 
        0 2px 4px rgba(0,0,0,0.2),
        0 4px 8px rgba(0,0,0,0.1);
      letter-spacing: 0.3px;
    }
    
    .alert-subtitle {
      font-size: 16px;
      opacity: 0.95;
      margin-top: 8px;
      position: relative;
      z-index: 10;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
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
