import { supabase } from './supabaseClient';

export interface OrderData {
  // Design details
  design_id: string;
  design_name: string;
  design_price: number;
  
  // Material details
  material_id: string;
  material_name: string;
  material_price_modifier: number;
  
  // Color scheme
  color_scheme_id: string;
  color_scheme_name: string;
  color_primary: string;
  color_secondary: string;
  
  // Quantity and pricing
  quantity: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  
  // Customer information
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone?: string;
  
  // Shipping address
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;
  special_instructions?: string;
}

export interface Order extends OrderData {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export const orderService = {
  // Generate a unique order number as fallback
  generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const userId = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${userId}-${random}`;
  },

  // Create a new order
  async createOrder(orderData: OrderData): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Try creating the order with database-generated order number first
      let { data, error } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          ...orderData
        }])
        .select()
        .single();

      // If there's a unique constraint error, try with a fallback order number
      if (error && error.message.includes('duplicate key value violates unique constraint')) {
        console.log('Database order number generation failed, using fallback...');
        
        // Generate a fallback order number
        const fallbackOrderNumber = this.generateOrderNumber();
        
        const { data: retryData, error: retryError } = await supabase
          .from('orders')
          .insert([{
            user_id: user.id,
            order_number: fallbackOrderNumber,
            ...orderData
          }])
          .select()
          .single();

        if (retryError) {
          console.error('Error creating order with fallback:', retryError);
          return { success: false, error: retryError.message };
        }

        return { success: true, order: retryData };
      }

      if (error) {
        console.error('Error creating order:', error);
        return { success: false, error: error.message };
      }

      return { success: true, order: data };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Get user's orders
  async getUserOrders(): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return { success: false, error: error.message };
      }

      return { success: true, orders: data || [] };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Get a specific order by ID
  async getOrder(orderId: string): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return { success: false, error: error.message };
      }

      return { success: true, order: data };
    } catch (error) {
      console.error('Error fetching order:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Update order details
  async updateOrder(orderId: string, orderData: Partial<OrderData>): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating order:', error);
        return { success: false, error: error.message };
      }

      return { success: true, order: data };
    } catch (error) {
      console.error('Error updating order:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const updateData: any = { status };
      
      // Set timestamps based on status
      if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Admin: Update order status for any order (no user_id restriction)
  async adminUpdateOrderStatus(orderId: string, status: Order['status']): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = { status };
      if (status === 'shipped') updateData.shipped_at = new Date().toISOString();
      if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status (admin):', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating order status (admin):', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Add tracking number
  async addTrackingNumber(orderId: string, trackingNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('orders')
        .update({ tracking_number: trackingNumber })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error adding tracking number:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding tracking number:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Get order statistics
  async getOrderStats(): Promise<{ 
    success: boolean; 
    stats?: { 
      total: number; 
      pending: number; 
      shipped: number; 
      delivered: number;
      totalRevenue: number;
    }; 
    error?: string 
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('orders')
        .select('status, total')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching order stats:', error);
        return { success: false, error: error.message };
      }

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(order => ['pending', 'confirmed', 'processing'].includes(order.status)).length || 0,
        shipped: data?.filter(order => order.status === 'shipped').length || 0,
        delivered: data?.filter(order => order.status === 'delivered').length || 0,
        totalRevenue: data?.reduce((sum, order) => {
          // Only count revenue from successfully paid orders
          const paidStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
          return paidStatuses.includes(order.status) ? sum + parseFloat(order.total) : sum;
        }, 0) || 0
      };

      return { success: true, stats };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
};

// Helper function to format order status for display
export const formatOrderStatus = (status: Order['status']): string => {
  const statusMap = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  
  return statusMap[status] || status;
};

// Helper function to get status color
export const getStatusColor = (status: Order['status']): string => {
  const colorMap = {
    pending: 'text-yellow-600 bg-yellow-100',
    confirmed: 'text-blue-600 bg-blue-100',
    processing: 'text-orange-600 bg-orange-100',
    shipped: 'text-purple-600 bg-purple-100',
    delivered: 'text-green-600 bg-green-100',
    cancelled: 'text-red-600 bg-red-100'
  };
  
  return colorMap[status] || 'text-gray-600 bg-gray-100';
}; 