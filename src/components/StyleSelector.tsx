import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout, List, Grid } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface StyleSettings {
  fill: 'solid' | 'glass' | 'outline';
  corners: 'sharp' | 'curved' | 'round';
  shadow: 'none' | 'subtle' | 'hard';
  textColor: 'auto' | 'white' | 'black' | 'gray' | 'dark';
}

interface StyleSelectorProps {
  profileId: string;
  currentStyle: StyleSettings | null;
  onStyleChange: (style: StyleSettings) => void;
  socialLayoutStyle?: string;
  onSocialLayoutChange?: (style: string) => void;
  isFreeUser?: boolean;
}

const FILL_OPTIONS = [
  { id: 'solid', label: 'Solid', icon: 'paint-bucket', isPro: false },
  { id: 'glass', label: 'Glass', icon: 'circle-half-tilt', isPro: true },
  { id: 'outline', label: 'Outline', icon: 'circle', isPro: false }
];

const CORNER_OPTIONS = [
  { id: 'sharp', label: 'Sharp', icon: 'sharp-corner', isPro: false },
  { id: 'curved', label: 'Curved', icon: 'rounded-corner', isPro: false },
  { id: 'round', label: 'Round', icon: 'half-circle', isPro: false }
];

const SHADOW_OPTIONS = [
  { id: 'none', label: 'None', icon: 'diamond', isPro: false },
  { id: 'subtle', label: 'Subtle', icon: 'layers-two', isPro: false },
  { id: 'hard', label: 'Hard', icon: 'layers-filled', isPro: false }
];

const TEXT_COLOR_OPTIONS = [
  { id: 'auto', label: 'Auto', icon: 'palette', isPro: false },
  { id: 'white', label: 'White', icon: 'circle-white', isPro: false },
  { id: 'black', label: 'Black', icon: 'circle-black', isPro: false },
  { id: 'gray', label: 'Gray', icon: 'circle-gray', isPro: false },
  { id: 'dark', label: 'Dark', icon: 'circle-dark', isPro: false }
];





const StyleSelector: React.FC<StyleSelectorProps> = ({ 
  profileId, 
  currentStyle, 
  onStyleChange, 
  socialLayoutStyle = 'horizontal',
  onSocialLayoutChange,
  isFreeUser = false
}) => {
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    fill: 'solid',
    corners: 'sharp',
    shadow: 'none',
    textColor: 'auto'
  });



  useEffect(() => {
    if (currentStyle) {
      setStyleSettings(currentStyle);
    }
  }, [currentStyle]);

  const handleStyleChange = async (category: keyof StyleSettings, value: any) => {
    const newSettings = {
      ...styleSettings,
      [category]: value
    };
    
    setStyleSettings(newSettings);
    onStyleChange(newSettings);
    await saveStyleToDatabase(newSettings);
  };

  const saveStyleToDatabase = async (settings: StyleSettings) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ style_settings: settings as any })
        .eq('id', profileId);

      if (error) {
        console.error('Error saving style settings:', error);
        toast.error('Failed to save style settings');
      } else {
  
        toast.success('Style updated successfully!');
      }
    } catch (error) {
      console.error('Error saving style settings:', error);
    }
  };



  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'half-circle':
        return (
          <img 
            src={`/svg/${iconName}.svg`} 
            alt={iconName}
            className="w-6 h-6 transform rotate-180"
          />
        );
      default:
        return (
          <img 
            src={`/svg/${iconName}.svg`} 
            alt={iconName}
            className="w-6 h-6"
          />
        );
    }
  };

  const renderOptionButton = (option: any, category: keyof StyleSettings, currentValue: any) => {
    const isSelected = currentValue === option.id;
    
    return (
      <button
        key={option.id}
        onClick={() => handleStyleChange(category, option.id)}
        className={`
          relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
          ${isSelected 
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md dark:shadow-blue-500/10' 
            : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
          }
        `}
      >
        {option.isPro && (
          <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs px-2 py-1 bg-purple-500 dark:bg-purple-400 text-white dark:text-purple-900 font-medium">
            PRO
          </Badge>
        )}
        <div className="text-gray-700 dark:text-gray-200 mb-2">
          {renderIcon(option.icon)}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{option.label}</span>
      </button>
    );
  };

  const renderTextColorOption = (option: any, currentValue: string) => {
    const isSelected = currentValue === option.id;
    
    const getColorPreview = (colorId: string) => {
      switch (colorId) {
        case 'auto':
          return 'bg-gradient-to-r from-gray-400 to-gray-600';
        case 'white':
          return 'bg-white border border-gray-300';
        case 'black':
          return 'bg-black';
        case 'gray':
          return 'bg-gray-500';
        case 'dark':
          return 'bg-gray-800';
        default:
          return 'bg-gray-400';
      }
    };
    
    return (
      <button
        key={option.id}
        type="button"
        onClick={() => handleStyleChange('textColor', option.id)}
        className={`p-3 rounded-lg border-2 transition-all text-sm ${
          isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
        }`}
      >
        <div className="text-center">
          <div className={`w-8 h-8 mx-auto mb-2 rounded-full ${getColorPreview(option.id)}`}></div>
          <div className="font-medium text-xs">{option.label}</div>
        </div>
      </button>
    );
  };



  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-white">
          <img src="/svg/palette.svg" alt="Palette" className="w-5 h-5 dark:invert" />
          <span>Style Customization</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Element Styling Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fill Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Fill Style</h3>
              <div className="grid grid-cols-1 gap-3">
                {FILL_OPTIONS.map(option => 
                  renderOptionButton(option, 'fill', styleSettings.fill)
                )}
              </div>
            </div>

            {/* Corners Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Corner Style</h3>
              <div className="grid grid-cols-1 gap-3">
                {CORNER_OPTIONS.map(option => 
                  renderOptionButton(option, 'corners', styleSettings.corners)
                )}
              </div>
            </div>

            {/* Shadow Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Shadow Style</h3>
              <div className="grid grid-cols-1 gap-3">
                {SHADOW_OPTIONS.map(option => 
                  renderOptionButton(option, 'shadow', styleSettings.shadow)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Text Color Section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Text Color</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose the text color for your profile elements
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {TEXT_COLOR_OPTIONS.map(option => 
              renderTextColorOption(option, styleSettings.textColor)
            )}
          </div>
        </div>

        {/* Profile Display Style Section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Profile Display Style</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose how your social media links appear on your profile page
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onSocialLayoutChange?.('horizontal')}
              className={`p-4 rounded-lg border-2 transition-all text-sm ${
                socialLayoutStyle === 'horizontal'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <List className="w-6 h-6 mx-auto mb-2 text-current" />
                <div className="font-medium mb-1">Horizontal Layout</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Full-width cards stacked vertically</div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => onSocialLayoutChange?.('grid')}
              disabled={isFreeUser}
              className={`p-4 rounded-lg border-2 transition-all relative text-sm ${
                socialLayoutStyle === 'grid'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : isFreeUser
                  ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs px-2 py-1 bg-purple-500 dark:bg-purple-400 text-white dark:text-purple-900 font-medium">
                PRO
              </Badge>
              <div className="text-center">
                <Grid className="w-6 h-6 mx-auto mb-2 text-current" />
                <div className="font-medium mb-1">Grid Layout</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Square cards in rows</div>
              </div>
            </button>
          </div>
          
          {isFreeUser && (
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-700 dark:text-purple-300 text-center">
                Grid layout is available with Pro plan for a more compact, professional look
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleSelector; 