import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  profileUrl?: string;
}

export interface OnboardingCompleteData {
  userName: string;
  userEmail: string;
  profileUrl: string;
  qrCodeUrl?: string;
}

export interface UsernameClaimedData {
  userName: string;
  userEmail: string;
  username: string;
  profileUrl: string;
}

export interface UpgradeConfirmationData {
  userName: string;
  userEmail: string;
  planType: string;
  features: string[];
  billingAmount: string;
  nextBillingDate: string;
}

export interface PaymentData {
  userName: string;
  userEmail: string;
  amount: string;
  planType: string;
  invoiceNumber: string;
  paymentDate: string;
  nextBillingDate: string;
}

export interface PaymentFailedData {
  userName: string;
  userEmail: string;
  planType: string;
  amount: string;
  retryDate: string;
  updatePaymentUrl: string;
}

export interface SubscriptionExpiringData {
  userName: string;
  userEmail: string;
  planType: string;
  expiryDate: string;
  renewUrl: string;
  usageSummary: {
    profileViews: number;
    qrScans: number;
    linksClicked: number;
  };
}

export interface SubscriptionCancelledData {
  userName: string;
  userEmail: string;
  planType: string;
  cancellationDate: string;
  dataRetentionDays: number;
  resubscribeUrl: string;
}

export interface DowngradeWarningData {
  userName: string;
  userEmail: string;
  expiryDate: string;
  featuresLosing: string[];
  renewUrl: string;
}

export interface ContactThankYouData {
  userName: string;
  userEmail: string;
  subject: string;
  submittedAt: string;
}

export interface ContactNotificationData {
  userName: string;
  userEmail: string;
  userPhone?: string;
  subject: string;
  message: string;
  submittedAt: string;
  userAgent?: string;
  ipAddress?: string;
}

class EmailService {
  private readonly fromEmail = 'scan2tap@richverseecotech.com';
  private readonly supportEmail = 'scan2tap@richverseecotech.com';
  private readonly brandName = 'Scan2Tap';

