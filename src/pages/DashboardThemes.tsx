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
import { Palette, Sparkles, Layout, Grid, List, Image, Upload, X, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { MobileProfilePreview } from '@/components/MobileProfilePreview';

export default function DashboardThemes() {
  useAuthGuard();
  const { profile, setProfile } = useProfile();
  const planFeatures = usePlanFeatures();
  const [socialLayoutStyle, setSocialLayoutStyle] = useState(profile?.social_layout_style || 'horizontal');
  const [customBackground, setCustomBackground] = useState<string | null>((profile as any)?.custom_background || null);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // Update local state when profile changes
  useEffect(() => {
    if (profile) {
      setSocialLayoutStyle(profile.social_layout_style || 'horizontal');
      setCustomBackground((profile as any)?.custom_background || null);
    }
  }, [profile]);

  // Immediate refresh for all theme changes
  useEffect(() => {
    if (profile) {
      // Force immediate refresh with timestamp to ensure uniqueness
      const newKey = Date.now();
      setPreviewKey(newKey);
    }
  }, [
    profile?.theme_preference, 
    profile?.wallpaper_preference, 
    profile?.style_settings,
    profile?.social_layout_style,
    profile?.custom_background,
    profile?.name,
    profile?.title,
    profile?.bio,
    profile?.avatar_url,
    profile?.links
  ]);

  const refreshPreview = () => {
    // Force immediate refresh with timestamp to ensure uniqueness
    setPreviewKey(Date.now());
  };

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

      // Update profile with new background
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ custom_background: backgroundUrl } as any)
        .eq('id', profile?.id);

      if (updateError) throw updateError;

      setCustomBackground(backgroundUrl);
      if (setProfile) {
        setProfile({ ...profile, custom_background: backgroundUrl } as any);
      }
      
      toast.success('Background uploaded successfully');
    } catch (error) {
      console.error('Error uploading background:', error);
      toast.error('Failed to upload background');
    } finally {
      setUploadingBackground(false);
    }
  };

  const removeCustomBackground = async () => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ custom_background: null } as any)
        .eq('id', profile.id);

      if (error) throw error;

      setCustomBackground(null);
      if (setProfile) {
        setProfile({ ...profile, custom_background: null } as any);
      }
      
      toast.success('Background removed successfully');
    } catch (error) {
      console.error('Error removing background:', error);
      toast.error('Failed to remove background');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-1 sm:px-2 lg:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Customize Your Profile
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Personalize your profile appearance with themes, wallpapers, and styles
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="flex gap-8">
          {/* Left Column - Theme Content - Responsive */}
          <div className="flex-1 space-y-4 lg:pr-96">
            {/* How Themes Work */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.02, duration: 0.2 }}
            >
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-white">
                    <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span>How Themes Work</span>
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Create a professional profile that matches your personal brand
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">1</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-0.5">Choose Your Theme</p>
                        <p className="leading-tight text-xs">Select from our curated collection of professional color themes.</p>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-600 dark:text-purple-400 font-bold text-xs">2</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-0.5">Automatic Application</p>
                        <p className="leading-tight text-xs">Your theme is instantly applied to your public profile with optimized colors.</p>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 font-bold text-xs">3</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-0.5">Share & Impress</p>
                        <p className="leading-tight text-xs">Your contacts will see your beautifully themed profile when they visit your link.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Theme Selector */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.2 }}
            >
              {profile?.id && (
                <ThemeSelector profileId={profile.id} />
              )}
            </motion.div>

            {/* Wallpaper Selector */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.2 }}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {profile?.id && (
                <StyleSelector 
                  profileId={profile.id}
                  currentStyle={profile.style_settings as any}
                  onStyleChange={(style) => {
                    if (setProfile) {
                      setProfile({ ...profile, style_settings: style as any });
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.2 }}
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
                          onClick={() => document.getElementById('background-upload')?.click()}
                          disabled={uploadingBackground}
                          className="w-full"
                        >
                          {uploadingBackground ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Change Background
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={removeCustomBackground}
                          variant="outline"
                          className="w-full"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove Background
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          No custom background uploaded
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Upload an image to use as your profile background
                        </p>
                      </div>
                      <Button
                        onClick={() => document.getElementById('background-upload')?.click()}
                        disabled={uploadingBackground}
                        className="w-full"
                      >
                        {uploadingBackground ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Background
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  <input
                    id="background-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Mobile Preview - Responsive */}
          <div className="hidden lg:block w-80 flex-shrink-0 fixed right-8 top-8 bottom-8 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="text-center mb-2 flex-shrink-0">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Preview
                </h3>
              </div>
              
              {/* Vertical Separator Line */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
              
              {/* Mobile Preview - Centered */}
              <div className="flex-1 flex items-center justify-center px-2">
                {profile ? (
                  <MobileProfilePreview key={previewKey} profile={profile} />
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <Sparkles className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">Loading...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Preview - Bottom Section */}
        <div className="lg:hidden mt-8">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-white">
                <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span>Live Preview</span>
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                See how your profile looks on mobile devices
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-center">
                {profile ? (
                  <MobileProfilePreview key={previewKey} profile={profile} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Loading preview...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 