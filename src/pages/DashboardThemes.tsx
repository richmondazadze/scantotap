import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useProfile } from '@/contexts/ProfileContext';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { ThemeSelector } from '@/components/ThemeSelector';
import WallpaperSelector from '@/components/WallpaperSelector';
import StyleSelector from '@/components/StyleSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Sparkles, Layout, Grid, List, Image, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function DashboardThemes() {
  useAuthGuard();
  const { profile, setProfile } = useProfile();
  const planFeatures = usePlanFeatures();
  const [socialLayoutStyle, setSocialLayoutStyle] = useState(profile?.social_layout_style || 'horizontal');
  const [customBackground, setCustomBackground] = useState<string | null>((profile as any)?.custom_background || null);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  // Update local state when profile changes
  useEffect(() => {
    if (profile) {
      setSocialLayoutStyle(profile.social_layout_style || 'horizontal');
      setCustomBackground((profile as any)?.custom_background || null);
    }
  }, [profile]);

  const handleSocialLayoutChange = async (newStyle: string) => {
    if (newStyle === 'grid' && planFeatures.isFreeUser) {
      toast.error('Grid layout is available with Pro plan');
      return;
    }

    setSocialLayoutStyle(newStyle);
    
    if (profile?.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ social_layout_style: newStyle })
          .eq('id', profile.id);
        
        if (error) throw error;
        
        setProfile({ ...profile, social_layout_style: newStyle });
        toast.success(`Layout changed to ${newStyle === 'grid' ? 'Grid' : 'Horizontal'}`);
      } catch (err) {
        console.error('Failed to update layout style:', err);
        toast.error('Failed to update layout style');
        setSocialLayoutStyle(profile?.social_layout_style || 'horizontal');
      }
    }
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if user is Pro for custom backgrounds
    if (planFeatures.isFreeUser) {
      toast.error('Custom background images are available with Pro plan');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingBackground(true);

    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}/background-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-backgrounds')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-backgrounds')
        .getPublicUrl(fileName);

      const backgroundUrl = urlData.publicUrl;

      // Update profile with custom background
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ custom_background: backgroundUrl } as any)
        .eq('id', profile?.id);

      if (updateError) throw updateError;

      setCustomBackground(backgroundUrl);
      setProfile({ ...profile, custom_background: backgroundUrl } as any);
      toast.success('Custom background uploaded successfully!');

    } catch (error) {
      console.error('Error uploading background:', error);
      toast.error('Failed to upload background image');
    } finally {
      setUploadingBackground(false);
    }
  };

  const removeCustomBackground = async () => {
    if (!customBackground) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ custom_background: null } as any)
        .eq('id', profile?.id);

      if (error) throw error;

      setCustomBackground(null);
      setProfile({ ...profile, custom_background: null } as any);
      toast.success('Custom background removed');

    } catch (error) {
      console.error('Error removing background:', error);
      toast.error('Failed to remove background');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-8 pt-4 sm:pt-6 lg:pt-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-start sm:items-center gap-3 mb-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              Profile Themes & Layout
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              Customize your profile's appearance and layout
            </p>
          </div>
        </div>
      </motion.div>

      {/* How Themes Work */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base">How Themes Work</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 sm:pb-4">
            <div className="space-y-2 sm:space-y-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">1</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-0.5">Choose Your Theme</p>
                  <p className="leading-tight">Select from our curated collection of professional color themes.</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-xs">2</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-0.5">Automatic Application</p>
                  <p className="leading-tight">Your theme is instantly applied to your public profile with optimized colors.</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 dark:text-green-400 font-bold text-xs">3</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-0.5">Share & Impress</p>
                  <p className="leading-tight">Your contacts will see your beautifully themed profile when they visit your link.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Theme Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {profile?.id && (
          <ThemeSelector profileId={profile.id} />
        )}
      </motion.div>

      {/* Wallpaper Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {profile?.id && (
          <WallpaperSelector 
            profileId={profile.id}
            currentWallpaper={profile.wallpaper_preference}
            onWallpaperChange={(wallpaper) => {
              if (setProfile) {
                setProfile({ ...profile, wallpaper_preference: wallpaper });
              }
            }}
          />
        )}
      </motion.div>

      {/* Style Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {profile?.id && (
          <StyleSelector 
            profileId={profile.id}
            currentStyle={profile.style_settings as any}
            onStyleChange={(style) => {
              if (setProfile) {
                setProfile({ ...profile, style_settings: style });
              }
            }}
            socialLayoutStyle={socialLayoutStyle}
            onSocialLayoutChange={handleSocialLayoutChange}
            isFreeUser={planFeatures.isFreeUser}
          />
        )}
      </motion.div>



      {/* Custom Background Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-white">
              <Image className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span>Custom Background Image</span>
              {planFeatures.isFreeUser && (
                <Badge variant="secondary" className="bg-purple-500 dark:bg-purple-400 text-white dark:text-purple-900 text-xs px-2 py-1 ml-2 font-medium">
                  PRO
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Upload a custom background image for your profile page. This will replace the theme gradient with your own image.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {customBackground ? (
              <div className="space-y-4">
                {/* Current Background Preview */}
                <div className="relative">
                  <img
                    src={customBackground}
                    alt="Custom background"
                    className="w-full h-32 sm:h-40 object-cover object-center rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Current Background</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={removeCustomBackground}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Background
                  </Button>
                  <label className="w-full">
                    <Button
                      variant="outline"
                      disabled={uploadingBackground || planFeatures.isFreeUser}
                      className="w-full"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingBackground ? 'Uploading...' : 'Change Background'}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="hidden"
                      disabled={uploadingBackground || planFeatures.isFreeUser}
                    />
                  </label>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  On mobile, your background image will be centered and best-fit for your screen.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Upload Area */}
                <label className={`block ${planFeatures.isFreeUser ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    planFeatures.isFreeUser 
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 opacity-60'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}>
                    <Upload className={`w-8 h-8 mx-auto mb-3 ${
                      planFeatures.isFreeUser ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <h3 className={`font-medium mb-2 ${
                      planFeatures.isFreeUser ? 'text-gray-500' : 'text-gray-900 dark:text-white'
                    }`}>
                      {uploadingBackground ? 'Uploading...' : 'Upload Custom Background'}
                    </h3>
                    <p className={`text-xs ${
                      planFeatures.isFreeUser ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Click to select an image file (JPG, PNG, WebP)
                      <br />
                      Maximum size: 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                    disabled={uploadingBackground || planFeatures.isFreeUser}
                  />
                </label>
                
                {planFeatures.isFreeUser && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-700 dark:text-purple-300 text-center">
                      Custom background images are available with Pro plan for a truly personalized profile
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>




    </div>
  );
} 