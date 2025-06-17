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
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${this.brandName}</title>
  
  <!-- Web Font -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      height: 100% !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333333;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: float 6s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }
    
    .logo {
      width: 60px;
      height: 60px;
      background: rgba(255,255,255,0.2);
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
    }
    
    .brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .tagline {
      color: rgba(255,255,255,0.9);
      font-size: 16px;
      margin-top: 8px;
      font-weight: 400;
    }
    
    .content {
      padding: 50px 40px;
      background: #ffffff;
      position: relative;
    }
    
    .content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
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
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
      border: none;
      cursor: pointer;
      margin: 20px 0;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
    }
    
    .secondary-button {
      display: inline-block;
      background: transparent;
      color: #2563eb !important;
      text-decoration: none;
      padding: 12px 24px;
      border: 2px solid #2563eb;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      text-align: center;
      margin: 10px 5px;
    }
    
    .info-card {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      border-left: 4px solid #2563eb;
    }
    
    .info-card h3 {
      color: #1e293b;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    
    .info-card p {
      color: #475569;
      font-size: 14px;
      margin: 0;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }
    
    .stat-item {
      text-align: center;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #2563eb;
      display: block;
    }
    
    .stat-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }
    
    .footer {
      background: #f8fafc;
      padding: 40px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .social-links {
      margin: 20px 0;
    }
    
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      padding: 8px;
      background: #ffffff;
      border-radius: 8px;
      text-decoration: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.6;
    }
    
    .footer-links {
      margin: 16px 0;
    }
    
    .footer-links a {
      color: #2563eb;
      text-decoration: none;
      margin: 0 8px;
      font-size: 14px;
    }
    
    .unsubscribe {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 16px;
    }
    
    .unsubscribe a {
      color: #6b7280;
      text-decoration: underline;
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
      
      .brand-name {
        font-size: 24px;
      }
      
      .content {
        padding: 30px 20px;
      }
      
      .greeting {
        font-size: 20px;
      }
      
      .message {
        font-size: 15px;
      }
      
      .cta-button {
        display: block;
        width: 100%;
        padding: 18px 20px;
        font-size: 16px;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .footer {
        padding: 30px 20px;
      }
      
      .footer-links a {
        display: block;
        margin: 8px 0;
      }
    }
    
    @media only screen and (max-width: 480px) {
      .email-container {
        margin: 5px;
      }
      
      .header {
        padding: 25px 15px;
      }
      
      .content {
        padding: 25px 15px;
      }
      
      .info-card {
        padding: 20px;
      }
    }
  </style>
  
  ${preheader ? `
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${preheader}
  </div>
  ` : ''}
</head>
<body>
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 0; min-height: 100vh;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center">
          <div class="email-container">
            <!-- Header -->
            <div class="header">
              <div class="logo">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 class="brand-name">${this.brandName}</h1>
              <p class="tagline">Your Digital Identity, Simplified</p>
            </div>
            
            <!-- Content -->
            <div class="content">
              ${content}
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div class="social-links">
                <a href="https://twitter.com/scan2tap" style="color: #1da1f2;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com/company/scan2tap" style="color: #0077b5;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a href="https://instagram.com/scan2tap" style="color: #e4405f;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              </div>
              
              <div class="footer-links">
                <a href="https://scan2tap.com/help">Help Center</a>
                <a href="https://scan2tap.com/privacy">Privacy Policy</a>
                <a href="https://scan2tap.com/terms">Terms of Service</a>
              </div>
              
              <p class="footer-text">
                <strong>${this.brandName}</strong><br>
                Making digital networking effortless<br>
                📧 ${this.supportEmail} | 🌐 scan2tap.com
              </p>
              
              <div class="unsubscribe">
                <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
                <a href="{{preferences_url}}">Email Preferences</a>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </table>
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