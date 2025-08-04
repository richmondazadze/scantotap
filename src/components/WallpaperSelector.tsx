import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image, Check } from 'lucide-react';
import { toast } from 'sonner';
import { WallpaperService, AVAILABLE_WALLPAPERS } from '@/services/wallpaperService';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';

interface WallpaperSelectorProps {
  profileId: string;
  currentWallpaper?: string | null;
  onWallpaperChange: (wallpaper: string | null) => void;
}



export default function WallpaperSelector({ 
  profileId, 
  currentWallpaper, 
  onWallpaperChange 
}: WallpaperSelectorProps) {
  const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(currentWallpaper);
  const [saving, setSaving] = useState(false);
  const planFeatures = usePlanFeatures();

  useEffect(() => {
    // Convert wallpaper path to wallpaper ID
    if (currentWallpaper) {
      const wallpaper = AVAILABLE_WALLPAPERS.find(w => w.url === currentWallpaper);
      setSelectedWallpaper(wallpaper?.id || null);
    } else {
      setSelectedWallpaper(null);
    }
  }, [currentWallpaper]);

  const handleWallpaperSelect = async (wallpaperId: string | null) => {
    console.log('Selecting wallpaper:', wallpaperId, 'Current:', selectedWallpaper);
    if (selectedWallpaper === wallpaperId) return;

    // Check if user is trying to select a Pro wallpaper without Pro plan
    if (wallpaperId) {
      const wallpaper = AVAILABLE_WALLPAPERS.find(w => w.id === wallpaperId);
      if (wallpaper?.isPro && planFeatures.isFreeUser) {
        toast.error('This wallpaper is available with Pro plan. Upgrade to unlock premium wallpapers!');
        return;
      }
    }

    setSaving(true);
    try {
      const result = await WallpaperService.updateWallpaperPreference(profileId, wallpaperId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update wallpaper');
      }

      setSelectedWallpaper(wallpaperId);
      const wallpaperPath = wallpaperId ? WallpaperService.getWallpaperUrl(wallpaperId) : null;
      onWallpaperChange(wallpaperPath);
      toast.success(wallpaperId ? 'Wallpaper updated!' : 'Wallpaper removed!');
    } catch (err) {
      console.error('Error updating wallpaper:', err);
      toast.error('Failed to update wallpaper');
    } finally {
      setSaving(false);
    }
  };

  const getWallpaperUrl = (wallpaper: any) => {
    return wallpaper.url;
  };

  const isWallpaperSelected = (wallpaperId: string | null) => {
    const isSelected = wallpaperId === null 
      ? selectedWallpaper === null 
      : selectedWallpaper === wallpaperId;
    
    console.log(`Checking selection for ${wallpaperId}:`, isSelected, 'Current selected:', selectedWallpaper);
    return isSelected;
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-white">
          <Image className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span>Profile Wallpapers</span>
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          Choose a beautiful wallpaper to enhance your profile's visual appeal. 
          Wallpapers will be displayed behind your profile content with proper text visibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* No Wallpaper Option */}
                      <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative cursor-pointer rounded-xl border-2 transition-all overflow-hidden ${
                isWallpaperSelected(null)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => handleWallpaperSelect(null)}
            >
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No Wallpaper</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Use theme background</p>
                </div>
              </div>
              {isWallpaperSelected(null) && (
                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                  <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}
            </motion.div>

          {/* Wallpaper Options */}
          {AVAILABLE_WALLPAPERS.map((wallpaper) => (
            <motion.div
              key={wallpaper.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative cursor-pointer rounded-xl border-2 transition-all overflow-hidden ${
                isWallpaperSelected(wallpaper.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20'
                  : wallpaper.isPro && planFeatures.isFreeUser
                  ? 'border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => handleWallpaperSelect(wallpaper.id)}
            >
              <div className="aspect-video">
                <img
                  src={getWallpaperUrl(wallpaper)}
                  alt={wallpaper.name}
                  className={`w-full h-full ${
                    wallpaper.id === 'white_dia_geom' || wallpaper.id === 'white_scribble' || wallpaper.id === 'navy_geom'
                      ? 'object-cover object-top' 
                      : 'object-cover'
                  }`}
                  loading="lazy"
                />
                {wallpaper.isPro && (
                  <Badge variant="secondary" className="absolute top-2 right-2 text-xs px-2 py-1 bg-purple-500 dark:bg-purple-400 text-white dark:text-purple-900 font-medium">
                    PRO
                  </Badge>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                  {wallpaper.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {wallpaper.description}
                </p>
              </div>
              {isWallpaperSelected(wallpaper.id) && (
                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                  <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {saving && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Updating wallpaper...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 