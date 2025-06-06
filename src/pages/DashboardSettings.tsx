import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useProfile } from '@/contexts/ProfileContext';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Settings,
  User,
  Bell,
  Palette,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Key,
  Menu,
  X
} from 'lucide-react';

interface UserSettings {
  notifications: {
    email_orders: boolean;
    email_marketing: boolean;
  };
  preferences: {
    language: string;
    theme: string;
  };
}

export default function DashboardSettings() {
  const { session } = useAuthGuard();
  const { refreshProfile } = useProfile();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('account');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email_orders: true,
      email_marketing: false,
    },
    preferences: {
      language: 'en',
      theme: 'system',
    },
  });

  // Track if settings have changed
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<UserSettings | null>(null);

  // Load user settings
  useEffect(() => {
    loadUserSettings();
  }, [session?.user?.id]);

  // Check for changes
  useEffect(() => {
    if (originalSettings) {
      const hasChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
      setHasChanges(hasChanged);
    }
  }, [settings, originalSettings]);

  const loadUserSettings = async () => {
    if (!session?.user?.id) return;
    
    setInitialLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (data && !error) {
        const loadedSettings = data.settings || settings;
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      } else {
        // Create default settings if none exist
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      await createDefaultSettings();
    } finally {
      setInitialLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: session?.user?.id,
          settings: settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (!error) {
        setOriginalSettings(settings);
      }
    } catch (error) {
      console.error('Error creating default settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!session?.user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: session.user.id,
          settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      setOriginalSettings(settings);
      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast.success('Password updated successfully');
      setPasswordChangeOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetProfile = async () => {
    if (!session?.user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: '',
          title: '',
          bio: '',
          avatar_url: '',
          links: [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);
      
      if (error) throw error;
      await refreshProfile();
      toast.success('Profile reset successfully');
      setResetDialogOpen(false);
    } catch (error) {
      console.error('Error resetting profile:', error);
      toast.error('Failed to reset profile. Please try again.');
    } finally {
    setLoading(false);
    }
  };

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ];

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false); // Close mobile menu when section changes
  };

  if (initialLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col h-full pb-12 sm:pb-16 gap-8 mt-6 px-4 sm:px-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-gray-600 dark:text-gray-300">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col h-full pb-24 sm:pb-16 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-scan-blue dark:text-scan-blue-light mb-2">
                Account Settings
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                Manage your account preferences and profile settings
              </p>
            </div>
            
            {/* Desktop Save Button */}
            <div className="hidden sm:flex gap-2">
              <Button 
                onClick={saveSettings} 
                disabled={saving || !hasChanges}
                className="min-w-[140px]"
              >
                <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="sm:hidden">
            <Button
              variant="outline"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {sections.find(s => s.id === activeSection)?.label}
              </span>
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </motion.div>

              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
        {/* Desktop Navigation Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden sm:block lg:w-64"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg mx-2 ${
                        activeSection === section.id 
                          ? 'bg-scan-blue/10 text-scan-blue border border-scan-blue/20' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sm:hidden"
          >
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionChange(section.id)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg ${
                          activeSection === section.id 
                            ? 'bg-scan-blue/10 text-scan-blue border border-scan-blue/20' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 space-y-6"
        >
          {/* Account Section */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <User className="w-5 h-5" />
                    Account Information
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Manage your basic account information and security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Address */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <Input 
                        value={session?.user?.email || ''} 
                        disabled 
                        className="flex-1 text-sm sm:text-base min-w-0"
                      />
                      <Badge variant="outline" className="self-start sm:self-center">
                        Verified
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      This is your primary email address used for authentication
                    </p>
                  </div>

                  <Separator />

                  {/* Password Change */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Password</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <Input 
                        type="password" 
                        value="••••••••••••" 
                        disabled 
                        className="flex-1 text-sm sm:text-base min-w-0"
                      />
                      <AlertDialog open={passwordChangeOpen} onOpenChange={setPasswordChangeOpen}>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full sm:w-auto">
                            <Key className="w-4 h-4 mr-2" />
                            Change
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Change Password</AlertDialogTitle>
                            <AlertDialogDescription>
                              Enter your current password and choose a new one
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Current Password</label>
                              <div className="relative">
                                <Input
                                  type={showCurrentPassword ? "text" : "password"}
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  className="pr-12"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">New Password</label>
                              <div className="relative">
                                <Input
                                  type={showNewPassword ? "text" : "password"}
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="pr-12"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Confirm New Password</label>
                              <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                              />
                            </div>
                          </div>
                          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                            <AlertDialogCancel disabled={loading} className="w-full sm:w-auto">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Button 
                                onClick={handlePasswordChange} 
                                disabled={loading}
                                className="w-full sm:w-auto"
                              >
                                {loading ? 'Updating...' : 'Update Password'}
                              </Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <Separator />

                  {/* Reset Profile */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-red-600">Reset Profile</h4>
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <RefreshCw className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-red-900 dark:text-red-200">Reset Profile Information</p>
                          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                            Clear your profile information but keep your account and email
                          </p>
                          <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset Profile
                              </Button>
              </AlertDialogTrigger>
                            <AlertDialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Profile?</AlertDialogTitle>
                  <AlertDialogDescription>
                                  This will clear your profile information (name, title, bio, avatar, links) but keep your account and email. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                              <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                                <AlertDialogCancel disabled={loading} className="w-full sm:w-auto">
                                  Cancel
                                </AlertDialogCancel>
                  <AlertDialogAction asChild>
                                  <Button 
                                    variant="destructive" 
                                    onClick={handleResetProfile} 
                                    disabled={loading}
                                    className="w-full sm:w-auto"
                                  >
                                    {loading ? 'Resetting...' : 'Yes, Reset Profile'}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Choose when you want to receive email notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">Order Updates</p>
                        <p className="text-xs sm:text-sm text-gray-500 break-words">
                          Receive emails about your order status and shipping
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.email_orders}
                        onCheckedChange={(checked) => updateSetting('notifications', 'email_orders', checked)}
                        className="flex-shrink-0"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">Marketing & Promotions</p>
                        <p className="text-xs sm:text-sm text-gray-500 break-words">
                          Get notified about new features and special offers
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.email_marketing}
                        onCheckedChange={(checked) => updateSetting('notifications', 'email_marketing', checked)}
                        className="flex-shrink-0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Palette className="w-5 h-5" />
                    Appearance & Preferences
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Customize your experience and language settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Theme</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <ThemeSwitcher />
                      <span className="text-xs sm:text-sm text-gray-500">
                        Choose your preferred color scheme
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Language */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Language</label>
                    <select
                      className="w-full p-3 text-sm sm:text-base border rounded-md bg-background focus:ring-2 focus:ring-scan-blue focus:border-transparent"
                      value={settings.preferences.language}
                      onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="tw">Twi</option>
                      <option value="ha">Hausa</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Select your preferred language for the interface
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
      </motion.div>
      </div>

      {/* Mobile Save Button - Fixed Above Bottom Nav */}
      {hasChanges && (
        <div className="sm:hidden fixed bottom-16 left-4 right-4 z-40">
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="w-full py-3 text-base shadow-lg"
            size="lg"
          >
            <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}

      {/* Mobile Bottom Spacing for main nav */}
      <div className="sm:hidden h-20" />

    </div>
  );
} 