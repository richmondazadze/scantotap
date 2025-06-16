import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useProfile } from '@/contexts/ProfileContext';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { SubscriptionService } from '@/services/subscriptionService';
import { PaystackService } from '@/services/paystackService';
import { SubscriptionStateManager } from '@/utils/subscriptionStateManager';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
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
  X,
  Crown,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Link
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
  const planFeatures = usePlanFeatures();
  const [searchParams] = useSearchParams();
  
  // Get section from URL parameters
  const urlSection = searchParams.get('section');
  
  // State management
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(urlSection || 'account');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);
  
  // Subscription state
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  
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

  const loadSubscriptionDetails = async () => {
    if (!session?.user?.id) return;
    
    setSubscriptionLoading(true);
    try {
      const details = await SubscriptionService.getSubscriptionDetails(session.user.id);
      setSubscriptionDetails(details);
    } catch (error) {
      console.error('Error loading subscription details:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleUpgrade = async (planType: 'monthly' | 'annually') => {
    if (!session?.user || !session.user.email) {
      toast.error('User information not available');
      return;
    }

    setUpgrading(true);
    try {
      // Use the new state manager for better handling of re-subscriptions
      const result = await SubscriptionStateManager.handleSubscription(
        session.user.id,
        session.user.email,
        'User', // You might want to get the actual name from profile
        planType
      );

      if (result.success) {
        toast.success('Redirecting to payment...');
        // Payment will be handled by Paystack popup
      } else {
        toast.error(result.error || 'Failed to initiate upgrade');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to initiate upgrade. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      // Use the new state manager for better cancellation handling
      const result = await SubscriptionStateManager.cancelSubscription(session.user.id);
      
      if (result.success) {
        toast.success('Subscription cancelled successfully');
        await loadSubscriptionDetails(); // Refresh subscription details
        setCancelDialogOpen(false);
      } else {
        toast.error(result.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = () => {
    setBillingDialogOpen(true);
  };

  const handleUpdatePaymentMethod = async () => {
    if (!session?.user || !session.user.email) {
      toast.error('User information not available');
      return;
    }

    try {
      // Create a new payment session to update payment method
      const result = await PaystackService.upgradeSubscription(
        session.user.id,
        session.user.email,
        'User',
        'monthly' // This will be used to determine the flow, but won't create a new subscription
      );

      toast.success('Redirecting to update payment method...');
      setBillingDialogOpen(false);
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error('Failed to update payment method. Please try again.');
    }
  };

  // Load user settings
  useEffect(() => {
    loadUserSettings();
    loadSubscriptionDetails();
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
      // Use localStorage to store settings for now
      const savedSettings = localStorage.getItem(`user_settings_${session.user.id}`);
      if (savedSettings) {
        const loadedSettings = JSON.parse(savedSettings);
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      } else {
        setOriginalSettings(settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setOriginalSettings(settings);
    } finally {
      setInitialLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    try {
      // Store in localStorage for now since user_settings table doesn't exist
      if (session?.user?.id) {
        localStorage.setItem(`user_settings_${session.user.id}`, JSON.stringify(settings));
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
      // Store in localStorage for now
      localStorage.setItem(`user_settings_${session.user.id}`, JSON.stringify(settings));
      
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
    { id: 'subscription', label: 'Subscription', icon: Crown },
  ];

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false); // Close mobile menu when section changes
  };

  // Card styles - updated to match other dashboard pages
  const cardBase = 'relative rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10 bg-white/95 dark:bg-[#1A1D24]/95 border border-gray-200/50 dark:border-scan-blue/20 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:bg-white dark:hover:bg-[#1A1D24] hover:border-gray-300/60 dark:hover:border-scan-blue/30';
  const cardTitle = 'text-xl sm:text-2xl lg:text-3xl font-bold mb-3 text-gray-900 dark:text-white bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent';
  const cardDesc = 'text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed';

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
              <h1 className={cardTitle}>
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
                className="min-w-[140px] rounded-xl bg-gradient-to-r from-scan-blue to-scan-purple hover:from-scan-blue/90 hover:to-scan-purple/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
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
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-xl mx-2 ${
                        activeSection === section.id 
                          ? 'bg-gradient-to-r from-scan-blue/10 to-scan-purple/10 text-scan-blue border border-scan-blue/20' 
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
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-xl ${
                          activeSection === section.id 
                            ? 'bg-gradient-to-r from-scan-blue/10 to-scan-purple/10 text-scan-blue border border-scan-blue/20' 
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

          {/* Subscription Section */}
          {activeSection === 'subscription' && (
            <div className="space-y-6">
              {subscriptionLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
                      <p className="text-gray-600 dark:text-gray-300">Loading subscription details...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Current Plan Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Crown className="w-5 h-5" />
                        Current Plan
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        Your subscription details and usage
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Plan Status */}
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-scan-blue/5 to-scan-purple/5 border border-scan-blue/20">
                        <div className="flex items-center gap-3">
                          {planFeatures.planType === 'pro' ? (
                            <Crown className="w-6 h-6 text-scan-blue" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                              🆓
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-lg">
                              {planFeatures.planType === 'pro' ? 'Pro Plan' : 'Free Plan'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {planFeatures.planType === 'pro' 
                                ? 'Unlimited features and premium support'
                                : 'Basic features with limited usage'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge 
                            variant={subscriptionDetails?.isActive ? "default" : "secondary"}
                            className={
                              subscriptionDetails?.isActive 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                : planFeatures.planType === 'pro' && subscriptionDetails?.status === 'cancelled'
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                : ""
                            }
                          >
                            {planFeatures.planType === 'free' 
                              ? 'Active' 
                              : subscriptionDetails?.isActive 
                              ? 'Active' 
                              : subscriptionDetails?.status === 'cancelled' 
                              ? 'Inactive' 
                              : 'Inactive'
                            }
                          </Badge>
                          
                          {/* Cancellation Notice */}
                          {planFeatures.planType === 'pro' && 
                           subscriptionDetails?.status === 'cancelled' && 
                           subscriptionDetails?.expiresAt && 
                           new Date(subscriptionDetails.expiresAt) > new Date() && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 text-right">
                              Reverts to Free on {new Date(subscriptionDetails.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Cancellation Warning for Pro Users with Cancelled Subscription */}
                      {planFeatures.planType === 'pro' && 
                       subscriptionDetails?.status === 'cancelled' && 
                       subscriptionDetails?.expiresAt && 
                       new Date(subscriptionDetails.expiresAt) > new Date() && (
                        <div className="p-4 border border-orange-200 rounded-lg bg-orange-50/50 dark:bg-orange-950/20">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-medium text-orange-900 dark:text-orange-200 mb-2">
                                Subscription Cancelled
                              </h4>
                              <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                                Your Pro subscription has been cancelled but remains active until{' '}
                                <strong>{new Date(subscriptionDetails.expiresAt).toLocaleDateString()}</strong>.
                                After this date, your account will automatically revert to the Free plan.
                              </p>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button 
                                  onClick={() => handleUpgrade('monthly')}
                                  disabled={upgrading}
                                  size="sm"
                                  className="bg-gradient-to-r from-scan-blue to-scan-purple text-white"
                                >
                                  {upgrading ? 'Processing...' : 'Reactivate Subscription'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Plan Features */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Link className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">Social Links</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                            {planFeatures.maxLinks === Infinity ? 'Unlimited' : `Up to ${planFeatures.maxLinks}`}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">Card Designs</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                            {planFeatures.canOrderPremiumCards ? 'All designs' : 'Basic only'}
                          </p>
                        </div>
                      </div>

                      {/* Subscription Details for Pro Users */}
                      {subscriptionDetails?.isActive && planFeatures.planType === 'pro' && (
                        <>
                          <Separator />
                          <div className="space-y-4">
                            <h4 className="font-medium">Subscription Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Status:</span>
                                <p className="font-medium capitalize">{subscriptionDetails.status}</p>
                              </div>
                              {subscriptionDetails.expiresAt && (
                                <div>
                                  <span className="text-gray-500">Next billing:</span>
                                  <p className="font-medium">
                                    {new Date(subscriptionDetails.expiresAt).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              {subscriptionDetails.daysRemaining && subscriptionDetails.daysRemaining > 0 && (
                                <div>
                                  <span className="text-gray-500">Days remaining:</span>
                                  <p className="font-medium">{subscriptionDetails.daysRemaining} days</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Upgrade/Manage Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Settings className="w-5 h-5" />
                        Manage Subscription
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        Upgrade your plan or manage your subscription
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {planFeatures.planType === 'free' ? (
                        /* Upgrade Options for Free Users */
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-gradient-to-r from-scan-blue/5 to-scan-purple/5 border border-scan-blue/20">
                            <div className="flex items-start gap-3">
                              <Crown className="w-5 h-5 text-scan-blue mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-scan-blue mb-2">Upgrade to Pro</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                  Get unlimited links, premium card designs, and priority support.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button 
                                    onClick={() => handleUpgrade('monthly')}
                                    disabled={upgrading}
                                    className="bg-gradient-to-r from-scan-blue to-scan-purple text-white"
                                  >
                                    {upgrading ? 'Processing...' : 'Upgrade Monthly ($4/mo)'}
                                  </Button>
                                  <Button 
                                    onClick={() => handleUpgrade('annually')}
                                    disabled={upgrading}
                                    variant="outline"
                                    className="border-scan-blue text-scan-blue hover:bg-scan-blue hover:text-white"
                                  >
                                    {upgrading ? 'Processing...' : 'Upgrade Annually ($40/yr)'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Manage Options for Pro Users */
                        <div className="space-y-4">
                          {/* Billing Portal Link */}
                          <div className="p-4 rounded-lg border">
                            <div className="flex items-start gap-3">
                              <CreditCard className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-medium mb-2">Payment & Billing</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  Update your payment method and view billing history.
                                </p>
                                <Button variant="outline" size="sm" onClick={handleManageBilling}>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Manage Billing
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Cancel Subscription */}
                          {subscriptionDetails?.canCancel && (
                            <div className="p-4 border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                              <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">Cancel Subscription</h4>
                                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                    Your subscription will remain active until the end of your billing period.
                                  </p>
                                  <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        Cancel Subscription
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-md">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Your subscription will be cancelled and you'll lose access to Pro features at the end of your current billing period. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                                        <AlertDialogCancel disabled={loading} className="w-full sm:w-auto">
                                          Keep Subscription
                                        </AlertDialogCancel>
                                        <AlertDialogAction asChild>
                                          <Button 
                                            variant="destructive" 
                                            onClick={handleCancelSubscription} 
                                            disabled={loading}
                                            className="w-full sm:w-auto"
                                          >
                                            {loading ? 'Cancelling...' : 'Yes, Cancel Subscription'}
                                          </Button>
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
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

      {/* Billing Management Dialog */}
      <AlertDialog open={billingDialogOpen} onOpenChange={setBillingDialogOpen}>
        <AlertDialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Manage Billing
            </AlertDialogTitle>
            <AlertDialogDescription>
              Choose how you'd like to manage your subscription billing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Current Subscription Info */}
            {subscriptionDetails && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">Current Subscription</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-medium">Pro Plan</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={subscriptionDetails.isActive ? "default" : "secondary"}>
                      {subscriptionDetails.status}
                    </Badge>
                  </div>
                  {subscriptionDetails.expiresAt && (
                    <div className="flex justify-between">
                      <span>Next billing:</span>
                      <span className="font-medium">
                        {new Date(subscriptionDetails.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Billing Actions */}
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Update Payment Method</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Change your credit card or payment details
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleUpdatePaymentMethod}>
                    Update
                  </Button>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Change Plan</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Switch between monthly and annual billing
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    setBillingDialogOpen(false);
                    window.open('/pricing?source=billing&action=change', '_blank');
                  }}>
                    Change
                  </Button>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Billing History</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View your past payments and invoices
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    toast.info('Billing history feature coming soon!');
                  }}>
                    View
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
} 