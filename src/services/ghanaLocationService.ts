import { supabase } from '@/lib/supabaseClient';

export interface GhanaRegion {
  id: string;
  name: string;
  cities: string[];
  baseShippingCost: number;
  freeShippingThreshold: number;
  estimatedDeliveryDays: string;
  isMetro: boolean;
}

export interface GhanaLocationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class GhanaLocationService {
  
  // Ghana regions with major cities and shipping info
  private static regions: GhanaRegion[] = [
    {
      id: 'greater-accra',
      name: 'Greater Accra',
      cities: ['Accra', 'Tema', 'Kasoa', 'Madina', 'Adenta', 'Ashaiman', 'Teshie', 'Nungua', 'La', 'Dansoman', 'Kaneshie', 'Osu'],
      baseShippingCost: 40,
      freeShippingThreshold: 400,
      estimatedDeliveryDays: '1-2 days',
      isMetro: true
    },
    {
      id: 'ashanti',
      name: 'Ashanti Region',
      cities: ['Kumasi', 'Obuasi', 'Ejisu', 'Konongo', 'Mampong', 'Bekwai', 'Tepa', 'Agona'],
      baseShippingCost: 50,
      freeShippingThreshold: 500,
      estimatedDeliveryDays: '2-3 days',
      isMetro: false
    },
    {
      id: 'western',
      name: 'Western Region',
      cities: ['Takoradi', 'Sekondi', 'Tarkwa', 'Axim', 'Half Assini', 'Elubo', 'Prestea'],
      baseShippingCost: 55,
      freeShippingThreshold: 550,
      estimatedDeliveryDays: '2-4 days',
      isMetro: false
    },
    {
      id: 'central',
      name: 'Central Region',
      cities: ['Cape Coast', 'Elmina', 'Winneba', 'Kasoa', 'Swedru', 'Saltpond', 'Agona Swedru'],
      baseShippingCost: 45,
      freeShippingThreshold: 450,
      estimatedDeliveryDays: '2-3 days',
      isMetro: false
    },
    {
      id: 'eastern',
      name: 'Eastern Region',
      cities: ['Koforidua', 'Akosombo', 'Nkawkaw', 'Mpraeso', 'Begoro', 'Somanya', 'Aburi'],
      baseShippingCost: 45,
      freeShippingThreshold: 450,
      estimatedDeliveryDays: '2-3 days',
      isMetro: false
    },
    {
      id: 'volta',
      name: 'Volta Region',
      cities: ['Ho', 'Hohoe', 'Keta', 'Aflao', 'Akatsi', 'Kpando', 'Dzodze'],
      baseShippingCost: 60,
      freeShippingThreshold: 600,
      estimatedDeliveryDays: '3-5 days',
      isMetro: false
    },
    {
      id: 'northern',
      name: 'Northern Region',
      cities: ['Tamale', 'Yendi', 'Savelugu', 'Tolon', 'Kumbungu'],
      baseShippingCost: 70,
      freeShippingThreshold: 700,
      estimatedDeliveryDays: '4-6 days',
      isMetro: false
    },
    {
      id: 'upper-east',
      name: 'Upper East Region',
      cities: ['Bolgatanga', 'Navrongo', 'Bawku', 'Paga'],
      baseShippingCost: 80,
      freeShippingThreshold: 800,
      estimatedDeliveryDays: '5-7 days',
      isMetro: false
    },
    {
      id: 'upper-west',
      name: 'Upper West Region',
      cities: ['Wa', 'Lawra', 'Jirapa', 'Tumu'],
      baseShippingCost: 80,
      freeShippingThreshold: 800,
      estimatedDeliveryDays: '5-7 days',
      isMetro: false
    },
    {
      id: 'brong-ahafo',
      name: 'Bono Region',
      cities: ['Sunyani', 'Techiman', 'Berekum', 'Dormaa Ahenkro', 'Wenchi'],
      baseShippingCost: 60,
      freeShippingThreshold: 600,
      estimatedDeliveryDays: '3-5 days',
      isMetro: false
    }
  ];

  /**
   * Get all Ghana regions
   */
  static getRegions(): GhanaLocationResult<GhanaRegion[]> {
    return { success: true, data: this.regions };
  }

  /**
   * Find region by city name
   */
  static findRegionByCity(cityName: string): GhanaLocationResult<GhanaRegion> {
    const city = cityName.toLowerCase().trim();
    
    for (const region of this.regions) {
      const cityExists = region.cities.some(c => 
        c.toLowerCase() === city || 
        c.toLowerCase().includes(city) ||
        city.includes(c.toLowerCase())
      );
      
      if (cityExists) {
        return { success: true, data: region };
      }
    }

    return { success: false, error: 'City not found in our delivery areas' };
  }