  // Base email template with mobile-responsive design
  private getBaseTemplate(content: string, preheader?: string): string {
    return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <title>${this.brandName}</title>
  
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    /* Email Client Reset & Base Styles */
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
      --warning-color: #f59e0b;
      --error-color: #ef4444;
      --info-bg: #eff6ff;
      --info-border: #bfdbfe;
      --info-text: #1e40af;
      --highlight-bg: #fef3c7;
      --highlight-border: #f59e0b;
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
        --warning-color: #fbbf24;
        --error-color: #f87171;
        --info-bg: #1e3a8a;
        --info-border: #3b82f6;
        --info-text: #93c5fd;
        --highlight-bg: #78350f;
        --highlight-border: #f59e0b;
      }
    }
    
    /* Container */
    .email-container {
      max-width: 600px; margin: 0 auto;
      background: var(--primary-bg);
      border-radius: 20px; overflow: hidden;
      box-shadow: 0 20px 40px var(--card-shadow);
      border: 1px solid var(--border-color);
    }
    
    /* Header */
    .header {
      background: var(--header-bg);
      padding: 50px 30px; text-align: center; position: relative;
      border-bottom: 3px solid var(--accent-color);
    }
    .header::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
    }
    
    /* Modern Logo */
    .logo-container { position: relative; z-index: 10; margin-bottom: 24px; }
    .logo {
      display: inline-block; padding: 24px 40px; 
      background: rgba(255,255,255,0.12); border-radius: 20px;
      border: 2px solid rgba(255,255,255,0.2);
      font-family: 'Inter', sans-serif; font-size: 42px; font-weight: 900;
      letter-spacing: 4px; text-transform: uppercase; margin-bottom: 16px;
      box-shadow: 
        0 8px 32px rgba(0,0,0,0.3), 
        inset 0 2px 0 rgba(255,255,255,0.4),
        inset 0 -2px 0 rgba(0,0,0,0.1);
      backdrop-filter: blur(16px);
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
    
    .tagline {
      color: rgba(255,255,255,0.95); font-size: 18px; font-weight: 400;
      margin: 16px 0 0 0; opacity: 0.95; text-align: center;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    
    /* Content */
    .content {
      padding: 40px; background: var(--card-bg);
      color: var(--text-primary);
    }
    
    /* Typography */
    h1, h2, h3 { color: var(--text-primary); margin-bottom: 16px; }
    h1 { font-size: 32px; font-weight: 800; }
    h2 { font-size: 24px; font-weight: 700; }
    h3 { font-size: 20px; font-weight: 600; }
    
    p { 
      color: var(--text-secondary); line-height: 1.6; 
      margin-bottom: 16px; font-size: 16px; 
    }
    
    /* Cards & Sections */
    .card {
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px; padding: 24px; margin: 24px 0;
    }
    
    .info-box {
      background: var(--info-bg);
      border: 2px solid var(--info-border);
      border-radius: 12px; padding: 24px; margin: 24px 0;
      color: var(--info-text);
    }
    
    .highlight-box {
      background: var(--highlight-bg);
      border: 2px solid var(--highlight-border);
      border-radius: 12px; padding: 20px; margin: 20px 0;
    }
    
    /* Buttons */
    .btn {
      display: inline-block; padding: 14px 28px;
      border-radius: 10px; text-decoration: none;
      font-weight: 600; font-size: 16px; text-align: center;
      transition: all 0.3s ease; margin: 8px 4px;
    }
    
    .btn-primary {
      background: var(--accent-color); color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .btn-primary:hover {
      background: #2563eb;
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
      transform: translateY(-2px);
    }
    
    .btn-secondary {
      background: var(--secondary-bg); color: var(--text-primary);
      border: 2px solid var(--border-color);
    }
    .btn-secondary:hover {
      background: var(--border-color);
    }
    
    /* Status Indicators */
    .status {
      display: inline-block; padding: 6px 12px;
      border-radius: 20px; font-size: 14px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    
    .status-success {
      background: rgba(16, 185, 129, 0.1);
      color: var(--success-color);
      border: 1px solid var(--success-color);
    }
    
    .status-warning {
      background: rgba(245, 158, 11, 0.1);
      color: var(--warning-color);
      border: 1px solid var(--warning-color);
    }
    
    .status-error {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error-color);
      border: 1px solid var(--error-color);
    }
    
    /* Lists */
    ul, ol {
      padding-left: 20px; margin: 16px 0;
      color: var(--text-secondary);
    }
    li { margin-bottom: 8px; line-height: 1.5; }
    
    /* Tables */
    table {
      width: 100%; border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px; text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    th {
      background: var(--secondary-bg);
      color: var(--text-primary);
      font-weight: 600;
    }
    td { color: var(--text-secondary); }
    
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
    .footer-links a {
      color: var(--accent-color); text-decoration: none;
      margin: 0 12px; font-weight: 500;
    }
    .footer-links a:hover {
      color: #2563eb;
    }
    
    /* Mobile Responsive */
    @media only screen and (max-width: 600px) {
      .email-container { margin: 10px; border-radius: 16px; }
      .header { padding: 40px 20px; }
      .content { padding: 24px 20px; }
      .logo { font-size: 36px; padding: 20px 28px; }
      h1 { font-size: 28px; }
      h2 { font-size: 22px; }
      p { font-size: 15px; }
      .card, .info-box { padding: 20px; margin: 20px 0; }
      .footer { padding: 24px 16px; }
      .btn { padding: 12px 24px; font-size: 15px; }
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
            <p class="tagline">Digital Business Cards Reimagined</p>
          </div>
      </div>
      
      <!-- Content -->
      <div class="content">
        ${content}
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <div class="footer-brand">Scan2Tap</div>
        <div class="footer-tagline">Making networking effortless with digital business cards</div>
        <a href="https://scan2tap.com" class="footer-link">www.scan2tap.com</a>
        
        <div class="footer-note">
          This email was sent to you because you have an account with ${this.brandName}.<br>
          If you have any questions, please contact us at ${this.supportEmail}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  // 1. Welcome Email
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      const content = `
        <h2 class="greeting">Welcome to ${this.brandName}, ${data.userName}! 🎉</h2>
        
        <div class="message">
          <p>We're thrilled to have you join our community of professionals who are revolutionizing the way they network and share their digital presence.</p>
          
          <p>With ${this.brandName}, you're just a few steps away from creating your stunning digital business card that will make lasting impressions wherever you go.</p>
        </div>
        
        <div class="info-card">
          <h3>🚀 What's Next?</h3>
          <p>Complete your profile setup to unlock the full power of your digital identity. Add your photo, bio, social links, and customize your unique URL.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://scan2tap.com/onboarding" class="cta-button">
            Complete Your Profile →
          </a>
        </div>
        
        <div class="message">
          <p><strong>Need help getting started?</strong> Our support team is here to help you every step of the way. Feel free to reach out at ${this.supportEmail}.</p>
        </div>
      `;

      const result = await resend.emails.send({
        from: `${this.brandName} <${this.fromEmail}>`,
        to: data.userEmail,
        subject: `Welcome to ${this.brandName}! Let's get you started 🚀`,
        html: this.getBaseTemplate(content, "Welcome to Scan2Tap! Complete your digital profile in minutes."),
      });

      return !!result.data;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  // 3. Onboarding Completion Email
  async sendOnboardingCompleteEmail(data: OnboardingCompleteData): Promise<boolean> {
    try {
      const content = `
        <h2 class="greeting">🎉 Congratulations, ${data.userName}!</h2>
        
        <div class="message">
          <p>Your digital business card is now live and ready to make an amazing first impression! You've successfully created a professional digital presence that you can share instantly with anyone, anywhere.</p>
        </div>
        
        <div class="info-card">
          <h3>✨ Your Profile is Live!</h3>
          <p><strong>Your unique URL:</strong> <a href="${data.profileUrl}" style="color: #2563eb; font-weight: 600;">${data.profileUrl}</a></p>
          <p>Share this link or use your QR code to connect with others instantly.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.profileUrl}" class="cta-button">
            View Your Profile →
          </a>
          <a href="https://scan2tap.com/dashboard/qr" class="secondary-button">
            Get QR Code
          </a>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">∞</span>
            <span class="stat-label">Connections Possible</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">24/7</span>
            <span class="stat-label">Always Available</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">100%</span>
            <span class="stat-label">Professional</span>
          </div>
        </div>
        
        <div class="message">
          <p><strong>Pro Tip:</strong> Download your QR code and add it to your email signature, business cards, or social media profiles for maximum reach!</p>
        </div>
      `;

      const result = await resend.emails.send({
        from: `${this.brandName} <${this.fromEmail}>`,
        to: data.userEmail,
        subject: `🎉 Your digital business card is live!`,
        html: this.getBaseTemplate(content, "Your Scan2Tap profile is ready! Start sharing your digital business card."),
      });

      return !!result.data;
    } catch (error) {
      console.error('Failed to send onboarding complete email:', error);
      return false;
    }
  }

  // 4. Username Claimed Email
  async sendUsernameClaimedEmail(data: UsernameClaimedData): Promise<boolean> {
    try {
      const content = `
        <h2 class="greeting">🎯 Your Digital Identity is Ready, ${data.userName}!</h2>
        
        <div class="message">
          <p>Fantastic news! Your unique username <strong>${data.username}</strong> has been successfully claimed and your digital business card is now live at your personalized URL.</p>
        </div>
        
        <div class="info-card">
          <h3>🌟 Your Unique Digital Address</h3>
          <p><strong>scan2tap.com/${data.username}</strong></p>
          <p>This is your permanent digital address that you can share with confidence. It's professional, memorable, and uniquely yours!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.profileUrl}" class="cta-button">
            Visit Your Profile →
          </a>
        </div>
        
        <div class="message">
          <p><strong>Start sharing your digital presence:</strong></p>
          <ul style="margin: 16px 0; padding-left: 20px; color: #4b5563;">
            <li>Add it to your email signature</li>
            <li>Share it on social media</li>
            <li>Include it in your resume or CV</li>
            <li>Use it on your business cards</li>
            <li>Add it to your LinkedIn profile</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://scan2tap.com/dashboard/qr" class="secondary-button">
            Download QR Code
          </a>
          <a href="https://scan2tap.com/dashboard/profile" class="secondary-button">
            Customize Profile
          </a>
        </div>
      `;

      const result = await resend.emails.send({
        from: `${this.brandName} <${this.fromEmail}>`,
        to: data.userEmail,
        subject: `🎯 ${data.username} is yours! Your digital identity is ready`,
        html: this.getBaseTemplate(content, `Your username ${data.username} is claimed! Start sharing your digital business card.`),
      });

      return !!result.data;
    } catch (error) {
      console.error('Failed to send username claimed email:', error);
      return false;
    }
  }

  // 5. Upgrade Confirmation Email
  async sendUpgradeConfirmationEmail(data: UpgradeConfirmationData): Promise<boolean> {
    try {
      const featuresHtml = data.features.map(feature => `<li style="margin: 8px 0; color: #059669;">✓ ${feature}</li>`).join('');
      
      const content = `
        <h2 class="greeting">🚀 Welcome to ${this.brandName} Pro, ${data.userName}!</h2>
        
        <div class="message">
          <p>Congratulations! You've successfully upgraded to <strong>${data.planType}</strong> and unlocked the full potential of your digital networking experience.</p>
        </div>
        
        <div class="info-card">
          <h3>💎 Your Pro Features Are Now Active</h3>
          <ul style="margin: 16px 0; padding-left: 0; list-style: none;">
            ${featuresHtml}
          </ul>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">${data.billingAmount}</span>
            <span class="stat-label">Plan Cost</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${new Date(data.nextBillingDate).toLocaleDateString()}</span>
            <span class="stat-label">Next Billing</span>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://scan2tap.com/dashboard/profile" class="cta-button">
            Explore Pro Features →
          </a>
        </div>
        
        <div class="message">
          <p><strong>What's new for you:</strong></p>
          <p>You now have access to unlimited links, premium card designs, advanced analytics, and priority support. Make the most of your Pro features!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://scan2tap.com/dashboard/settings" class="secondary-button">
            Manage Subscription
          </a>
        </div>
      `;

      const result = await resend.emails.send({
        from: `${this.brandName} <${this.fromEmail}>`,
        to: data.userEmail,
        subject: `🚀 Welcome to ${this.brandName} Pro! Your upgrade is complete`,
        html: this.getBaseTemplate(content, `Welcome to Scan2Tap Pro! All premium features are now unlocked for you.`),
      });

      return !!result.data;
    } catch (error) {
      console.error('Failed to send upgrade confirmation email:', error);
      return false;
    }
  }

  // 6. Payment Success Email
  async sendPaymentSuccessEmail(data: PaymentData): Promise<boolean> {
    try {
      const content = `
        <h2 class="greeting">✅ Payment Received, ${data.userName}!</h2>
        
        <div class="message">
          <p>Thank you for your payment! Your ${data.planType} subscription has been successfully renewed and you can continue enjoying all the premium features.</p>
        </div>
        
        <div class="info-card">
          <h3>📄 Payment Details</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;">
            <div>
              <p style="margin: 4px 0;"><strong>Invoice:</strong> ${data.invoiceNumber}</p>
              <p style="margin: 4px 0;"><strong>Amount:</strong> ${data.amount}</p>
            </div>
            <div>
              <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(data.paymentDate).toLocaleDateString()}</p>
              <p style="margin: 4px 0;"><strong>Next Billing:</strong> ${new Date(data.nextBillingDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://scan2tap.com/dashboard/settings?section=billing" class="cta-button">
            View Invoice →
          </a>
        </div>
        
        <div class="message">
          <p>Your subscription will automatically renew on <strong>${new Date(data.nextBillingDate).toLocaleDateString()}</strong>. You can manage your billing preferences anytime in your dashboard.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://scan2tap.com/dashboard/settings" class="secondary-button">
            Manage Subscription
          </a>
        </div>
      `;

      const result = await resend.emails.send({
        from: `${this.brandName} <${this.fromEmail}>`,
        to: data.userEmail,
        subject: `✅ Payment confirmed - Invoice ${data.invoiceNumber}`,
        html: this.getBaseTemplate(content, `Payment received! Your ${data.planType} subscription is active.`),
      });

      return !!result.data;
    } catch (error) {
      console.error('Failed to send payment success email:', error);
      return false;
    }
  }

  // 7. Payment Failed Email
  async sendPaymentFailedEmail(data: PaymentFailedData): Promise<boolean> {
    try {
      const content = `
        <h2 class="greeting">⚠️ Payment Issue - Action Required</h2>
        
        <div class="message">
          <p>Hi ${data.userName},</p>
          <p>We encountered an issue processing your payment for your ${data.planType} subscription (${data.amount}). Don't worry - your account is still active and we'll retry the payment automatically.</p>
        </div>
        
        <div class="info-card" style="border-left-color: #f59e0b; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);">
          <h3>🔄 What Happens Next?</h3>
          <p>We'll automatically retry your payment on <strong>${new Date(data.retryDate).toLocaleDateString()}</strong>. To avoid any service interruption, please update your payment method if needed.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.updatePaymentUrl}" class="cta-button">
            Update Payment Method →
          </a>
        </div>
        
        <div class="message">
          <p><strong>Common reasons for payment failures:</strong></p>
          <ul style="margin: 16px 0; padding-left: 20px; color: #4b5563;">
            <li>Expired credit card</li>
            <li>Insufficient funds</li>
            <li>Card blocked by bank</li>
            <li>Billing address mismatch</li>
          </ul>
        </div>
        
        <div class="message">
          <p>If you continue to experience issues, please don't hesitate to contact our support team at ${this.supportEmail}. We're here to help!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:${this.supportEmail}" class="secondary-button">
            Contact Support
          </a>
        </div>
      `;

      const result = await resend.emails.send({
        from: `${this.brandName} <${this.fromEmail}>`,
        to: data.userEmail,
        subject: `⚠️ Payment failed - Please update your payment method`,
        html: this.getBaseTemplate(content, `Payment issue detected. Update your payment method to continue your subscription.`),
      });

      return !!result.data;
    } catch (error) {
      console.error('Failed to send payment failed email:', error);
      return false;
    }
  }

  // 8. Subscription Expiring Email
  async sendSubscriptionExpiringEmail(data: SubscriptionExpiringData): Promise<boolean> {
    try {
      const content = `
        <h2 class="greeting">⏰ Your ${data.planType} Plan Expires Soon</h2>
        
        <div class="message">
          <p>Hi ${data.userName},</p>
          <p>Your ${data.planType} subscription will expire on <strong>${new Date(data.expiryDate).toLocaleDateString()}</strong>. Renew now to continue enjoying all the premium features without interruption.</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">${data.usageSummary.profileViews.toLocaleString()}</span>
            <span class="stat-label">Profile Views</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${data.usageSummary.qrScans.toLocaleString()}</span>
            <span class="stat-label">QR Code Scans</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${data.usageSummary.linksClicked.toLocaleString()}</span>
            <span class="stat-label">Links Clicked</span>
          </div>
        </div>
        
        <div class="info-card">
          <h3>🎯 Your Impact So Far</h3>
          <p>Look at the amazing connections you've made! Your digital presence has been viewed <strong>${data.usageSummary.profileViews.toLocaleString()} times</strong> and generated <strong>${data.usageSummary.qrScans.toLocaleString()} QR scans</strong>. Keep the momentum going!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.renewUrl}" class="cta-button">
            Renew Subscription →
          </a>
        </div>
        
        <div class="message">
          <p><strong>Don't lose access to:</strong></p>
          <ul style="margin: 16px 0; padding-left: 20px; color: #4b5563;">
            <li>Unlimited social links</li>
            <li>Premium card designs</li>
            <li>Advanced analytics</li>
            <li>Priority support</li>
            <li>Custom themes</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://scan2tap.com/dashboard/settings" class="secondary-button">
            Manage Subscription
          </a>
        </div>
      `;

      const result = await resend.emails.send({
        from: `${this.brandName} <${this.fromEmail}>`,
        to: data.userEmail,
        subject: `⏰ Your ${data.planType} subscription expires in 7 days`,
        html: this.getBaseTemplate(content, `Your subscription expires soon! Renew to keep all premium features.`),
      });

      return !!result.data;
    } catch (error) {
      console.error('Failed to send subscription expiring email:', error);
      return false;
    }
  }

  // 9. Subscription Cancelled Email
  async sendSubscriptionCancelledEmail(data: SubscriptionCancelledData): Promise<boolean> {
    try {
      const content = `
        <h2 class="greeting">😔 Sorry to See You Go, ${data.userName}</h2>
        
        <div class="message">
          <p>Your ${data.planType} subscription has been successfully cancelled as of ${new Date(data.cancellationDate).toLocaleDateString()}. While we're sad to see you go, we understand that needs change.</p>
        </div>
        
        <div class="info-card">
          <h3>📋 What Happens Next?</h3>
          <p>Your account will remain active with free plan features. Your data will be securely stored for <strong>${data.dataRetentionDays} days</strong> in case you decide to return.</p>
        </div>
        
        <div class="message">
          <p><strong>You'll still have access to:</strong></p>
          <ul style="margin: 16px 0; padding-left: 20px; color: #059669;">
            <li>Your basic digital business card</li>
            <li>Up to 7 social links</li>
            <li>QR code generation</li>
            <li>Basic analytics</li>
          </ul>
        </div>
        
        <div class="message">
          <p><strong>We'd love your feedback:</strong> What could we have done better? Your insights help us improve for everyone.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:${this.supportEmail}?subject=Feedback on my cancellation" class="cta-button">
            Share Feedback →
          </a>
        </div>
        
        <div class="message">
          <p>Changed your mind? You can reactivate your subscription anytime and pick up right where you left off.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resubscribeUrl}" class="secondary-button">
            Reactivate Subscription
          </a>
        </div>
      `;

      const result = await resend.emails.send({
        from: `${this.brandName} <${this.fromEmail}>`,
        to: data.userEmail,
        subject: `Subscription cancelled - We'll miss you! 😔`,
        html: this.getBaseTemplate(content, `Your subscription has been cancelled. Your data is safe and you can return anytime.`),
      });

      return !!result.data;
    } catch (error) {
      console.error('Failed to send subscription cancelled email:', error);
      return false;
    }
  }

  // 10. Downgrade Warning Email
  async sendDowngradeWarningEmail(data: DowngradeWarningData): Promise<boolean> {
    try {
      const featuresHtml = data.featuresLosing.map(feature => `<li style="margin: 8px 0; color: #dc2626;">✗ ${feature}</li>`).join('');
      
      const content = `
        <h2 class="greeting">⚠️ Last Chance to Keep Your Pro Features</h2>
        
        <div class="message">
          <p>Hi ${data.userName},</p>
          <p>Your Pro subscription expires on <strong>${new Date(data.expiryDate).toLocaleDateString()}</strong>. This is your final reminder to renew and keep all the premium features you've been enjoying.</p>
        </div>
        
        <div class="info-card" style="border-left-color: #dc2626; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);">
          <h3>❌ Features You'll Lose After Expiry</h3>
          <ul style="margin: 16px 0; padding-left: 0; list-style: none;">
            ${featuresHtml}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.renewUrl}" class="cta-button">
            Renew Now - Keep Everything →
          </a>
        </div>
        
        <div class="message">
          <p><strong>Don't let your progress stop here!</strong> You've built an amazing digital presence. Keep all your hard work and continue growing your network with Pro features.</p>
        </div>
        
        <div class="message">
          <p>After expiry, you'll be moved to our free plan with basic features. You can always upgrade again later, but why interrupt your momentum?</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://scan2tap.com/dashboard/settings" class="secondary-button">
            Manage Subscription
          </a>
          <a href="mailto:${this.supportEmail}" class="secondary-button">
            Need Help?
          </a>
        </div>
      `;

      const result = await resend.emails.send({
        from: `${this.brandName} <${this.fromEmail}>`,
        to: data.userEmail,
        subject: `⚠️ Final reminder: Your Pro features expire soon`,
        html: this.getBaseTemplate(content, `Last chance to renew! Keep all your Pro features and continue growing.`),
      });

      return !!result.data;
    } catch (error) {
      console.error('Failed to send downgrade warning email:', error);
      return false;
    }
  }
}

export default new EmailService(); 