import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Globe, Info } from 'lucide-react';

export default function DeliveryLocationNotice() {
  const [userCountry, setUserCountry] = useState<string>('');
  const [isInternational, setIsInternational] = useState(false);

  useEffect(() => {
    // Try to detect user's location
    const detectLocation = async () => {
      try {
        // Simple timezone-based detection
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Ghana timezone is Africa/Accra
        if (timezone === 'Africa/Accra') {
          setUserCountry('Ghana');
          setIsInternational(false);
        } else {
          // Try to get country from timezone
          const parts = timezone.split('/');
          const continent = parts[0];
          
          if (continent === 'America') {
            setUserCountry('the Americas');
          } else if (continent === 'Europe') {
            setUserCountry('Europe');
          } else if (continent === 'Asia') {
            setUserCountry('Asia');
          } else if (continent === 'Africa' && parts[1] !== 'Accra') {
            setUserCountry('Africa');
          } else {
            setUserCountry('internationally');
          }
          setIsInternational(true);
        }
      } catch (error) {
        console.log('Could not detect location');
      }
    };

    detectLocation();
  }, []);

  if (!isInternational) {
    return null; // Don't show notice for Ghana users
  }

  return (
    <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🌍 Ordering from {userCountry}?
            </h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>
                <strong>Great news!</strong> You can place your order from anywhere in the world. 
                We'll deliver your physical business cards to any address within Ghana.
              </p>
              <div className="flex items-start gap-2 mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <MapPin className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>🇺🇸 Expanding Soon!</strong> We're working to bring our services to the US. 
                  Stay tuned for international shipping options coming soon!
                </div>
              </div>
              <div className="flex items-start gap-2 mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs">
                  <strong>Popular use cases:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Ghanaians abroad sending cards to family/friends</li>
                    <li>International businesses with Ghana operations</li>
                    <li>Diaspora community gifts and networking</li>
                    <li>Students studying abroad with Ghana connections</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 