  /**
   * Calculate shipping for a specific location
   */
  static calculateShipping(
    city: string, 
    region: string, 
    orderTotal: number, 
    quantity: number = 1
  ): GhanaLocationResult<{
    cost: number;
    isFree: boolean;
    region: GhanaRegion;
    deliveryDays: string;
  }> {
    // First try to find by city
    let regionResult = this.findRegionByCity(city);
    
    // If not found by city, try by region name
    if (!regionResult.success) {
      const regionName = region.toLowerCase().trim();
      const matchedRegion = this.regions.find(r => 
        r.name.toLowerCase().includes(regionName) ||
        regionName.includes(r.name.toLowerCase())
      );
      
      if (matchedRegion) {
        regionResult = { success: true, data: matchedRegion };
      }
    }

    // If still not found, default to most expensive region
    if (!regionResult.success || !regionResult.data) {
      const defaultRegion = this.regions.find(r => r.id === 'northern') || this.regions[0];
      regionResult = { success: true, data: defaultRegion };
    }

    const regionData = regionResult.data!;
    
    // Calculate shipping cost
    let shippingCost = regionData.baseShippingCost;
    
    // Apply quantity-based free shipping (existing logic)
    if (quantity >= 5) {
      shippingCost = 0;
    }
    // Apply amount-based free shipping
    else if (orderTotal >= regionData.freeShippingThreshold) {
      shippingCost = 0;
    }

    return {
      success: true,
      data: {
        cost: shippingCost,
        isFree: shippingCost === 0,
        region: regionData,
        deliveryDays: regionData.estimatedDeliveryDays
      }
    };
  }

  /**
   * Search cities across all regions
   */
  static searchCities(query: string): GhanaLocationResult<Array<{
    city: string;
    region: string;
    regionId: string;
    shippingCost: number;
    isMetro: boolean;
  }>> {
    const searchTerm = query.toLowerCase().trim();
    const results: Array<{
      city: string;
      region: string;
      regionId: string;
      shippingCost: number;
      isMetro: boolean;
    }> = [];

    this.regions.forEach(region => {
      region.cities.forEach(city => {
        if (city.toLowerCase().includes(searchTerm)) {
          results.push({
            city,
            region: region.name,
            regionId: region.id,
            shippingCost: region.baseShippingCost,
            isMetro: region.isMetro
          });
        }
      });
    });

    // Sort by metro areas first, then by shipping cost
    results.sort((a, b) => {
      if (a.isMetro !== b.isMetro) {
        return a.isMetro ? -1 : 1;
      }
      return a.shippingCost - b.shippingCost;
    });

    return { success: true, data: results };
  }

  /**
   * Get popular cities (major cities from each region)
   */
  static getPopularCities(): GhanaLocationResult<Array<{
    city: string;
    region: string;
    regionId: string;
    shippingCost: number;
    isMetro: boolean;
  }>> {
    const popularCities = [
      // Metro areas first
      { city: 'Accra', region: 'Greater Accra', regionId: 'greater-accra', shippingCost: 40, isMetro: true },
      { city: 'Tema', region: 'Greater Accra', regionId: 'greater-accra', shippingCost: 40, isMetro: true },
      
      // Major regional capitals
      { city: 'Kumasi', region: 'Ashanti Region', regionId: 'ashanti', shippingCost: 50, isMetro: false },
      { city: 'Takoradi', region: 'Western Region', regionId: 'western', shippingCost: 55, isMetro: false },
      { city: 'Cape Coast', region: 'Central Region', regionId: 'central', shippingCost: 45, isMetro: false },
      { city: 'Tamale', region: 'Northern Region', regionId: 'northern', shippingCost: 70, isMetro: false },
      { city: 'Ho', region: 'Volta Region', regionId: 'volta', shippingCost: 60, isMetro: false },
      { city: 'Koforidua', region: 'Eastern Region', regionId: 'eastern', shippingCost: 45, isMetro: false },
    ];

    return { success: true, data: popularCities };
  }

  /**
   * Get delivery information summary
   */
  static getDeliveryInfo(): {
    regions: number;
    cities: number;
    fastestDelivery: string;
    lowestShipping: number;
    freeShippingFrom: number;
  } {
    const totalCities = this.regions.reduce((sum, region) => sum + region.cities.length, 0);
    const lowestShipping = Math.min(...this.regions.map(r => r.baseShippingCost));
    const lowestFreeShipping = Math.min(...this.regions.map(r => r.freeShippingThreshold));

    return {
      regions: this.regions.length,
      cities: totalCities,
      fastestDelivery: '1-2 days',
      lowestShipping,
      freeShippingFrom: lowestFreeShipping
    };
  }
} 