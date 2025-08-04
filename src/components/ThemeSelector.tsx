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
    fontFamily: string;
  };
}

const themes: Theme[] = [
  // AIR THEME
  {
    id: 'air',
    name: 'Air',
    description: 'Clean & Minimal',
    psychology: 'Perfect for professionals who value simplicity and clarity',
    isPro: false,
    colors: {
      background: '#f8fafc',
      backgroundGradient: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      text: '#1e293b',
      textSecondary: '#64748b',
      fontFamily: '"Link Sans Medium", ui-sans-serif, system-ui, sans-serif'
    }
  },
  // BLOCKS THEME - PRO ONLY
  {
    id: 'blocks',
    name: 'Blocks',
    description: 'Bold & Geometric',
    psychology: 'Ideal for designers, architects, and creative professionals',
    isPro: true,
    colors: {
      background: '#8b5cf6',
      backgroundGradient: 'linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)',
      text: '#ffffff',
      textSecondary: '#f3e8ff',
      fontFamily: '"Georgia", "Times New Roman", serif'
    }
  },
  // BLOOM THEME - PRO ONLY
  {
    id: 'bloom',
    name: 'Bloom',
    description: 'Vibrant & Dynamic',
    psychology: 'Great for entrepreneurs, influencers, and energetic personalities',
    isPro: true,
    colors: {
      background: '#dc2626',
      backgroundGradient: 'linear-gradient(180deg, #dc2626 0%, #ea580c 100%)',
      text: '#ffffff',
      textSecondary: '#fef3c7',
      fontFamily: '"Courier New", "Courier", monospace'
    }
  },
  // BREEZE THEME - PRO ONLY
  {
    id: 'breeze',
    name: 'Breeze',
    description: 'Soft & Serene',
    psychology: 'Perfect for wellness professionals, therapists, and calming brands',
    isPro: true,
    colors: {
      background: '#fce7f3',
      backgroundGradient: 'linear-gradient(180deg, #fce7f3 0%, #fbcfe8 100%)',
      text: '#374151',
      textSecondary: '#6b7280',
      fontFamily: '"Playfair Display", "Georgia", serif'
    }
  },
  // LAKE THEME
  {
    id: 'lake',
    name: 'Lake',
    description: 'Deep & Mysterious',
    psychology: 'Ideal for tech professionals, consultants, and sophisticated brands',
    isPro: false,
    colors: {
      background: '#0f172a',
      backgroundGradient: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      text: '#ffffff',
      textSecondary: '#cbd5e1',
      fontFamily: '"Verdana", "Geneva", sans-serif'
    }
  },
  // MINERAL THEME
  {
    id: 'mineral',
    name: 'Mineral',
    description: 'Natural & Grounded',
    psychology: 'Perfect for environmentalists, health professionals, and organic brands',
    isPro: false,
    colors: {
      background: '#fdefe3',
      backgroundGradient: 'linear-gradient(180deg, #fdefe3 0%, #f5e6d3 100%)',
      text: '#292524',
      textSecondary: '#78716c',
      fontFamily: '"Trebuchet MS", "Lucida Grande", sans-serif'
    }
  }
];

interface ThemeSelectorProps {
  profileId: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ profileId }) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('air');
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
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
                className={`w-full h-auto p-0 flex flex-col items-center gap-3 relative overflow-hidden min-h-[180px] sm:min-h-[200px] touch-manipulation border-2 transition-all duration-200 bg-white dark:bg-gray-900
                  ${selectedTheme === theme.id ?
                    'border-blue-600 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800 shadow-lg' :
                    theme.isPro && planFeatures.isFreeUser ?
                    'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60 cursor-not-allowed' :
                    theme.isPro ?
                    'border-amber-300 hover:border-amber-400 hover:shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 shadow-md' :
                    'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-md'}
                `}
              >
                {/* Pro badge */}
                {theme.isPro && (
                  <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 flex items-center gap-1 z-20 shadow-lg">
                    <Zap className="w-3 h-3" />
                    PRO
                  </Badge>
                )}

                {/* Theme preview with background gradient */}
                <div 
                  className="w-full h-20 sm:h-24 rounded-t-lg relative overflow-hidden"
                  style={{ background: theme.colors.backgroundGradient }}
                >
                  {/* Sample content preview */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className={`text-2xl sm:text-3xl font-bold theme-preview-${theme.id}`}
                      style={{ 
                        color: theme.colors.text,
                        fontFamily: theme.colors.fontFamily,
                        '--theme-font-family': theme.colors.fontFamily
                      } as React.CSSProperties}
                    >
                      Aa
                    </div>
                  </div>
                  
                  {/* Sample UI element - unique for each theme */}
                  {theme.id === 'air' && (
                    <div 
                      className="absolute bottom-3 left-3 right-3 h-3 rounded-sm border border-gray-200"
                      style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                    />
                  )}
                  {theme.id === 'blocks' && (
                    <div 
                      className="absolute bottom-3 left-3 right-3 h-4 rounded-sm"
                      style={{ backgroundColor: '#ec4899' }}
                    />
                  )}
                  {theme.id === 'bloom' && (
                    <>
                      <div className="absolute bottom-3 left-3 right-3 h-3 rounded-sm border border-white/30" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-sm"></div>
                      </div>
                    </>
                  )}
                  {theme.id === 'breeze' && (
                    <>
                      <div 
                        className="absolute bottom-3 left-3 right-3 h-3 rounded-sm"
                        style={{ backgroundColor: 'rgba(236,72,153,0.3)' }}
                      />
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-sm"></div>
                      </div>
                    </>
                  )}
                  {theme.id === 'lake' && (
                    <div 
                      className="absolute bottom-3 left-3 right-3 h-3 rounded-sm border border-gray-600"
                      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                    />
                  )}
                  {theme.id === 'mineral' && (
                    <div 
                      className="absolute bottom-3 left-3 right-3 h-3 rounded-sm border border-gray-300"
                      style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    />
                  )}
                </div>
                
                {/* Theme info */}
                <div className="text-center w-full flex-1 flex flex-col justify-center px-4 pb-4">
                  <div className="font-semibold text-sm sm:text-base leading-tight mb-1 text-gray-900 dark:text-white">{theme.name}</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-tight">
                    {theme.description}
                    {theme.isPro && (
                      <span className="block text-amber-600 font-medium mt-1">✨ Premium Theme</span>
                    )}
                  </div>
                </div>

                {/* Selected indicator */}
                {selectedTheme === theme.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-lg z-20"
                  >
                    <Check className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}

                {/* Loading state overlay */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-lg"
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