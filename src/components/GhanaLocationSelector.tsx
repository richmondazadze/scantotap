import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, Clock, Search, Star } from 'lucide-react';
import { GhanaLocationService } from '@/services/ghanaLocationService';

interface GhanaLocationSelectorProps {
  onLocationSelect: (city: string, region: string, shippingCost: number, deliveryDays: string) => void;
  orderTotal: number;
  quantity: number;
  currentCity?: string;
  currentRegion?: string;
}

export default function GhanaLocationSelector({
  onLocationSelect,
  orderTotal,
  quantity,
  currentCity = '',
  currentRegion = ''
}: GhanaLocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [popularCities, setPopularCities] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    city: string;
    region: string;
    cost: number;
    deliveryDays: string;
  } | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    // Load popular cities
    const result = GhanaLocationService.getPopularCities();
    if (result.success && result.data) {
      setPopularCities(result.data);
    }
  }, []);

  useEffect(() => {
    // Update shipping when location or order details change
    if (currentCity && currentRegion) {
      updateShippingCalculation(currentCity, currentRegion);
    }
  }, [currentCity, currentRegion, orderTotal, quantity]);

  const updateShippingCalculation = (city: string, region: string) => {
    const shippingResult = GhanaLocationService.calculateShipping(city, region, orderTotal, quantity);
    
    if (shippingResult.success && shippingResult.data) {
      const { cost, deliveryDays } = shippingResult.data;
      setSelectedLocation({
        city,
        region,
        cost,
        deliveryDays
      });
      onLocationSelect(city, region, cost, deliveryDays);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const result = GhanaLocationService.searchCities(query);
    if (result.success && result.data) {
      setSearchResults(result.data);
      setShowSearchResults(true);
    }
  };

  const handleLocationClick = (city: string, region: string) => {
    setSearchQuery(`${city}, ${region}`);
    setShowSearchResults(false);
    updateShippingCalculation(city, region);
  };

  const deliveryInfo = GhanaLocationService.getDeliveryInfo();

  return (
    <div className="space-y-6">
      {/* Delivery Coverage Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Ghana-Wide Delivery</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                We deliver to {deliveryInfo.cities}+ cities across all {deliveryInfo.regions} regions of Ghana
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span>Fastest: {deliveryInfo.fastestDelivery}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>From ₵{deliveryInfo.lowestShipping}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-600" />
              <span>Free shipping from ₵{deliveryInfo.freeShippingFrom}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Select Your Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Search for your city (e.g., Accra, Kumasi, Tamale...)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationClick(location.city, location.region)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{location.city}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {location.region}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">₵{location.shippingCost}</div>
                        {location.isMetro && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            Fast
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Selection */}
          {selectedLocation && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      {selectedLocation.city}, {selectedLocation.region}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Delivery: {selectedLocation.deliveryDays}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {selectedLocation.cost === 0 ? 'FREE' : `₵${selectedLocation.cost}`}
                  </div>
                  {selectedLocation.cost === 0 && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      {quantity >= 5 ? 'Bulk discount' : 'Free shipping applied!'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Popular Cities */}
          {!selectedLocation && (
            <div>
              <h4 className="text-sm font-medium mb-3">Popular Cities</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularCities.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationClick(location.city, location.region)}
                    className="text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{location.city}</div>
                        <div className="text-sm text-gray-500">{location.region}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">₵{location.shippingCost}</div>
                        {location.isMetro && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            Metro
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 