import emailService, {
  WelcomeEmailData,
  OnboardingCompleteData,
  UsernameClaimedData,
  UpgradeConfirmationData,
  PaymentData,
  PaymentFailedData,
  SubscriptionExpiringData,
  SubscriptionCancelledData,
  DowngradeWarningData
} from '../services/emailService';

// Email trigger functions that can be called from various parts of the app
export class EmailTriggers {
  
  // 1. Welcome Email - triggered after user signup
  static async sendWelcomeEmail(userData: {
    name: string;
    email: string;
    profileUrl?: string;
  }) {
    const emailData: WelcomeEmailData = {
      userName: userData.name,
      userEmail: userData.email,
      profileUrl: userData.profileUrl
    };
    
    return await emailService.sendWelcomeEmail(emailData);
  }

  // 3. Onboarding Complete - triggered when user completes profile setup
  static async sendOnboardingCompleteEmail(userData: {
    name: string;
    email: string;
    username: string;
    profileUrl: string;
    qrCodeUrl?: string;
  }) {
    const emailData: OnboardingCompleteData = {
      userName: userData.name,
      userEmail: userData.email,
      profileUrl: userData.profileUrl,
      qrCodeUrl: userData.qrCodeUrl
    };
    
    return await emailService.sendOnboardingCompleteEmail(emailData);
  }

  // 4. Username Claimed - triggered when user claims a username
  static async sendUsernameClaimedEmail(userData: {
    name: string;
    email: string;
    username: string;
    profileUrl: string;
  }) {
    const emailData: UsernameClaimedData = {
      userName: userData.name,
      userEmail: userData.email,
      username: userData.username,
      profileUrl: userData.profileUrl
    };
    
    return await emailService.sendUsernameClaimedEmail(emailData);
  }

  // 5. Upgrade Confirmation - triggered after successful subscription upgrade
  static async sendUpgradeConfirmationEmail(userData: {
    name: string;
    email: string;
    planType: string;
    billingAmount: string;
    nextBillingDate: string;
  }) {
    const features = this.getPlanFeatures(userData.planType);
    
    const emailData: UpgradeConfirmationData = {
      userName: userData.name,
      userEmail: userData.email,
      planType: userData.planType,
      features,
      billingAmount: userData.billingAmount,
      nextBillingDate: userData.nextBillingDate
    };
    
    return await emailService.sendUpgradeConfirmationEmail(emailData);
  }

  // 6. Payment Success - triggered after successful payment
  static async sendPaymentSuccessEmail(userData: {
    name: string;
    email: string;
    amount: string;
    planType: string;
    invoiceNumber: string;
    paymentDate: string;
    nextBillingDate: string;
  }) {
    const emailData: PaymentData = {
      userName: userData.name,
      userEmail: userData.email,
      amount: userData.amount,
      planType: userData.planType,
      invoiceNumber: userData.invoiceNumber,
      paymentDate: userData.paymentDate,
      nextBillingDate: userData.nextBillingDate
    };
    
    return await emailService.sendPaymentSuccessEmail(emailData);
  }

  // 7. Payment Failed - triggered when payment fails
  static async sendPaymentFailedEmail(userData: {
    name: string;
    email: string;
    planType: string;
    amount: string;
    retryDate: string;
  }) {
    const emailData: PaymentFailedData = {
      userName: userData.name,
      userEmail: userData.email,
      planType: userData.planType,
      amount: userData.amount,
      retryDate: userData.retryDate,
      updatePaymentUrl: `https://scan2tap.com/dashboard/settings?section=billing&action=update`
    };
    
    return await emailService.sendPaymentFailedEmail(emailData);
  }

  // 8. Subscription Expiring - triggered 7 days before expiry
  static async sendSubscriptionExpiringEmail(userData: {
    name: string;
    email: string;
    planType: string;
    expiryDate: string;
    profileViews: number;
    qrScans: number;
    linksClicked: number;
  }) {
    const emailData: SubscriptionExpiringData = {
      userName: userData.name,
      userEmail: userData.email,
      planType: userData.planType,
      expiryDate: userData.expiryDate,
      renewUrl: `https://scan2tap.com/dashboard/settings?section=billing&action=renew`,
      usageSummary: {
        profileViews: userData.profileViews,
        qrScans: userData.qrScans,
        linksClicked: userData.linksClicked
      }
    };
    
    return await emailService.sendSubscriptionExpiringEmail(emailData);
  }

  // 9. Subscription Cancelled - triggered when user cancels subscription
  static async sendSubscriptionCancelledEmail(userData: {
    name: string;
    email: string;
    planType: string;
    cancellationDate: string;
  }) {
    const emailData: SubscriptionCancelledData = {
      userName: userData.name,
      userEmail: userData.email,
      planType: userData.planType,
      cancellationDate: userData.cancellationDate,
      dataRetentionDays: 90, // Standard retention period
      resubscribeUrl: `https://scan2tap.com/dashboard/settings?section=billing&action=upgrade`
    };
    
    return await emailService.sendSubscriptionCancelledEmail(emailData);
  }

