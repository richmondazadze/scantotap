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
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.brandName}</title>
  
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
    }
    
    .highlight-box {
      background-color: #fef3c7;
      border: 2px solid #f59e0b;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
    }
    
    .success-box {
      background-color: #ecfdf5;
      border: 2px solid #10b981;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
    }
    
    .warning-box {
      background-color: #fef2f2;
      border: 2px solid #ef4444;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
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
    
    .secondary-button {
      display: inline-block;
      background-color: transparent;
      color: #2563eb;
      padding: 12px 30px;
      text-decoration: none;
      border: 2px solid #2563eb;
      border-radius: 6px;
      font-weight: bold;
      margin: 10px 5px;
    }
    
    .secondary-button:hover {
      background-color: #2563eb;
      color: white;
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
    
    /* Typography Helpers */
    h1 { font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 20px; }
    h2 { font-size: 22px; font-weight: bold; color: #1f2937; margin-bottom: 15px; }
    h3 { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    
    p { font-size: 16px; color: #4b5563; margin-bottom: 15px; line-height: 1.6; }
    
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    
    .mb-10 { margin-bottom: 10px; }
    .mb-20 { margin-bottom: 20px; }
    .mb-30 { margin-bottom: 30px; }
    
    /* Status badges */
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .status-success {
      background-color: #d1fae5;
      color: #065f46;
    }
    
    .status-warning {
      background-color: #fef3c7;
      color: #92400e;
    }
    
    .status-error {
      background-color: #fee2e2;
      color: #991b1b;
    }
    
    /* Mobile Responsive */
    @media only screen and (max-width: 600px) {
      body { padding: 10px; }
      .content { padding: 25px 20px; }
      .header { padding: 25px 15px; }
      .logo { font-size: 28px; }
      .greeting { font-size: 20px; }
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      .cta-button, .secondary-button { 
        display: block;
        width: 100%;
        margin: 10px 0;
        box-sizing: border-box;
      }
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
              ${content}
            </div>
            
            <!-- Footer -->
            <div class="footer">
      <div class="footer-text">
        <strong>Scan2Tap</strong><br>
        Making networking effortless with digital business cards
              </div>
      <div class="footer-text">
        <a href="https://scan2tap.vercel.app" class="footer-link">www.scan2tap.vercel.app</a>
              </div>
      <div class="footer-text" style="font-size: 12px; margin-top: 15px;">
        This email was sent from your Scan2Tap account.<br>
        If you have any questions, please contact our support team.
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
          <a href="https://scan2tap.vercel.app/onboarding" class="cta-button">
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
          <a href="https://scan2tap.vercel.app/dashboard/qr" class="secondary-button">
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

  // 4. Upgrade Confirmation Email
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
          <a href="https://scan2tap.vercel.app/dashboard/profile" class="cta-button">
            Explore Pro Features →
          </a>
        </div>
        
        <div class="message">
          <p><strong>What's new for you:</strong></p>
          <p>You now have access to unlimited links, premium card designs, advanced analytics, and priority support. Make the most of your Pro features!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://scan2tap.vercel.app/dashboard/settings" class="secondary-button">
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
          <a href="https://scan2tap.vercel.app/dashboard/settings?section=billing" class="cta-button">
            View Invoice →
          </a>
        </div>
        
        <div class="message">
          <p>Your subscription will automatically renew on <strong>${new Date(data.nextBillingDate).toLocaleDateString()}</strong>. You can manage your billing preferences anytime in your dashboard.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://scan2tap.vercel.app/dashboard/settings" class="secondary-button">
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
          <a href="https://scan2tap.vercel.app/dashboard/settings" class="secondary-button">
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
          <a href="https://scan2tap.vercel.app/dashboard/settings" class="secondary-button">
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