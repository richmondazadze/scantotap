import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useProfile } from '@/contexts/ProfileContext';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { ThemeSelector } from '@/components/ThemeSelector';
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

      {/* Theme Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {profile?.id && (
          <ThemeSelector profileId={profile.id} />
        )}
      </motion.div>

      {/* Profile Display Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Layout className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span>Profile Display Style</span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base leading-relaxed">
              Choose how your social media links appear on your profile page. This affects the layout and presentation of your social connections.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => handleSocialLayoutChange('horizontal')}
                className={`flex-1 p-3 sm:p-4 rounded-lg border-2 transition-all text-sm sm:text-base ${
                  socialLayoutStyle === 'horizontal'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <List className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-current" />
                  <div className="font-medium mb-1">Horizontal Layout</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Full-width cards stacked vertically</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleSocialLayoutChange('grid')}
                disabled={planFeatures.isFreeUser}
                className={`flex-1 p-3 sm:p-4 rounded-lg border-2 transition-all relative text-sm sm:text-base ${
                  socialLayoutStyle === 'grid'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : planFeatures.isFreeUser
                    ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {planFeatures.isFreeUser && (
                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    PRO
                  </div>
                )}
                <div className="text-center">
                  <Grid className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-current" />
                  <div className="font-medium mb-1">Grid Layout</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Square cards in rows</div>
                </div>
              </button>
            </div>
            
            {planFeatures.isFreeUser && (
              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-300 text-center">
                  Grid layout is available with Pro plan for a more compact, professional look
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Custom Background Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Image className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              <span>Custom Background Image</span>
              {planFeatures.isFreeUser && (
                <Badge className="bg-purple-500 text-white text-xs px-2 py-1 ml-2">
                  PRO
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base leading-relaxed">
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
                {/* Actions - stack vertically on mobile */}
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={removeCustomBackground}
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Background
                  </Button>
                  <label className="flex-1">
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
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
                  On mobile, your background image will be centered and best-fit for your screen.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Upload Area */}
                <label className={`block ${planFeatures.isFreeUser ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <div className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all ${
                    planFeatures.isFreeUser 
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 opacity-60'
                      : 'border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10'
                  }`}>
                    <Upload className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 ${
                      planFeatures.isFreeUser ? 'text-gray-400' : 'text-green-600 dark:text-green-400'
                    }`} />
                    <h3 className={`font-medium mb-2 ${
                      planFeatures.isFreeUser ? 'text-gray-500' : 'text-gray-900 dark:text-white'
                    }`}>
                      {uploadingBackground ? 'Uploading...' : 'Upload Custom Background'}
                    </h3>
                    <p className={`text-xs sm:text-sm ${
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

      {/* Theme Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
              <span>Personalize Your Profile</span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base leading-relaxed">
              Choose from our collection of beautiful themes to make your digital business card stand out. 
              Your selected theme will change the background colors and text styling on your public profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>Instant preview</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span>Optimized contrast</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                <span>Mobile friendly</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">How Themes Work</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4 sm:space-y-5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm">1</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base mb-1">Choose Your Theme</p>
                  <p className="leading-relaxed">Select from our curated collection of professional color themes.</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-xs sm:text-sm">2</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base mb-1">Automatic Application</p>
                  <p className="leading-relaxed">Your theme is instantly applied to your public profile with optimized colors.</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 dark:text-green-400 font-bold text-xs sm:text-sm">3</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base mb-1">Share & Impress</p>
                  <p className="leading-relaxed">Your contacts will see your beautifully themed profile when they visit your link.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 