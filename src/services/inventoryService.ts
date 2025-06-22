import { supabase } from '@/lib/supabaseClient';

// Type definitions
export interface CardType {
  id: string;
  name: string;
  description?: string;
  is_available: boolean;
  has_stock_limit: boolean;
  stock_quantity?: number;
  price_modifier: number;
  created_at: string;
  updated_at: string;
}

export interface ColorScheme {
  id: string;
  name: string;
  description?: string;
  primary_color: string;
  secondary_color?: string;
  accent_color?: string;
  is_available: boolean;
  has_stock_limit: boolean;
  stock_quantity?: number;
  price_modifier: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryUpdateRequest {
  id: string;
  is_available?: boolean;
  has_stock_limit?: boolean;
  stock_quantity?: number;
  price_modifier?: number;
}

class InventoryService {
  
  // ========================================
  // CARD TYPES - Database-driven
  // ========================================
  
  async getCardTypes(includeUnavailable = false): Promise<CardType[]> {
    try {
      let query = supabase.from('card_types').select('*');
      
      if (!includeUnavailable) {
        query = query.eq('is_available', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching card types:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getCardTypes:', error);
      return [];
    }
  }

  async updateCardType(id: string, updates: Partial<CardType>): Promise<CardType> {
    try {
      const { data, error } = await supabase
        .from('card_types')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating card type:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateCardType:', error);
      throw error;
    }
  }

  // ========================================
  // COLOR SCHEMES - Database Management
  // ========================================

  async getColorSchemes(includeUnavailable = false): Promise<ColorScheme[]> {
    try {
      let query = supabase.from('color_schemes').select('*');
      
      if (!includeUnavailable) {
        query = query.eq('is_available', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching color schemes:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getColorSchemes:', error);
      return [];
    }
  }

  async updateColorScheme(id: string, updates: Partial<ColorScheme>): Promise<ColorScheme> {
    try {
      // Remove description field since it doesn't exist in the database
      const { description, ...dbUpdates } = updates;
      
      const { data, error } = await supabase
        .from('color_schemes')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating color scheme:', error);
        throw error;
      }

      // Add description back to the returned data (will be empty)
      return { ...data, description: '' };
    } catch (error) {
      console.error('Error in updateColorScheme:', error);
      throw error;
    }
  }

  async createColorScheme(colorScheme: Omit<ColorScheme, 'id' | 'created_at' | 'updated_at'>): Promise<ColorScheme> {
    try {
      // Remove description field since it doesn't exist in the database
      const { description, ...dbColorScheme } = colorScheme;
      
      const { data, error } = await supabase
        .from('color_schemes')
        .insert([dbColorScheme])
        .select()
        .single();

      if (error) {
        console.error('Error creating color scheme:', error);
        throw error;
      }

      // Add description back to the returned data (will be empty)
      return { ...data, description: '' };
    } catch (error) {
      console.error('Error in createColorScheme:', error);
      throw error;
    }
  }

  async deleteColorScheme(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('color_schemes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting color scheme:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteColorScheme:', error);
      throw error;
    }
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  async bulkUpdateCardTypes(updates: InventoryUpdateRequest[]): Promise<CardType[]> {
    const results: CardType[] = [];
    
    for (const update of updates) {
      const { id, ...updateData } = update;
      try {
        const result = await this.updateCardType(id, updateData);
        results.push(result);
      } catch (error) {
        console.error(`Error updating card type ${id}:`, error);
      }
    }
    
    return results;
  }

  async bulkUpdateColorSchemes(updates: InventoryUpdateRequest[]): Promise<ColorScheme[]> {
    const results: ColorScheme[] = [];
    
    for (const update of updates) {
      const { id, ...updateData } = update;
      try {
        const result = await this.updateColorScheme(id, updateData);
        results.push(result);
      } catch (error) {
        console.error(`Error updating color scheme ${id}:`, error);
      }
    }
    
    return results;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  async getAllInventory(): Promise<{
    cardTypes: CardType[];
    colorSchemes: ColorScheme[];
  }> {
    try {
      const [cardTypes, colorSchemes] = await Promise.all([
        this.getCardTypes(true),
        this.getColorSchemes(true)
      ]);

      return {
        cardTypes,
        colorSchemes
      };
    } catch (error) {
      console.error('Error in getAllInventory:', error);
      return {
        cardTypes: [],
        colorSchemes: []
      };
    }
  }

  async getAvailableInventory(): Promise<{
    cardTypes: CardType[];
    colorSchemes: ColorScheme[];
  }> {
    try {
      const [cardTypes, colorSchemes] = await Promise.all([
        this.getCardTypes(false),
        this.getColorSchemes(false)
      ]);

      return {
        cardTypes,
        colorSchemes
      };
    } catch (error) {
      console.error('Error in getAvailableInventory:', error);
      return {
        cardTypes: [],
        colorSchemes: []
      };
    }
  }

  // ========================================
  // STOCK MANAGEMENT (Color Schemes Only)
  // ========================================

  async decrementStock(type: 'color_scheme', id: string, quantity = 1): Promise<void> {
    try {
      const tableName = 'color_schemes';
      
      // Get current stock
      const { data: currentItem, error: fetchError } = await supabase
        .from(tableName)
        .select('stock_quantity, has_stock_limit')
        .eq('id', id)
        .single();

      if (fetchError || !currentItem) {
        console.error(`Error fetching ${type} for stock decrement:`, fetchError);
        return;
      }

      // Only decrement if stock limit is enabled
      if (!currentItem.has_stock_limit) {
        return;
      }

      const currentStock = currentItem.stock_quantity || 0;
      const newQuantity = Math.max(0, currentStock - quantity);
      
      // Update stock and availability
      const { error: updateError } = await supabase
        .from(tableName)
        .update({
          stock_quantity: newQuantity,
          is_available: newQuantity > 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error(`Error updating ${type} stock:`, updateError);
      }
    } catch (error) {
      console.error(`Error in decrementStock for ${type}:`, error);
    }
  }

  async incrementStock(type: 'color_scheme', id: string, quantity = 1): Promise<void> {
    try {
      const tableName = 'color_schemes';
      
      // Get current stock
      const { data: currentItem, error: fetchError } = await supabase
        .from(tableName)
        .select('stock_quantity, has_stock_limit')
        .eq('id', id)
        .single();

      if (fetchError || !currentItem) {
        console.error(`Error fetching ${type} for stock increment:`, fetchError);
        return;
      }

      // Only increment if stock limit is enabled
      if (!currentItem.has_stock_limit) {
        return;
      }

      const currentStock = currentItem.stock_quantity || 0;
      const newQuantity = currentStock + quantity;
      
      // Update stock and availability
      const { error: updateError } = await supabase
        .from(tableName)
        .update({
          stock_quantity: newQuantity,
          is_available: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error(`Error updating ${type} stock:`, updateError);
      }
    } catch (error) {
      console.error(`Error in incrementStock for ${type}:`, error);
    }
  }

  // ========================================
  // ORDER INTEGRATION (Simplified)
  // ========================================

  async processOrderStockDecrement(orderData: {
    design_id: string;
    color_scheme_id: string;
    quantity: number;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      // Check card type availability
      const cardTypes = await this.getCardTypes(false);
      const selectedCardType = cardTypes.find(ct => ct.id === orderData.design_id);
      if (!selectedCardType) {
        return { success: false, message: 'Selected card design is currently unavailable' };
      }

      // Check color scheme stock
      const { data: colorScheme, error } = await supabase
        .from('color_schemes')
        .select('stock_quantity, has_stock_limit, is_available')
        .eq('id', orderData.color_scheme_id)
        .single();

      if (error || !colorScheme?.is_available) {
        return { success: false, message: 'Selected color scheme is currently unavailable' };
      }

      // Check stock levels for color schemes with stock limits
      if (colorScheme.has_stock_limit && (colorScheme.stock_quantity || 0) < orderData.quantity) {
        return { 
          success: false, 
          message: 'Insufficient stock for selected color scheme' 
        };
      }

      // Decrement stock for color schemes only
      await this.decrementStock('color_scheme', orderData.color_scheme_id, orderData.quantity);

      return { success: true };
    } catch (error) {
      console.error('Error processing order stock decrement:', error);
      return { success: false, message: 'Error processing stock update' };
    }
  }
}

// Export singleton instance
const inventoryService = new InventoryService();
export default inventoryService;
