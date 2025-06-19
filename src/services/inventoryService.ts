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

export interface Material {
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

export interface InventoryItem extends Omit<CardType | Material | ColorScheme, 'primary_color' | 'secondary_color' | 'accent_color'> {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  type: 'card_type' | 'material' | 'color_scheme';
}

export interface InventoryUpdateRequest {
  id: string;
  is_available?: boolean;
  has_stock_limit?: boolean;
  stock_quantity?: number;
  price_modifier?: number;
}

class InventoryService {
  // Storage keys for localStorage
  private storageKeys = {
    cardTypes: 'admin_inventory_card_types',
    materials: 'admin_inventory_materials',
    colorSchemes: 'admin_inventory_color_schemes'
  };

  // Default inventory data - matches DashboardOrder.tsx exactly
  private DEFAULT_CARD_TYPES: CardType[] = [
    {
      id: 'classic',
      name: 'Classic',
      description: 'Clean and professional design',
      is_available: true,
      has_stock_limit: false,
      stock_quantity: null,
      price_modifier: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'premium', 
      name: 'Premium',
      description: 'Elegant design with premium materials',
      is_available: true,
      has_stock_limit: false,
      stock_quantity: null,
      price_modifier: 25,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'metal',
      name: 'Metal', 
      description: 'Luxury metal card with engraving',
      is_available: true,
      has_stock_limit: false,
      stock_quantity: null,
      price_modifier: 45,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private DEFAULT_MATERIALS: Material[] = [
    {
      id: 'plastic',
      name: 'Plastic',
      description: 'Durable PVC material',
      is_available: true,
      has_stock_limit: false,
      stock_quantity: null,
      price_modifier: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'metal',
      name: 'Metal',
      description: 'Premium stainless steel',
      is_available: true,
      has_stock_limit: false,
      stock_quantity: null,
      price_modifier: 20,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private DEFAULT_COLOR_SCHEMES: ColorScheme[] = [
    {
      id: 'gold',
      name: 'Luxury Gold',
      primary_color: '#D4AF37',
      secondary_color: '#B8860B',
      accent_color: '#FFD700',
      description: 'Elegant gold tones',
      is_available: true,
      has_stock_limit: false,
      stock_quantity: null,
      price_modifier: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'white',
      name: 'Pure White',
      primary_color: '#FFFFFF',
      secondary_color: '#F5F5F5',
      accent_color: '#E5E5E5',
      description: 'Clean white design',
      is_available: true,
      has_stock_limit: false,
      stock_quantity: null,
      price_modifier: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'black',
      name: 'Midnight Black',
      primary_color: '#000000',
      secondary_color: '#1A1A1A',
      accent_color: '#333333',
      description: 'Sophisticated black design',
      is_available: true,
      has_stock_limit: false,
      stock_quantity: null,
      price_modifier: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'goldblack',
      name: 'Gold & Black',
      primary_color: '#D4AF37',
      secondary_color: '#000000',
      accent_color: '#FFD700',
      description: 'Luxury gold and black combination',
      is_available: true,
      has_stock_limit: false,
      stock_quantity: null,
      price_modifier: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'cream',
      name: 'Cream Gold',
      primary_color: '#F5DEB3',
      secondary_color: '#DAA520',
      accent_color: '#DDD',
      description: 'Soft cream and gold tones',
      is_available: true,
      has_stock_limit: false,
      stock_quantity: null,
      price_modifier: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Helper methods for localStorage
  private getStoredData<T>(key: string, defaultData: T[]): T[] {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultData;
    } catch (error) {
      console.error('Error loading stored data:', error);
      return defaultData;
    }
  }

  private saveData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Card Types
  async getCardTypes(includeUnavailable = false): Promise<CardType[]> {
    const data = this.getStoredData(this.storageKeys.cardTypes, this.DEFAULT_CARD_TYPES);
    return includeUnavailable ? data : data.filter(item => item.is_available);
  }

  async updateCardType(id: string, updates: Partial<CardType>): Promise<CardType> {
    const data = this.getStoredData(this.storageKeys.cardTypes, this.DEFAULT_CARD_TYPES);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error('Card type not found');
    }
    
    data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
    this.saveData(this.storageKeys.cardTypes, data);
    
    return data[index];
  }

  async createCardType(cardType: Omit<CardType, 'id' | 'created_at' | 'updated_at'>): Promise<CardType> {
    const data = this.getStoredData(this.storageKeys.cardTypes, this.DEFAULT_CARD_TYPES);
    const newItem: CardType = {
      ...cardType,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.push(newItem);
    this.saveData(this.storageKeys.cardTypes, data);
    
    return newItem;
  }

  async deleteCardType(id: string): Promise<void> {
    const data = this.getStoredData(this.storageKeys.cardTypes, this.DEFAULT_CARD_TYPES);
    const filtered = data.filter(item => item.id !== id);
    this.saveData(this.storageKeys.cardTypes, filtered);
  }

  // Materials
  async getMaterials(includeUnavailable = false): Promise<Material[]> {
    const data = this.getStoredData(this.storageKeys.materials, this.DEFAULT_MATERIALS);
    return includeUnavailable ? data : data.filter(item => item.is_available);
  }

  async updateMaterial(id: string, updates: Partial<Material>): Promise<Material> {
    const data = this.getStoredData(this.storageKeys.materials, this.DEFAULT_MATERIALS);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error('Material not found');
    }
    
    data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
    this.saveData(this.storageKeys.materials, data);
    
    return data[index];
  }

  async createMaterial(material: Omit<Material, 'id' | 'created_at' | 'updated_at'>): Promise<Material> {
    const data = this.getStoredData(this.storageKeys.materials, this.DEFAULT_MATERIALS);
    const newItem: Material = {
      ...material,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.push(newItem);
    this.saveData(this.storageKeys.materials, data);
    
    return newItem;
  }

  async deleteMaterial(id: string): Promise<void> {
    const data = this.getStoredData(this.storageKeys.materials, this.DEFAULT_MATERIALS);
    const filtered = data.filter(item => item.id !== id);
    this.saveData(this.storageKeys.materials, filtered);
  }

  // Color Schemes
  async getColorSchemes(includeUnavailable = false): Promise<ColorScheme[]> {
    const data = this.getStoredData(this.storageKeys.colorSchemes, this.DEFAULT_COLOR_SCHEMES);
    return includeUnavailable ? data : data.filter(item => item.is_available);
  }

  async updateColorScheme(id: string, updates: Partial<ColorScheme>): Promise<ColorScheme> {
    const data = this.getStoredData(this.storageKeys.colorSchemes, this.DEFAULT_COLOR_SCHEMES);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error('Color scheme not found');
    }
    
    data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
    this.saveData(this.storageKeys.colorSchemes, data);
    
    return data[index];
  }

  async createColorScheme(colorScheme: Omit<ColorScheme, 'id' | 'created_at' | 'updated_at'>): Promise<ColorScheme> {
    const data = this.getStoredData(this.storageKeys.colorSchemes, this.DEFAULT_COLOR_SCHEMES);
    const newItem: ColorScheme = {
      ...colorScheme,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.push(newItem);
    this.saveData(this.storageKeys.colorSchemes, data);
    
    return newItem;
  }

  async deleteColorScheme(id: string): Promise<void> {
    const data = this.getStoredData(this.storageKeys.colorSchemes, this.DEFAULT_COLOR_SCHEMES);
    const filtered = data.filter(item => item.id !== id);
    this.saveData(this.storageKeys.colorSchemes, filtered);
  }

  // Bulk operations
  async bulkUpdateCardTypes(updates: InventoryUpdateRequest[]): Promise<CardType[]> {
    const results: CardType[] = [];
    
    for (const update of updates) {
      const { id, ...updateData } = update;
      const result = await this.updateCardType(id, updateData);
      results.push(result);
    }
    
    return results;
  }

  async bulkUpdateMaterials(updates: InventoryUpdateRequest[]): Promise<Material[]> {
    const results: Material[] = [];
    
    for (const update of updates) {
      const { id, ...updateData } = update;
      const result = await this.updateMaterial(id, updateData);
      results.push(result);
    }
    
    return results;
  }

  async bulkUpdateColorSchemes(updates: InventoryUpdateRequest[]): Promise<ColorScheme[]> {
    const results: ColorScheme[] = [];
    
    for (const update of updates) {
      const { id, ...updateData } = update;
      const result = await this.updateColorScheme(id, updateData);
      results.push(result);
    }
    
    return results;
  }

  // Utility methods
  async getAllInventory(): Promise<{
    cardTypes: CardType[];
    materials: Material[];
    colorSchemes: ColorScheme[];
  }> {
    const [cardTypes, materials, colorSchemes] = await Promise.all([
      this.getCardTypes(true),
      this.getMaterials(true),
      this.getColorSchemes(true)
    ]);

    return {
      cardTypes,
      materials,
      colorSchemes
    };
  }

  async getAvailableInventory(): Promise<{
    cardTypes: CardType[];
    materials: Material[];
    colorSchemes: ColorScheme[];
  }> {
    const [cardTypes, materials, colorSchemes] = await Promise.all([
      this.getCardTypes(false),
      this.getMaterials(false),
      this.getColorSchemes(false)
    ]);

    return {
      cardTypes,
      materials,
      colorSchemes
    };
  }

  // Stock management
  async decrementStock(type: 'card_type' | 'material' | 'color_scheme', id: string, quantity = 1): Promise<void> {
    if (type === 'card_type') {
      const data = this.getStoredData(this.storageKeys.cardTypes, this.DEFAULT_CARD_TYPES);
      const index = data.findIndex(item => item.id === id);
      if (index !== -1 && data[index].has_stock_limit && data[index].stock_quantity !== null) {
        const newQuantity = Math.max(0, (data[index].stock_quantity || 0) - quantity);
        data[index].stock_quantity = newQuantity;
        data[index].is_available = newQuantity > 0;
        data[index].updated_at = new Date().toISOString();
        this.saveData(this.storageKeys.cardTypes, data);
      }
    } else if (type === 'material') {
      const data = this.getStoredData(this.storageKeys.materials, this.DEFAULT_MATERIALS);
      const index = data.findIndex(item => item.id === id);
      if (index !== -1 && data[index].has_stock_limit && data[index].stock_quantity !== null) {
        const newQuantity = Math.max(0, (data[index].stock_quantity || 0) - quantity);
        data[index].stock_quantity = newQuantity;
        data[index].is_available = newQuantity > 0;
        data[index].updated_at = new Date().toISOString();
        this.saveData(this.storageKeys.materials, data);
      }
    } else if (type === 'color_scheme') {
      const data = this.getStoredData(this.storageKeys.colorSchemes, this.DEFAULT_COLOR_SCHEMES);
      const index = data.findIndex(item => item.id === id);
      if (index !== -1 && data[index].has_stock_limit && data[index].stock_quantity !== null) {
        const newQuantity = Math.max(0, (data[index].stock_quantity || 0) - quantity);
        data[index].stock_quantity = newQuantity;
        data[index].is_available = newQuantity > 0;
        data[index].updated_at = new Date().toISOString();
        this.saveData(this.storageKeys.colorSchemes, data);
      }
    }
  }

  async incrementStock(type: 'card_type' | 'material' | 'color_scheme', id: string, quantity = 1): Promise<void> {
    if (type === 'card_type') {
      const data = this.getStoredData(this.storageKeys.cardTypes, this.DEFAULT_CARD_TYPES);
      const index = data.findIndex(item => item.id === id);
      if (index !== -1 && data[index].has_stock_limit) {
        const newQuantity = (data[index].stock_quantity || 0) + quantity;
        data[index].stock_quantity = newQuantity;
        data[index].is_available = true;
        data[index].updated_at = new Date().toISOString();
        this.saveData(this.storageKeys.cardTypes, data);
      }
    } else if (type === 'material') {
      const data = this.getStoredData(this.storageKeys.materials, this.DEFAULT_MATERIALS);
      const index = data.findIndex(item => item.id === id);
      if (index !== -1 && data[index].has_stock_limit) {
        const newQuantity = (data[index].stock_quantity || 0) + quantity;
        data[index].stock_quantity = newQuantity;
        data[index].is_available = true;
        data[index].updated_at = new Date().toISOString();
        this.saveData(this.storageKeys.materials, data);
      }
    } else if (type === 'color_scheme') {
      const data = this.getStoredData(this.storageKeys.colorSchemes, this.DEFAULT_COLOR_SCHEMES);
      const index = data.findIndex(item => item.id === id);
      if (index !== -1 && data[index].has_stock_limit) {
        const newQuantity = (data[index].stock_quantity || 0) + quantity;
        data[index].stock_quantity = newQuantity;
        data[index].is_available = true;
        data[index].updated_at = new Date().toISOString();
        this.saveData(this.storageKeys.colorSchemes, data);
      }
    }
  }
}

export const inventoryService = new InventoryService();
export default inventoryService; 