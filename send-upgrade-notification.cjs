/**
 * SCAN2TAP Upgrade Notification Email Sender
 * 
 * This script sends upgrade notification emails to existing users
 * informing them about the database upgrade and data deletion.
 * 
 * Usage:
 * 1. Update the USER_EMAILS array with the target email addresses
 * 2. Optionally set the UPGRADE_DATE
 * 3. Run: node send-upgrade-notification.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const USER_EMAILS = [
  



];

// Optional: Set the upgrade date (leave null if not known yet)
const UPGRADE_DATE = null; // e.g., 'January 25, 2025 at 2:00 PM UTC'

// API Configuration
const API_BASE_URL = 'https://scan2tap.vercel.app'; // Update this to your API URL
const API_ENDPOINT = '/api/upgrade-notification';

async function sendUpgradeNotifications() {
  try {
    console.log('🚀 Starting upgrade notification email process...');
    console.log(`📧 Sending to ${USER_EMAILS.length} recipients`);
    
    if (USER_EMAILS.length === 0) {
      console.error('❌ No email addresses provided. Please update the USER_EMAILS array.');
      return;
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emails: USER_EMAILS,
        upgradeDate: UPGRADE_DATE,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Email sending completed successfully!');
      console.log(`📬 Total sent: ${result.totalSent}`);
      console.log(`❌ Total failed: ${result.totalFailed}`);
      
      if (result.results && result.results.length > 0) {
        console.log('\n📋 Successful sends:');
        result.results.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.email} (ID: ${item.id})`);
        });
      }
      
      if (result.errors && result.errors.length > 0) {
        console.log('\n⚠️  Failed sends:');
        result.errors.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.email} - Error: ${item.error}`);
        });
      }
    } else {
      console.error('❌ Failed to send emails:', result.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Network or server error:', error.message);
    console.error('💡 Make sure your API server is running and the URL is correct');
  }
}

// Auto-run the function
sendUpgradeNotifications();

// Alternative function for browser environment
async function sendUpgradeNotificationsBrowser() {
  try {
    console.log('🚀 Starting upgrade notification email process...');
    console.log(`📧 Sending to ${USER_EMAILS.length} recipients`);
    
    if (USER_EMAILS.length === 0) {
      console.error('❌ No email addresses provided. Please update the USER_EMAILS array.');
      return;
    }

    const response = await fetch(`${API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emails: USER_EMAILS,
        upgradeDate: UPGRADE_DATE,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Email sending completed successfully!');
      console.log(`📬 Total sent: ${result.totalSent}`);
      console.log(`❌ Total failed: ${result.totalFailed}`);
      
      return result;
    } else {
      console.error('❌ Failed to send emails:', result.error || 'Unknown error');
      throw new Error(result.error || 'Failed to send emails');
    }
  } catch (error) {
    console.error('❌ Network or server error:', error.message);
    throw error;
  }
}

// For React/Frontend usage as a service
class UpgradeNotificationService {
  constructor(apiBaseUrl = '') {
    this.apiBaseUrl = apiBaseUrl;
    this.endpoint = '/api/upgrade-notification';
  }

  async sendNotifications(emails, upgradeDate = null) {
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new Error('Please provide a valid array of email addresses');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails,
          upgradeDate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send emails');
      }

      return result;
    } catch (error) {
      console.error('Error sending upgrade notifications:', error);
      throw error;
    }
  }

  async sendSingleNotification(email, upgradeDate = null) {
    return this.sendNotifications([email], upgradeDate);
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    sendUpgradeNotifications,
    UpgradeNotificationService,
    USER_EMAILS,
    UPGRADE_DATE,
  };
  
  // Auto-run if this file is executed directly
  if (require.main === module) {
    sendUpgradeNotifications();
  }
} else if (typeof window !== 'undefined') {
  // Browser environment
  window.sendUpgradeNotificationsBrowser = sendUpgradeNotificationsBrowser;
  window.UpgradeNotificationService = UpgradeNotificationService;
}

/* 
 * USAGE EXAMPLES:
 * 
 * 1. Node.js Command Line:
 *    node send-upgrade-notification.js
 * 
 * 2. Browser Console:
 *    sendUpgradeNotificationsBrowser()
 * 
 * 3. React Component:
 *    import { UpgradeNotificationService } from './send-upgrade-notification.js';
 *    const service = new UpgradeNotificationService();
 *    const result = await service.sendNotifications(['user@example.com']);
 * 
 * 4. With custom upgrade date:
 *    const result = await service.sendNotifications(
 *      ['user@example.com'], 
 *      'January 25, 2025 at 2:00 PM UTC'
 *    );
 */ 