  // 10. Downgrade Warning - triggered 3 days before expiry (final warning)
  static async sendDowngradeWarningEmail(userData: {
    name: string;
    email: string;
    expiryDate: string;
    planType: string;
  }) {
    const featuresLosing = this.getPlanFeatures(userData.planType);
    
    const emailData: DowngradeWarningData = {
      userName: userData.name,
      userEmail: userData.email,
      expiryDate: userData.expiryDate,
      featuresLosing,
      renewUrl: `https://scan2tap.com/dashboard/settings?section=billing&action=renew`
    };
    
    return await emailService.sendDowngradeWarningEmail(emailData);
  }

  // Helper function to get plan features
  private static getPlanFeatures(planType: string): string[] {
    const planFeatures: Record<string, string[]> = {
      'Pro Monthly': [
        'Unlimited social links',
        'Premium card designs',
        'Advanced analytics',
        'Priority support',
        'Custom themes',
        'QR code customization',
        'Lead capture forms',
        'Email integration'
      ],
      'Pro Yearly': [
        'Unlimited social links',
        'Premium card designs',
        'Advanced analytics',
        'Priority support',
        'Custom themes',
        'QR code customization',
        'Lead capture forms',
        'Email integration',
        '2 months free (yearly discount)'
      ],
      'Pro': [
        'Unlimited social links',
        'Premium card designs',
        'Advanced analytics',
        'Priority support',
        'Custom themes',
        'QR code customization',
        'Lead capture forms',
        'Email integration'
      ]
    };

    return planFeatures[planType] || planFeatures['Pro'];
  }
}

// Email scheduling utilities for automated emails
export class EmailScheduler {
  
  // Schedule subscription expiry warning (7 days before)
  static scheduleExpiryWarning(userId: string, expiryDate: Date) {
    const warningDate = new Date(expiryDate);
    warningDate.setDate(warningDate.getDate() - 7);
    
    // This would integrate with a job scheduler like cron or a queue system
    console.log(`Scheduling expiry warning for user ${userId} on ${warningDate.toISOString()}`);
    
    // Implementation would depend on your job scheduling system
    // For now, we'll log it for development purposes
  }

  // Schedule final downgrade warning (3 days before)
  static scheduleFinalWarning(userId: string, expiryDate: Date) {
    const finalWarningDate = new Date(expiryDate);
    finalWarningDate.setDate(finalWarningDate.getDate() - 3);
    
    console.log(`Scheduling final warning for user ${userId} on ${finalWarningDate.toISOString()}`);
  }

  // Schedule payment retry notification
  static schedulePaymentRetry(userId: string, retryDate: Date) {
    console.log(`Scheduling payment retry notification for user ${userId} on ${retryDate.toISOString()}`);
  }
}

// Email validation and formatting utilities
export class EmailUtils {
  
  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Format user name for email display
  static formatUserName(name: string): string {
    if (!name || name.trim() === '') return 'User';
    
    // Capitalize first letter of each word
    return name
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Generate profile URL
  static generateProfileUrl(username: string): string {
    return `https://scan2tap.com/${username}`;
  }

  // Generate QR code URL
  static generateQRCodeUrl(username: string): string {
    return `https://scan2tap.com/api/qr/${username}`;
  }

  // Format currency amount
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Format date for email display
  static formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

// Email template testing utilities (for development)
export class EmailTesting {
  
  // Test all email templates with sample data
  static async testAllEmails(testEmail: string) {
    console.log('Testing all email templates...');
    
    const sampleUser = {
      name: 'John Doe',
      email: testEmail,
      username: 'johndoe',
      profileUrl: 'https://scan2tap.com/johndoe'
    };

    try {
      // Test welcome email
      await EmailTriggers.sendWelcomeEmail(sampleUser);
      console.log('✅ Welcome email sent');

      // Test onboarding complete
      await EmailTriggers.sendOnboardingCompleteEmail({
        ...sampleUser,
        qrCodeUrl: 'https://scan2tap.com/api/qr/johndoe'
      });
      console.log('✅ Onboarding complete email sent');

      // Test username claimed
      await EmailTriggers.sendUsernameClaimedEmail(sampleUser);
      console.log('✅ Username claimed email sent');

      // Test upgrade confirmation
      await EmailTriggers.sendUpgradeConfirmationEmail({
        ...sampleUser,
        planType: 'Pro Monthly',
        billingAmount: '$9.99',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      console.log('✅ Upgrade confirmation email sent');

      console.log('🎉 All test emails sent successfully!');
    } catch (error) {
      console.error('❌ Email testing failed:', error);
    }
  }
} 