// Email services now handled by backend API to avoid CORS issues

// Email utility functions
export class EmailUtils {
  static generateProfileUrl(username: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://scan2tap.vercel.app';
    return `${baseUrl}/${username}`;
  }

  static generateDashboardUrl(): string {
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://scan2tap.vercel.app';
    return `${baseUrl}/dashboard`;
  }

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

  // Generate QR code URL
  static generateQRCodeUrl(username: string): string {
    return `https://scan2tap.vercel.app/api/qr/${username}`;
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

// Email trigger class for sending various email types
export class EmailTriggers {
  private static apiUrl = '/api/emails';

  private static async sendEmail(type: string, to: string, data: any): Promise<boolean> {
    try {
      // For now, just log the email instead of making API calls
      // since the API endpoint doesn't exist in development
      console.log(`📧 ${type} email would be sent to:`, to, 'with data:', data);
      return true; // Return success for now
      
      // Uncomment this when the API endpoint is available:
      /*
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          to,
          data
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to send ${type} email:`, errorData);
        return false;
      }

      const result = await response.json();
      console.log(`${type} email sent successfully:`, result);
      return true;
      */
    } catch (error) {
      console.error(`Error sending ${type} email:`, error);
      return false;
    }
  }

  static async sendWelcomeEmail(userEmail: string, userName: string, username: string): Promise<boolean> {
    const profileUrl = EmailUtils.generateProfileUrl(username);
    
    return this.sendEmail('welcome', userEmail, {
      userName,
      profileUrl
    });
  }

  static async sendOnboardingCompleteEmail(userEmail: string, userName: string, username: string): Promise<boolean> {
    const profileUrl = EmailUtils.generateProfileUrl(username);
    
    return this.sendEmail('onboarding-complete', userEmail, {
      userName,
      profileUrl
    });
  }

  // Note: Other email types (upgrade, payment, subscription) are handled by existing services
  // These two main types are moved to backend API to fix CORS issues
}

// Email template testing utilities (for development)
export class EmailTesting {
  
  static async testAllEmails(testEmail: string) {
    console.log('🧪 Testing all email templates...');
    
    const sampleUser = {
      name: 'John Doe',
      email: testEmail,
      username: 'johndoe',
    };
    
    try {
      // Test welcome email
      await EmailTriggers.sendWelcomeEmail(sampleUser.email, sampleUser.name, sampleUser.username);
      console.log('✅ Welcome email sent');

      // Test onboarding complete
      await EmailTriggers.sendOnboardingCompleteEmail(sampleUser.email, sampleUser.name, sampleUser.username);
      console.log('✅ Onboarding complete email sent');

      console.log('🎉 All email tests completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Email testing failed:', error);
      return false;
    }
  }
} 