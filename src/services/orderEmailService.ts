export interface OrderEmailData {
  orderNumber: string;
  total?: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  carrier?: string;
  reason?: string; // For cancellations
}

export type OrderEmailType = 
  | 'order-confirmation'
  | 'order-processing' 
  | 'order-shipped'
  | 'order-delivered'
  | 'order-cancelled';

export class OrderEmailService {
  private static apiUrl = '/api/order-emails';

  /**
   * Send an order-related email if user has notifications enabled
   */
  static async sendOrderEmail(
    type: OrderEmailType,
    userId: string,
    orderData: OrderEmailData
  ): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          userId,
          orderData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      return {
        success: true,
        skipped: result.skipped || false,
      };
    } catch (error) {
      console.error('Order email service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(userId: string, orderData: OrderEmailData) {
    return this.sendOrderEmail('order-confirmation', userId, orderData);
  }

  /**
   * Send order processing email
   */
  static async sendOrderProcessing(userId: string, orderData: OrderEmailData) {
    return this.sendOrderEmail('order-processing', userId, orderData);
  }

  /**
   * Send order shipped email
   */
  static async sendOrderShipped(userId: string, orderData: OrderEmailData) {
    return this.sendOrderEmail('order-shipped', userId, orderData);
  }

  /**
   * Send order delivered email
   */
  static async sendOrderDelivered(userId: string, orderData: OrderEmailData) {
    return this.sendOrderEmail('order-delivered', userId, orderData);
  }

  /**
   * Send order cancelled email
   */
  static async sendOrderCancelled(userId: string, orderData: OrderEmailData) {
    return this.sendOrderEmail('order-cancelled', userId, orderData);
  }
}

export default OrderEmailService; 