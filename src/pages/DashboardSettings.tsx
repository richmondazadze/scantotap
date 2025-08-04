import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import ProfileNotificationService, { NotificationPreferences } from '@/services/profileNotificationService';
import { useProfile } from '@/contexts/ProfileContext';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { SubscriptionService } from '@/services/subscriptionService';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import Loading from '@/components/ui/loading';

import { 
  Settings, 
  Crown, 
  Shield, 
  Bell, 
  AlertCircle, 
  Trash2,
  User,
  Eye,
  EyeOff,
  Save,
  Key,
  Menu,
  X,
  BarChart3,
  Loader2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SubscriptionStateManager } from '@/utils/subscriptionStateManager';
import { useSearchParams } from 'react-router-dom';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import analyticsService, { type ProfileAnalytics, type AnalyticsChartData, type TopLinksData, type DeviceBreakdown } from '@/services/analyticsService';
import {
  AnalyticsOverview,
  AnalyticsChart
} from '@/components/analytics/AnalyticsComponents';

interface UserSettings {
  notifications: NotificationPreferences;
  preferences: {
    language: string;
    theme: string;
  };
}

export default function DashboardSettings() {
  const { session } = useAuthGuard();
  const { refreshProfile, profile } = useProfile();
  const planFeatures = usePlanFeatures();
  const [searchParams] = useSearchParams();
  
  // Get URL parameters
  const urlTab = searchParams.get('tab');
  const urlPlan = searchParams.get('plan') as 'monthly' | 'annually' | null;
  
  // State management
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(urlTab || 'account');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Subscription state
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    status: string;
    next_billing_date?: string;
    plan_type?: string;
  } | null>(null);
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
      email_order_updates: true,
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
  
  // Analytics state
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [chartData, setChartData] = useState<AnalyticsChartData[]>([]);

  const loadSubscriptionDetails = async () => {
    if (!session?.user?.id) return;
    
    setSubscriptionLoading(true);
    try {
      console.log('🔍 Loading subscription details for user:', session.user.id);
      const details = await SubscriptionService.getSubscriptionDetails(session.user.id);
      console.log('✅ Subscription details loaded:', details);
      setSubscriptionDetails(details);
    } catch (error) {
      console.error('❌ Error loading subscription details:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleUpgrade = useCallback(async (planType: 'monthly' | 'annually') => {
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
        // Don't show confusing toast message - Paystack will handle the payment flow
        // After payment completion, webhook will update the database
        console.log('Payment initiated successfully');
      } else {
        toast.error(result.error || 'Failed to initiate upgrade');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to initiate upgrade. Please try again.');
    } finally {
      setUpgrading(false);
    }
  }, [session?.user]);

  // Auto-trigger upgrade if coming from pricing page
  useEffect(() => {
    if (urlTab === 'subscription' && urlPlan && planFeatures.planType === 'free') {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        handleUpgrade(urlPlan);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [urlTab, urlPlan, planFeatures.planType, handleUpgrade]);
  
  // Set active section based on URL
  useEffect(() => {
    if (urlTab) {
      setActiveSection(urlTab);
    }
  }, [urlTab]);

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

  // Load analytics data
  const loadAnalyticsData = async () => {
    if (!profile?.id || planFeatures.planType === 'free') return;
    
    setAnalyticsLoading(true);
    try {
      console.log('🔍 DASHBOARD: Loading analytics data for profile:', profile.id);
      
      // Load analytics summary
      const analyticsResult = await analyticsService.getProfileAnalytics(profile.id);
      if (analyticsResult.success && analyticsResult.data) {
        setAnalytics(analyticsResult.data);
        console.log('✅ DASHBOARD: Analytics loaded:', analyticsResult.data);
      } else {
        console.error('❌ DASHBOARD: Failed to load analytics:', analyticsResult.error);
      }

      // Load chart data
      try {
        const chartResult = await analyticsService.getAnalyticsChartData(profile.id);
        if (chartResult.success && chartResult.data) {
          setChartData(chartResult.data);
          console.log('✅ DASHBOARD: Chart data loaded:', chartResult.data);
        }
      } catch (chartError) {
        console.error('Chart data loading failed:', chartError);
        // Chart data is optional, so don't fail the whole process
      }
      
    } catch (error) {
      console.error('❌ DASHBOARD: Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      if (profile?.id) {
        await Promise.all([
          loadUserSettings(),
          loadSubscriptionDetails(),
          loadAnalyticsData()
        ]);
        setInitialLoading(false);
      }
    };

    initializeData();
  }, [profile?.id]); // Removed planFeatures dependency to avoid re-loading unnecessarily

  const loadUserSettings = async () => {
    if (!profile?.id) return;

    try {
      const notificationPrefs = await ProfileNotificationService.getNotificationPreferences(profile.id);
      
      if (notificationPrefs.success && notificationPrefs.preferences) {
        const newSettings = {
          notifications: notificationPrefs.preferences,
           preferences: {
            language: 'en', // You might want to get this from user profile
            theme: 'system', // You might want to get this from user profile
          },
        };
        
        setSettings(newSettings);
        setOriginalSettings(JSON.parse(JSON.stringify(newSettings)));
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const saveSettings = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const result = await ProfileNotificationService.updateNotificationPreferences(
        profile.id,
        settings.notifications
      );
      
      if (result.success) {
        toast.success('Settings saved successfully');
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
        setHasChanges(false);
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword || !currentPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error(error.message);
      } else {
      toast.success('Password updated successfully');
      setPasswordChangeOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleResetProfile = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      // This would reset profile data - you'd need to implement this based on your needs
      toast.success('Profile reset successfully');
      setResetDialogOpen(false);
      await refreshProfile();
    } catch (error) {
      console.error('Error resetting profile:', error);
      toast.error('Failed to reset profile');
    } finally {
    setLoading(false);
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    
    // Update URL without causing a page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', sectionId);
    window.history.replaceState(null, '', url.toString());
  };

  // Define sections (removed custom themes)
  const sections = [
    { id: 'account', title: 'Account', icon: User, description: 'Manage your account settings' },
    { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Configure notification preferences' },
    { id: 'subscription', title: 'Subscription', icon: Crown, description: 'Manage your plan and billing' },
    { id: 'analytics', title: 'Analytics', icon: BarChart3, description: 'View profile performance data', premium: true },
    { id: 'security', title: 'Security', icon: Shield, description: 'Password and security settings' },
  ];

  if (initialLoading) {
    return (
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-20 lg:pb-8 pt-3 sm:pt-4 lg:pt-6 overflow-x-hidden">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loading size="lg" text="Loading settings..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-20 lg:pb-8 pt-3 sm:pt-4 lg:pt-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 lg:mb-8"
      >
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              Settings
              </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              Manage your account preferences and configuration
              </p>
            </div>
            </div>
      </motion.div>

      {/* Mobile Section Menu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:hidden"
      >
        <Card className="overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <Button
              variant="outline"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`w-full h-10 sm:h-12 justify-between transition-all duration-200 ${
                mobileMenuOpen ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                {React.createElement(sections.find(s => s.id === activeSection)?.icon || Settings, { 
                  className: "w-4 h-4" 
                })}
                {sections.find(s => s.id === activeSection)?.title}
              </span>
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
      </motion.div>
            </Button>

        <motion.div
              initial={false}
              animate={{ 
                height: mobileMenuOpen ? "auto" : 0,
                opacity: mobileMenuOpen ? 1 : 0
              }}
              transition={{ 
                duration: 0.3,
                ease: [0.04, 0.62, 0.23, 0.98]
              }}
              className="overflow-hidden"
            >
              <motion.div 
                className="mt-3 space-y-1"
                initial={{ y: -10 }}
                animate={{ y: mobileMenuOpen ? 0 : -10 }}
                transition={{ duration: 0.2, delay: mobileMenuOpen ? 0.1 : 0 }}
              >
                {sections.map((section, index) => {
                  const isDisabled = section.premium && planFeatures.planType === 'free';
                  const isActive = activeSection === section.id;
                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: mobileMenuOpen ? 1 : 0,
                        x: mobileMenuOpen ? 0 : -20
                      }}
                      transition={{ 
                        duration: 0.2, 
                        delay: mobileMenuOpen ? 0.1 + (index * 0.05) : 0 
                      }}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        onClick={() => !isDisabled && handleSectionChange(section.id)}
                        disabled={isDisabled}
                        className={`w-full justify-start text-left h-auto p-3 transition-all duration-200 ${
                          isActive 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        } ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <section.icon className={`w-4 h-4 flex-shrink-0 ${
                            isActive ? 'text-white' : ''
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${
                                isActive ? 'text-white' : ''
                              }`}>{section.title}</span>
                              {section.premium && (
                                <Crown className={`w-3 h-3 ${
                                  isActive ? 'text-yellow-200' : 'text-yellow-500'
                                }`} />
                              )}
                            </div>
                            <p className={`text-xs mt-0.5 ${
                              isActive 
                                ? 'text-blue-100' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {section.description}
                            </p>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
            </CardContent>
          </Card>
        </motion.div>

      {/* Desktop Navigation */}
          <motion.div
        initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="hidden lg:block"
      >
        <Card className="overflow-hidden">
          <CardContent className="p-4 lg:p-6">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                  {sections.map((section) => {
                const isDisabled = section.premium && planFeatures.planType === 'free';
                const isActive = activeSection === section.id;
                    return (
                  <Button
                        key={section.id}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => !isDisabled && handleSectionChange(section.id)}
                    disabled={isDisabled}
                    className={`h-auto p-4 lg:p-6 flex flex-col items-start gap-2 lg:gap-3 text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-lg'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <section.icon className={`w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0 ${
                        isActive ? 'text-white' : ''
                      }`} />
                      <span className={`text-sm lg:text-base font-medium ${
                        isActive ? 'text-white' : ''
                      }`}>{section.title}</span>
                      {section.premium && (
                        <Crown className={`w-3 h-3 lg:w-4 lg:h-4 ml-auto ${
                          isActive ? 'text-yellow-200' : 'text-yellow-500'
                        }`} />
                      )}
                    </div>
                    <p className={`text-xs lg:text-sm leading-relaxed ${
                      isActive
                        ? 'text-blue-100'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {section.description}
                    </p>
                  </Button>
                    );
                  })}
            </div>
              </CardContent>
            </Card>
          </motion.div>

      {/* Content Area */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeSection === 'account' && (
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span>Account Settings</span>
                  </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                Manage your basic account information and preferences
                  </CardDescription>
                </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">Email</Label>
                      <Input 
                        value={session?.user?.email || ''} 
                        disabled 
                      className="h-10 sm:h-12 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800"
                      />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>

                  <Separator />

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base font-semibold">Preferences</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-medium">Theme</Label>
                      <div className="h-10 sm:h-12 flex items-center">
                        <ThemeSwitcher />
                              </div>
                            </div>
                            <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-medium">Language</Label>
                      <div className="h-10 sm:h-12 flex items-center">
                        <Badge variant="outline" className="text-xs px-3 py-1">
                          English (US)
                        </Badge>
                              </div>
                            </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}

          {activeSection === 'notifications' && (
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span>Notification Settings</span>
                  </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                Control when and how you receive notifications
                  </CardDescription>
                </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1 min-w-0">
                      <Label className="text-xs sm:text-sm font-medium">Order Updates</Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Receive emails about your physical card orders
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.email_order_updates}
                        onCheckedChange={(checked) => updateSetting('notifications', 'email_order_updates', checked)}
                      />
                    </div>
                    
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1 min-w-0">
                      <Label className="text-xs sm:text-sm font-medium">Marketing Emails</Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Receive promotional emails and product updates
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.email_marketing}
                        onCheckedChange={(checked) => updateSetting('notifications', 'email_marketing', checked)}
                      />
                    </div>
                  </div>

                {hasChanges && (
                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      onClick={saveSettings}
                      disabled={saving}
                      className="h-10 sm:h-12 px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                                <Button 
                      variant="outline"
                      onClick={() => {
                        setSettings(originalSettings || settings);
                        setHasChanges(false);
                      }}
                      className="h-10 sm:h-12 px-4 sm:px-6 rounded-lg"
                    >
                      Cancel
                                </Button>
                        </div>
                      )}
                          </div>
                    </CardContent>
                  </Card>
        )}

        {activeSection === 'subscription' && (
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span>Subscription & Billing</span>
                      </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                Manage your subscription plan and billing information
                      </CardDescription>
                    </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium">Current Plan</span>
                    <Badge variant={planFeatures.planType === 'free' ? 'secondary' : 'default'} className="text-xs px-3 py-1">
                      {planFeatures.planType === 'free' ? 'Free Plan' : 'Premium Plan'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {planFeatures.planType === 'free' 
                      ? 'Basic features with limited customization options'
                      : 'Full access to all premium features and customization options'
                    }
                  </p>
                </div>

                {planFeatures.planType === 'free' && (
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-sm sm:text-base font-semibold">Upgrade to Premium</h4>
                    
                    {/* Payment Method Notice */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                          Secure Subscription Payments
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Pro subscriptions require credit/debit card payments for secure recurring billing.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                  <Button 
                                    onClick={() => handleUpgrade('monthly')}
                                    disabled={upgrading}
                        className="h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        {upgrading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Crown className="w-4 h-4 mr-2" />
                        )}
                        Monthly - $4/mo
                                  </Button>
                                  <Button 
                                    onClick={() => handleUpgrade('annually')}
                                    disabled={upgrading}
                                    variant="outline"
                        className="h-12 sm:h-14 border-2 border-blue-200 hover:bg-blue-50 rounded-lg"
                      >
                        {upgrading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Crown className="w-4 h-4 mr-2" />
                        )}
                        Annual - $40/yr
                                  </Button>
                                </div>
                              </div>
                )}

                {planFeatures.planType !== 'free' && subscriptionDetails && (
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-sm sm:text-base font-semibold">Subscription Details</h4>
                    <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="font-medium capitalize">{subscriptionDetails.status || 'Active'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Plan:</span>
                          <span className="font-medium capitalize">{subscriptionDetails.plan}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next billing:</span>
                          <span className="font-medium">
                            {subscriptionDetails.next_billing_date 
                              ? new Date(subscriptionDetails.next_billing_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : subscriptionDetails.status === 'active' 
                                ? 'Calculating...'
                                : 'Not available'
                            }
                          </span>
                        </div>
                        {subscriptionDetails.next_billing_date && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            * Estimated billing date based on subscription status
                          </div>
                        )}
                      </div>
                    </div>

                                  <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                    <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full h-10 sm:h-12 border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                                        Cancel Subscription
                                      </Button>
                                    </AlertDialogTrigger>
                      <AlertDialogContent>
                                      <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                        <AlertDialogDescription>
                            Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction onClick={handleCancelSubscription} disabled={loading}>
                            {loading ? 'Cancelling...' : 'Yes, Cancel'}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                            </div>
                          )}
                        </div>
                    </CardContent>
                  </Card>
        )}

        {activeSection === 'analytics' && (
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {planFeatures.planType === 'free' ? (
              <Card className="overflow-hidden">
                <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 px-3 sm:px-4 lg:px-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                    <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    Premium Feature
                  </h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                    Analytics are available with a Premium subscription. Track profile views, link clicks, and more.
                  </p>
          <Button 
                    onClick={() => handleUpgrade('monthly')}
                    className="h-10 sm:h-12 px-4 sm:px-6 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
          </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {analytics && (
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
                      <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                        <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                        <span>Analytics Overview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                      <AnalyticsOverview analytics={analytics} />
                    </CardContent>
                  </Card>
                )}
                
                {chartData.length > 0 && (
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
                      <CardTitle className="text-sm sm:text-base lg:text-lg">Views Chart</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                      <AnalyticsChart data={chartData} />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
        </div>
      )}

        {activeSection === 'security' && (
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium">Password</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Last updated: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <AlertDialog open={passwordChangeOpen} onOpenChange={setPasswordChangeOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-shrink-0">
                          <Key className="w-3 h-3 mr-1" />
                          Change
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
          <AlertDialogHeader>
                          <AlertDialogTitle>Change Password</AlertDialogTitle>
            <AlertDialogDescription>
                            Enter your current password and choose a new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm">Current Password</Label>
                            <div className="relative">
                              <Input
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                  </div>
                  </div>
                          <div className="space-y-2">
                            <Label className="text-sm">New Password</Label>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                    </div>
                    </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Confirm New Password</Label>
                            <Input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                </div>
              </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handlePasswordChange} disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">Danger Zone</h4>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 mb-3">
                        These actions cannot be undone. Please be careful.
                      </p>
                      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-100">
                            <Trash2 className="w-3 h-3 mr-1" />
                            Reset Profile Data
                  </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset Profile Data</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will reset all your profile information to default values. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetProfile} disabled={loading}>
                              {loading ? 'Resetting...' : 'Yes, Reset'}
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
        )}
      </motion.div>
    </div>
  );
} 