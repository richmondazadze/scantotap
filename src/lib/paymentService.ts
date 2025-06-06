import { toast } from 'sonner';

export interface PaymentData {
  email: string;
  amount: number; // Amount in pesewas (smallest currency unit for GHS)
  currency: string;
  reference: string;
  orderId: string;
  customerName: string;
  phone?: string;
}

export interface PaymentResponse {
  success: boolean;
  reference?: string;
  message?: string;
  error?: string;
}

// Paystack configuration
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string;

// Initialize Paystack
const initializePaystack = () => {
  if (typeof window !== 'undefined' && !window.PaystackPop) {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.head.appendChild(script);
    return new Promise((resolve) => {
      script.onload = resolve;
    });
  }
  return Promise.resolve();
};

export const paymentService = {
  // Initialize payment with Paystack
  async processPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      // Ensure Paystack is loaded
      await initializePaystack();

      if (!window.PaystackPop) {
        throw new Error('Paystack could not be loaded');
      }

      if (!PAYSTACK_PUBLIC_KEY) {
        throw new Error('Paystack public key not configured');
      }

      return new Promise((resolve) => {
        const paystackHandler = window.PaystackPop.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email: paymentData.email,
          amount: paymentData.amount,
          currency: paymentData.currency,
          ref: paymentData.reference,
          metadata: {
            order_id: paymentData.orderId,
            customer_name: paymentData.customerName,
            phone: paymentData.phone || '',
          },
          callback: function(response: any) {
            // Payment successful
            resolve({
              success: true,
              reference: response.reference,
              message: 'Payment completed successfully'
            });
          },
          onClose: function() {
            // Payment was closed/cancelled
            resolve({
              success: false,
              error: 'Payment was cancelled'
            });
          }
        });

        paystackHandler.openIframe();
      });
    } catch (error) {
      console.error('Payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  },

  // Verify payment on the backend
  async verifyPayment(reference: string): Promise<PaymentResponse> {
    try {
      // Always use the Vercel serverless function endpoint
      const endpoint = '/api/verify-payment';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          reference,
          message: 'Payment verified successfully'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Payment verification failed'
        };
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Unable to connect to payment verification server. Please ensure the serverless function is deployed.'
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify payment'
      };
    }
  },

  // Generate payment reference
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `scan2tap-${timestamp}-${random}`;
  },

  // Convert amount to pesewas (Paystack uses smallest currency unit for GHS)
  toPesewas(amount: number): number {
    return Math.round(amount * 100);
  },

  // Convert from pesewas to cedis
  fromPesewas(amount: number): number {
    return amount / 100;
  },

  // Format currency for display (Ghana Cedi)
  formatCurrency(amount: number, currency: string = 'GHS'): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
};

// Extend window object for TypeScript
declare global {
  interface Window {
    PaystackPop: any;
  }
} 