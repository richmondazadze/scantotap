import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Palette, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ThemeService } from '@/services/themeService';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';

interface Theme {
  id: string;
  name: string;
  description: string;
  psychology: string;
  isPro: boolean;
  colors: {
    background: string;
    backgroundGradient: string;
    text: string;
    textSecondary: string;
  };
}

const themes: Theme[] = [
  // FREE THEMES (5 available)
  {
    id: 'confidence',
    name: 'Confidence',
    description: 'Bold Professional',
    psychology: 'Appeals to ambitious professionals, executives, consultants',
    isPro: false,
    colors: {
      background: '#1e3c72',
      backgroundGradient: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)',
      text: '#FFFFFF',
      textSecondary: '#E6F2FF'
    }
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Artistic Expression',
    psychology: 'Attracts artists, designers, content creators, influencers',
    isPro: false,
    colors: {
      background: '#ff6b6b',
      backgroundGradient: 'linear-gradient(180deg, #ff6b6b 0%, #feca57 100%)',
      text: '#FFFFFF',
      textSecondary: '#FFF4E6'
    }
  },
  {
    id: 'fresh',
    name: 'Fresh',
    description: 'Modern Minimalist',
    psychology: 'Appeals to tech enthusiasts, startups, clean lifestyle brands',
    isPro: false,
    colors: {
      background: '#48cae4',
      backgroundGradient: 'linear-gradient(180deg, #48cae4 0%, #6bb6ff 100%)',
      text: '#FFFFFF',
      textSecondary: '#E6F7FF'
    }
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Friendly & Approachable',
    psychology: 'Perfect for coaches, therapists, wellness, hospitality',
    isPro: false,
    colors: {
      background: '#ff9a8b',
      backgroundGradient: 'linear-gradient(180deg, #ff9a8b 0%, #f4b5a6 100%)',
      text: '#FFFFFF',
      textSecondary: '#FFF0E0'
    }
  },
  {
    id: 'energy',
    name: 'Energy',
    description: 'Dynamic & Vibrant',
    psychology: 'Appeals to fitness trainers, motivational speakers, lifestyle brands',
    isPro: false,
    colors: {
      background: '#a8edea',
      backgroundGradient: 'linear-gradient(180deg, #4fb3b3 0%, #e8a5b8 100%)',
      text: '#FFFFFF',
      textSecondary: '#F0FDF4'
    }
  },
  // PRO EXCLUSIVE THEMES (3 premium)
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Premium & Sophisticated',
    psychology: 'High-end brands, luxury services, exclusive experiences',
    isPro: true,
    colors: {
      background: '#d4af37',
      backgroundGradient: 'linear-gradient(180deg, #d4af37 0%, #e6c200 100%)',
      text: '#FFFFFF',
      textSecondary: '#FFF8DC'
    }
  },
  {
    id: 'mystery',
    name: 'Mystery',
    description: 'Dark & Intriguing',
    psychology: 'Appeals to gamers, tech specialists, night economy, exclusive clubs',
    isPro: true,
    colors: {
      background: '#1a1a2e',
      backgroundGradient: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      text: '#FFFFFF',
      textSecondary: '#CBD5E1'
    }
  },
  {
    id: 'innovation',
    name: 'Innovation',
    description: 'Future-Forward',
    psychology: 'Tech innovators, AI specialists, cutting-edge industries',
    isPro: true,
    colors: {
      background: '#667eea',
      backgroundGradient: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
      text: '#FFFFFF',
      textSecondary: '#F3E8FF'
    }
  }
];

interface ThemeSelectorProps {
  profileId: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ profileId }) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('confidence');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const planFeatures = usePlanFeatures();

  useEffect(() => {
    const loadCurrentTheme = async () => {
      setInitialLoading(true);
      const result = await ThemeService.getThemePreference(profileId);
      if (result.themePreference) {
        setSelectedTheme(result.themePreference);
      }
      setInitialLoading(false);
    };

    loadCurrentTheme();
  }, [profileId]);

  const handleThemeChange = async (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    
    // Check if user is trying to select a Pro theme without Pro plan
    if (theme?.isPro && planFeatures.isFreeUser) {
      toast.error('This theme is available with Pro plan. Upgrade to unlock premium themes!');
      return;
    }

    setLoading(true);
    const result = await ThemeService.updateThemePreference(profileId, themeId);
    
    if (result.success) {
      setSelectedTheme(themeId);
      toast.success('Theme updated successfully!');
    } else {
      toast.error(result.error || 'Failed to update theme');
    }
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Palette className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Profile Theme</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base leading-relaxed">
            Loading current theme...
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading themes...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Palette className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>Profile Themes</span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base leading-relaxed">
          Choose a theme that reflects your personality and professional brand
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {themes.map((theme) => (
            <motion.div
              key={theme.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                variant={selectedTheme === theme.id ? "default" : "outline"}
                onClick={() => handleThemeChange(theme.id)}
                disabled={loading || (theme.isPro && planFeatures.isFreeUser)}
                className={`w-full h-auto p-3 sm:p-4 flex flex-col items-center gap-2 sm:gap-3 relative overflow-hidden min-h-[140px] sm:min-h-[160px] touch-manipulation border-2 transition-all duration-200
                  ${selectedTheme === theme.id ?
                    'border-blue-700 dark:border-yellow-400 ring-2 ring-blue-400 dark:ring-yellow-300 bg-gradient-to-br from-blue-50 to-blue-200 dark:from-yellow-900/30 dark:to-yellow-800/20 shadow-2xl' :
                    theme.isPro && planFeatures.isFreeUser ?
                    'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60 cursor-not-allowed' :
                    'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-md'}
                `}
              >
                {/* Pro badge */}
                {theme.isPro && (
                  <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    PRO
                  </Badge>
                )}

                {/* Theme preview with top-to-bottom gradient */}
                <div 
                  className="w-full h-8 sm:h-10 rounded-md border border-gray-200 dark:border-gray-700 flex-shrink-0 mt-2"
                  style={{ background: theme.colors.backgroundGradient }}
                />
                
                {/* Theme info */}
                <div className="text-center w-full flex-1 flex flex-col justify-center">
                  <div className="font-semibold text-sm sm:text-base leading-tight mb-1">{theme.name}</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-tight mb-2">
                    {theme.description}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 leading-tight line-clamp-2">
                    {theme.psychology}
                  </div>
                </div>

                {/* Selected indicator */}
                {selectedTheme === theme.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-lg z-10"
                  >
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                  </motion.div>
                )}

                {/* Loading state overlay */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-md"
                  >
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  </motion.div>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
        
        
      </CardContent>
    </Card>
  );
};

export default ThemeSelector; 