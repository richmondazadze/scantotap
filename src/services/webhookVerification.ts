import crypto from 'crypto';

export class WebhookVerification {
  /**
   * Verify Paystack webhook signature according to their documentation
   * @param payload - Raw webhook payload as string
   * @param signature - X-Paystack-Signature header value
   * @param secret - Your Paystack webhook secret
   * @returns boolean indicating if signature is valid
   */
  static verifyPaystackSignature(payload: string, signature: string, secret: string): boolean {
    try {
      // Paystack uses HMAC SHA512
      const hash = crypto
        .createHmac('sha512', secret)
        .update(payload, 'utf8')
        .digest('hex');

      // Compare signatures using constant-time comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(hash, 'hex')
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Extract and validate webhook event data
   * @param payload - Raw webhook payload
   * @returns Parsed webhook event or null if invalid
   */
  static parseWebhookPayload(payload: string): any | null {
    try {
      const event = JSON.parse(payload);
      
      // Basic validation of required fields
      if (!event.event || !event.data) {
        console.error('Invalid webhook payload: missing event or data');
        return null;
      }

      return event;
    } catch (error) {
      console.error('Error parsing webhook payload:', error);
      return null;
    }
  }

  /**
   * Validate webhook event structure according to Paystack documentation
   * @param event - Parsed webhook event
   * @returns boolean indicating if event structure is valid
   */
  static validateEventStructure(event: any): boolean {
    // Check for required top-level fields
    if (!event.event || typeof event.event !== 'string') {
      return false;
    }

    if (!event.data || typeof event.data !== 'object') {
      return false;
    }

    // Validate based on event type
    switch (event.event) {
      case 'charge.success':
        return this.validateChargeEvent(event.data);
      
      case 'subscription.create':
      case 'subscription.disable':
      case 'subscription.not_renew':
        return this.validateSubscriptionEvent(event.data);
      
      case 'invoice.create':
      case 'invoice.update':
      case 'invoice.payment_failed':
        return this.validateInvoiceEvent(event.data);
      
      default:
        // For unknown events, just check basic structure
        return true;
    }
  }

  private static validateChargeEvent(data: any): boolean {
    return !!(
      data.reference &&
      data.amount &&
      data.currency &&
      data.status &&
      data.customer &&
      data.customer.email
    );
  }

  private static validateSubscriptionEvent(data: any): boolean {
    return !!(
      data.customer &&
      data.customer.email &&
      (data.subscription || data.plan)
    );
  }

  private static validateInvoiceEvent(data: any): boolean {
    return !!(
      data.customer &&
      data.customer.email &&
      data.amount
    );
  }
} 