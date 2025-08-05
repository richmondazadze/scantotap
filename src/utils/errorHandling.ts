// Enhanced Error Handling Utility
export class ErrorHandler {
  
  // Payment-specific error messages
  static getPaymentErrorMessage(error: any): string {
    const errorMessage = error?.message || error?.toString() || '';
    
    if (errorMessage.includes('Card authorization required')) {
      return 'Please use a credit or debit card for this transaction. Mobile money and other payment methods are not supported for subscriptions.';
    }
    
    if (errorMessage.includes('Payment cancelled')) {
      return 'Payment was cancelled. You can try again or continue with the free plan.';
    }
    
    if (errorMessage.includes('Insufficient funds')) {
      return 'Your card has insufficient funds. Please try a different card or add funds to your account.';
    }
    
    if (errorMessage.includes('Invalid card')) {
      return 'The card details you entered are invalid. Please check and try again.';
    }
    
    if (errorMessage.includes('Card declined')) {
      return 'Your card was declined. Please try a different card or contact your bank.';
    }
    
    if (errorMessage.includes('Network error') || errorMessage.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (errorMessage.includes('timeout')) {
      return 'Request timed out. Please try again in a moment.';
    }
    
    return 'Payment failed. Please try again or contact support if the problem persists.';
  }
  
  // Database-specific error messages
  static getDatabaseErrorMessage(error: any): string {
    const errorMessage = error?.message || error?.toString() || '';
    
    // Handle 409 Conflict errors specifically
    if (errorMessage.includes('409') || errorMessage.includes('Conflict')) {
      if (errorMessage.includes('slug') || errorMessage.includes('username')) {
        return 'This username is already taken. Please choose a different username.';
      }
      return 'This information already exists. Please try a different value.';
    }
    
    if (errorMessage.includes('duplicate key value violates unique constraint')) {
      if (errorMessage.includes('username_history')) {
        return 'This username is already taken. Please choose a different username.';
      }
      if (errorMessage.includes('profiles_slug_key')) {
        return 'This username is already taken. Please choose a different username.';
      }
      return 'This information already exists. Please try a different value.';
    }
    
    if (errorMessage.includes('null value in column')) {
      if (errorMessage.includes('username')) {
        return 'Username is required. Please enter a valid username.';
      }
      return 'Required information is missing. Please fill in all required fields.';
    }
    
    if (errorMessage.includes('violates not-null constraint')) {
      return 'Required information is missing. Please fill in all required fields.';
    }
    
    if (errorMessage.includes('foreign key constraint')) {
      return 'Invalid reference. Please refresh the page and try again.';
    }
    
    if (errorMessage.includes('connection')) {
      return 'Database connection issue. Please try again in a moment.';
    }
    
    return 'Database error occurred. Please try again or contact support.';
  }
  
  // Authentication-specific error messages
  static getAuthErrorMessage(error: any): string {
    const errorMessage = error?.message || error?.toString() || '';
    
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    
    if (errorMessage.includes('User not found')) {
      return 'No account found with this email address. Please check your email or sign up.';
    }
    
    if (errorMessage.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    
    if (errorMessage.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    
    if (errorMessage.includes('Too many requests')) {
      return 'Too many attempts. Please wait a moment before trying again.';
    }
    
    if (errorMessage.includes('Invalid email')) {
      return 'Please enter a valid email address.';
    }
    
    return 'Authentication error. Please try again or contact support.';
  }
  
  // Network-specific error messages
  static getNetworkErrorMessage(error: any): string {
    const errorMessage = error?.message || error?.toString() || '';
    
    if (errorMessage.includes('fetch') || errorMessage.includes('NetworkError')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (errorMessage.includes('timeout')) {
      return 'Request timed out. Please try again in a moment.';
    }
    
    if (errorMessage.includes('404')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    
    if (errorMessage.includes('500')) {
      return 'Server error. Please try again later or contact support.';
    }
    
    return 'Connection error. Please check your internet connection and try again.';
  }
  
  // Generic error handler that determines the type of error
  static getErrorMessage(error: any): string {
    const errorMessage = error?.message || error?.toString() || '';
    
    // Check for payment errors
    if (errorMessage.includes('payment') || errorMessage.includes('card') || errorMessage.includes('Paystack')) {
      return this.getPaymentErrorMessage(error);
    }
    
    // Check for database errors
    if (errorMessage.includes('database') || errorMessage.includes('constraint') || errorMessage.includes('duplicate')) {
      return this.getDatabaseErrorMessage(error);
    }
    
    // Check for authentication errors
    if (errorMessage.includes('auth') || errorMessage.includes('login') || errorMessage.includes('signin')) {
      return this.getAuthErrorMessage(error);
    }
    
    // Check for network errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('timeout')) {
      return this.getNetworkErrorMessage(error);
    }
    
    // Default fallback
    return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }
  
  // Log error for debugging (only in development)
  static logError(context: string, error: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context}] Error:`, error);
    }
  }
} 