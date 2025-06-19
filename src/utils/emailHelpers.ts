// Email services now handled by backend API to avoid CORS issues

// Email utility functions
export class EmailUtils {
  static generateProfileUrl(username: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://scan2tap.com';
    return `${baseUrl}/${username}`;
  }

  static generateDashboardUrl(): string {
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://scan2tap.com';
    return `${baseUrl}/dashboard`;
  }
}

// Email trigger class for sending various email types
export class EmailTriggers {
  private static apiUrl = '/api/emails';

  private static async sendEmail(type: string, to: string, data: any): Promise<boolean> {
    try {
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

  static async sendUsernameClaimedEmail(userEmail: string, userName: string, username: string): Promise<boolean> {
    const profileUrl = EmailUtils.generateProfileUrl(username);
    
    return this.sendEmail('username-claimed', userEmail, {
      userName,
      profileUrl
    });
  }

  // Note: Other email types (upgrade, payment, subscription) are handled by existing services
  // These three main types are moved to backend API to fix CORS issues
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

      // Test username claimed
      await EmailTriggers.sendUsernameClaimedEmail(sampleUser.email, sampleUser.name, sampleUser.username);
      console.log('✅ Username claimed email sent');

      console.log('🎉 All email tests completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Email testing failed:', error);
      return false;
    }
  }
} 