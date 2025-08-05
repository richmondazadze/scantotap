import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useProfile, type PlanType, type SubscriptionStatus } from '@/contexts/ProfileContext';
import { ErrorHandler } from '@/utils/errorHandling';
import { useState, useEffect, useRef, useMemo } from 'react';
import { AvatarUploader } from '@/components/AvatarUploader';
import { ImageCropModal } from '@/components/ImageCropModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { UsernameHistoryService } from '@/services/usernameHistoryService';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { processSocialInput, SOCIAL_PLATFORMS, getDisplayUsername } from '@/lib/socialUrlParser';
import { usePlanFeatures, canAddMoreLinks } from '@/hooks/usePlanFeatures';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { motion } from 'framer-motion';
import { Camera, Plus, X, Phone, Globe, Link as LinkIcon, ExternalLink, Save, AlertCircle, CheckCircle, Shield, Mail, Crown, AtSign, User, Smartphone, Upload, Image as ImageIcon } from 'lucide-react';
import { FaInstagram, FaTwitter, FaSnapchat, FaTiktok, FaWhatsapp, FaYoutube, FaFacebook, FaLinkedin, FaSpotify, FaPinterest, FaTwitch, FaTelegram, FaDiscord } from 'react-icons/fa6';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SOCIAL_PRESETS = [
  { label: 'Instagram', icon: FaInstagram, placeholder: 'Username or Instagram URL', key: 'instagram' },
  { label: 'X', icon: FaTwitter, placeholder: 'Username or X/Twitter URL', key: 'x' },
  { label: 'Snapchat', icon: FaSnapchat, placeholder: 'Username or Snapchat URL', key: 'snapchat' },
  { label: 'TikTok', icon: FaTiktok, placeholder: 'Username or TikTok URL', key: 'tiktok' },
  { label: 'WhatsApp', icon: FaWhatsapp, placeholder: 'Phone number or WhatsApp URL', key: 'whatsapp' },
  { label: 'YouTube', icon: FaYoutube, placeholder: 'Channel name or YouTube URL', key: 'youtube' },
  { label: 'Facebook', icon: FaFacebook, placeholder: 'Username or Facebook URL', key: 'facebook' },
  { label: 'LinkedIn', icon: FaLinkedin, placeholder: 'Username or LinkedIn URL', key: 'linkedin' },
  { label: 'Spotify', icon: FaSpotify, placeholder: 'Username or Spotify URL', key: 'spotify' },
  { label: 'Website', icon: Globe, placeholder: 'Website URL', key: 'website' },
  { label: 'Pinterest', icon: FaPinterest, placeholder: 'Username or Pinterest URL', key: 'pinterest' },
  { label: 'Twitch', icon: FaTwitch, placeholder: 'Username or Twitch URL', key: 'twitch' },
  { label: 'Telegram', icon: FaTelegram, placeholder: 'Username or Telegram URL', key: 'telegram' },
  { label: 'Discord', icon: FaDiscord, placeholder: 'Server invite or Discord URL', key: 'discord' },
  { label: 'Threads', icon: AtSign, placeholder: 'Username or Threads URL', key: 'threads' },
];

// Helper function to validate and fix URL
const validateAndFixUrl = (url: string): string => {
  if (!url) return url;
  
  // Remove any leading/trailing whitespace
  url = url.trim();
  
  // Check if it already has a protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Check if it looks like a URL (contains a dot)
  if (url.includes('.') || url.includes('/')) {
    return `https://${url}`;
  }
  
  // Return as-is if it doesn't look like a URL
  return url;
};

// Helper function to upload thumbnail
const uploadThumbnail = async (file: File, userId: string, linkId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/link-thumbnails/${linkId}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    return null;
  }
};

export default function DashboardProfile() {
  const { session, loading: authLoading } = useAuthGuard();
  const { profile, loading: profileLoading, setProfile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State declarations
  const [name, setName] = useState(profile?.name || '');
  const [title, setTitle] = useState(profile?.title || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [links, setLinks] = useState<any[]>(Array.isArray(profile?.links) ? profile.links : []);
  const [newLink, setNewLink] = useState({ label: '', url: '', thumbnail: '' });
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState(profile?.slug || '');
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [hasUnsavedChangesState, setHasUnsavedChanges] = useState(false);
  const [showSocialDialog, setShowSocialDialog] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState(null);
  const [socialInput, setSocialInput] = useState('');
  const [socialPreview, setSocialPreview] = useState({ url: '', username: '', isValid: false });
  const [phone, setPhone] = useState(profile?.phone || '');
  const [socialLayoutStyle, setSocialLayoutStyle] = useState(profile?.social_layout_style || 'horizontal');
  const [showEmail, setShowEmail] = useState(profile?.show_email ?? true);
  const [showPhone, setShowPhone] = useState(profile?.show_phone ?? true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [useUsernameInsteadOfName, setUseUsernameInsteadOfName] = useState(profile?.use_username_instead_of_name ?? false);
  
  // New states for thumbnail functionality
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const slugCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  // Plan features
  const planFeatures = usePlanFeatures();
  const canAddLink = canAddMoreLinks(links.length, planFeatures.planType);
  const remainingLinks = planFeatures.maxLinks === Infinity ? Infinity : planFeatures.maxLinks - links.length;

  // Use the unsaved changes hook for navigation protection
  useUnsavedChanges(hasUnsavedChangesState, 'You have unsaved changes. Are you sure you want to leave?');

  // Effect to update form fields when profile changes
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setTitle(profile.title || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setLinks(Array.isArray(profile.links) ? profile.links : []);
      setSlug(profile.slug || '');
      setPhone(profile.phone || '');
      setSocialLayoutStyle(profile.social_layout_style || 'horizontal');
      setShowEmail(profile.show_email ?? true);
      setShowPhone(profile.show_phone ?? true);
      setUseUsernameInsteadOfName(profile.use_username_instead_of_name ?? false);
    }
  }, [profile]);

  // Effect to handle username history for profiles that just completed onboarding
  useEffect(() => {
    const handleUsernameHistory = async () => {
      if (profile?.slug && session?.user?.id) {
        try {
          // Check if username already exists in history
          const { usernames, error } = await UsernameHistoryService.getUserUsernames(session.user.id);
          
          if (error) {
            console.error('Error checking username history:', error);
            return;
          }
          
          // If no username history exists for this user, add the current username
          if (!usernames || usernames.length === 0) {
            const result = await UsernameHistoryService.addUsernameHistory(session.user.id, profile.slug, true);
            if (result.success) {
              console.log('Username history added for new profile');
            } else {
              console.error('Failed to add username history:', result.error);
            }
          }
        } catch (error) {
          console.error('Error handling username history:', error);
        }
      }
    };

    handleUsernameHistory();
  }, [profile?.slug, session?.user?.id]);

  // Effect to check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!profile) return false;
    
    const profileLinks = Array.isArray(profile.links) ? profile.links : [];
    const diffs = {
      name: name !== (profile.name || ''),
      title: title !== (profile.title || ''),
      bio: bio !== (profile.bio || ''),
      avatarUrl: avatarUrl !== (profile.avatar_url || ''),
      slug: slug !== (profile.slug || ''),
      phone: phone !== (profile.phone || ''),
      links: JSON.stringify(links) !== JSON.stringify(profileLinks),
    };
    
    return Object.values(diffs).some(Boolean);
  }, [name, title, bio, avatarUrl, links, slug, phone, profile, hasUnsavedChangesState]);

  // Update the context when hasUnsavedChanges changes
  useEffect(() => {
    setHasUnsavedChanges(hasUnsavedChanges);
  }, [hasUnsavedChanges]);

  // Slug availability check
  useEffect(() => {
    if (!slug) {
      setSlugAvailable(true);
      return;
    }
    setCheckingSlug(true);
    if (slugCheckTimeout.current) clearTimeout(slugCheckTimeout.current);
    slugCheckTimeout.current = setTimeout(async () => {
      try {
        // Check if username is available using UsernameHistoryService
        const { available, error } = await UsernameHistoryService.isUsernameAvailable(slug, session?.user?.id);
        
        if (error) {
          console.error('Error checking username availability:', error);
          setSlugAvailable(false);
        } else {
          setSlugAvailable(available);
        }
      } catch (err) {
        console.error('Exception checking username availability:', err);
        setSlugAvailable(false);
      }
      setCheckingSlug(false);
    }, 500);
  }, [slug]);

  // Helper: get platforms already added
  const addedPlatforms = links.map(l => l.label);
  const availablePresets = SOCIAL_PRESETS.filter(p => !addedPlatforms.includes(p.label));
  const socialLabels = SOCIAL_PRESETS.map(p => p.label);
  const customLinks = links.filter(l => !socialLabels.includes(l.label));
  const socialLinks = links.filter(l => socialLabels.includes(l.label));

  // Social input preview effect
  useEffect(() => {
    if (!selectedSocial || !socialInput) {
      setSocialPreview({ url: '', username: '', isValid: false });
      return;
    }

    if (selectedSocial.key === 'website') {
      const isValidUrl = socialInput.startsWith('http://') || socialInput.startsWith('https://') || socialInput.includes('.');
      setSocialPreview({
        url: socialInput.startsWith('http') ? socialInput : `https://${socialInput}`,
        username: socialInput,
        isValid: isValidUrl
      });
      return;
    }

    const result = processSocialInput(socialInput, selectedSocial.key);
    setSocialPreview(result);
  }, [socialInput, selectedSocial]);

  const handlePresetClick = (preset) => {
    setSelectedSocial(preset);
    setSocialInput('');
    setSocialPreview({ url: '', username: '', isValid: false });
    setShowSocialDialog(true);
  };



  const handlePrivacySettingChange = async (setting: 'show_email' | 'show_phone', value: boolean) => {
    if (!profile) return;
    
    // Update local state immediately
    if (setting === 'show_email') {
      setShowEmail(value);
    } else if (setting === 'show_phone') {
      setShowPhone(value);
    }
    
    try {
      const updateData = setting === 'show_email' 
        ? { show_email: value }
        : { show_phone: value };
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);
      
      if (error) {
        toast.error('Failed to update privacy setting');
        // Revert the state if save failed
        if (setting === 'show_email') {
          setShowEmail(!value);
        } else if (setting === 'show_phone') {
          setShowPhone(!value);
        }
      } else {
        toast.success('Privacy setting updated!');
        // Update the profile context
        if (setProfile) {
          setProfile({ ...profile, ...updateData });
        }
      }
    } catch (err) {
      toast.error('Failed to update privacy setting');
      // Revert the state if save failed
      if (setting === 'show_email') {
        setShowEmail(!value);
      } else if (setting === 'show_phone') {
        setShowPhone(!value);
      }
    }
  };

  const handleUsernamePreferenceChange = async (value: boolean) => {
    if (!profile) return;
    
    setUseUsernameInsteadOfName(value);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ use_username_instead_of_name: value })
        .eq('id', profile.id);
      
      if (error) {
        toast.error('Failed to update preference');
        // Revert the state if save failed
        setUseUsernameInsteadOfName(!value);
      } else {
        toast.success('Preference updated!');
        // Update the profile context
        if (setProfile) {
          setProfile({ ...profile, use_username_instead_of_name: value });
        }
      }
    } catch (err) {
      toast.error('Failed to update preference');
      // Revert the state if save failed
      setUseUsernameInsteadOfName(!value);
    }
  };

  const handleAddSocial = () => {
    if (!canAddLink) {
      setShowUpgradePrompt(true);
      return;
    }

    if (!selectedSocial || !socialInput) return;
    
    let finalUrl = '';
    
    if (selectedSocial.key === 'website') {
      finalUrl = socialInput.startsWith('http') ? socialInput : `https://${socialInput}`;
    } else {
      const result = processSocialInput(socialInput, selectedSocial.key);
      if (!result.isValid) {
        toast.error('Please enter a valid username or URL');
        return;
      }
      finalUrl = result.url;
    }

    setLinks([...links, { label: selectedSocial.label, url: finalUrl }]);
    setShowSocialDialog(false);
    setSelectedSocial(null);
    setSocialInput('');
    setSocialPreview({ url: '', username: '', isValid: false });
  };

  const handleAddLink = async () => {
    if (!canAddLink) {
      setShowUpgradePrompt(true);
      return;
    }

    if (newLink.label && newLink.url) {
      // Validate and fix URL
      const fixedUrl = validateAndFixUrl(newLink.url);
      
      // Create new link object
      const linkToAdd = {
        ...newLink,
        url: fixedUrl,
        id: Date.now().toString() // Generate unique ID for the link
      };

      // If there's a thumbnail file, upload it
      if (thumbnailFile && session?.user?.id) {
        setUploadingThumbnail(true);
        const thumbnailUrl = await uploadThumbnail(thumbnailFile, session.user.id, linkToAdd.id);
        if (thumbnailUrl) {
          linkToAdd.thumbnail = thumbnailUrl;
        }
        setUploadingThumbnail(false);
      }

      setLinks([...links, linkToAdd]);
      setNewLink({ label: '', url: '', thumbnail: '' });
      setThumbnailFile(null);
      
      // Show success message if URL was fixed
      if (fixedUrl !== newLink.url) {
        toast.success('Link added! URL automatically prefixed with https://');
      }
    }
  };

  const handleRemoveLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!slugAvailable) {
      toast.error('Username not available');
      return;
    }
    setSaving(true);
    try {
      let data, error;
      const oldSlug = profile?.slug;
      const isNewProfile = !profile;
      
      if (isNewProfile) {
        ({ data, error } = await supabase.from('profiles').insert({
          id: session.user.id,
          user_id: session.user.id,
          name,
          title,
          bio,
          avatar_url: avatarUrl,
          links,
          slug,
          phone,
          social_layout_style: socialLayoutStyle,
          show_email: showEmail,
          show_phone: showPhone,
        }).select().single());
      } else {
        ({ data, error } = await supabase.from('profiles').update({
        name,
        title,
        bio,
        avatar_url: avatarUrl,
        links,
        slug,
          phone,
          social_layout_style: socialLayoutStyle,
          show_email: showEmail,
          show_phone: showPhone,
        }).eq('id', profile.id).select().single());
      }
      if (error) throw error;
      
      // Handle username history tracking
      if (isNewProfile) {
        // For new profiles, add the username to history
        await UsernameHistoryService.addUsernameHistory(session.user.id, slug, true);
      } else if (oldSlug && oldSlug !== slug) {
        // For existing profiles, update username history if changed
        await UsernameHistoryService.updateUsername(session.user.id, slug, oldSlug);
      }
      
      const savedProfile = {
        ...data,
        plan_type: (data.plan_type as PlanType) || 'free',
        subscription_status: data.subscription_status as SubscriptionStatus | undefined,
      };
      setProfile(savedProfile);
      
      setName(data.name || '');
      setTitle(data.title || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatar_url || '');
      setLinks(Array.isArray(data.links) ? data.links : []);
      setSlug(data.slug || '');
      setPhone(data.phone || '');
      setSocialLayoutStyle(data.social_layout_style || 'horizontal');
      setShowEmail(data.show_email ?? true);
      setShowPhone(data.show_phone ?? true);
      toast.success(profile ? 'Profile updated!' : 'Profile created successfully!');
    } catch (err) {
      const errorMessage = ErrorHandler.getDatabaseErrorMessage(err);
      toast.error(errorMessage);
    }
    setSaving(false);
  };

  const handleThumbnailUpload = (file: File) => {
    setThumbnailFile(file);
    setShowThumbnailModal(false);
    toast.success('Thumbnail selected! It will be uploaded when you add the link.');
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setNewLink({ ...newLink, thumbnail: '' });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-8 pt-4 sm:pt-6 lg:pt-8">
        <div className="flex items-center justify-center min-h-screen">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-20 lg:pb-8 pt-3 sm:pt-4 lg:pt-6 overflow-x-hidden">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 lg:mb-8"
        >
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                Your Digital Identity
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                Create your unique digital presence that others will see when they scan your QR code
              </p>
            </div>
          </div>
          
          {!profile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-3 sm:mt-4 p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 text-xs sm:text-sm lg:text-base">Welcome! Let's create your digital profile</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Fill in your information below to create your digital profile. Don't worry, you can always edit this later!
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Profile Information Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-600 flex-shrink-0" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                Your basic information that will be displayed on your public profile.
                This is what others will see when they visit your digital business card.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 lg:gap-8">
            {/* Avatar Section */}
                <div className="flex flex-col items-center lg:items-start gap-3 sm:gap-4 lg:gap-6 w-full lg:w-64 lg:flex-shrink-0">
              <AvatarUploader
                currentAvatar={avatarUrl || undefined}
                onAvatarUpdate={(newUrl) => {
                  if (avatarUrl && avatarUrl !== newUrl && newUrl) {
                    try {
                      const url = new URL(avatarUrl);
                      const filePath = url.pathname.split('/').slice(-2).join('/');
                      supabase.storage.from('avatars').remove([filePath]);
                    } catch (error) {
                
                    }
                  }
                  setAvatarUrl(newUrl);
                }}
                userId={session?.user.id || ''}
                size="lg"
                showRemove={true}
              />
            </div>

          {/* Profile Fields */}
                <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6 min-w-0">
            <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-200">Full Name *</label>
              <Input
                      className="w-full text-sm"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                      placeholder="Your full name"
              />
            </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={useUsernameInsteadOfName}
                    onCheckedChange={handleUsernamePreferenceChange}
                  />
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                    Use username instead of full name on profile
                  </label>
                </div>
                {useUsernameInsteadOfName && (
                  <Badge variant="secondary" className="text-xs sm:text-sm self-start sm:self-auto">
                    Will show @{slug || 'username'}
                  </Badge>
                )}
              </div>
            <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-200">Title / Role</label>
              <Input
                      className="w-full text-sm"
                value={title}
                onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Software Engineer, Designer, CEO"
              />
            </div>
            <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-200">Bio</label>
              <Textarea
                      className="w-full min-h-[100px] sm:min-h-[120px] resize-none text-sm"
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 160))}
                  rows={4}
                      placeholder="Tell people about yourself..."
                />
                <div className="mt-1.5 sm:mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-end">
                  {bio.length}/160 characters
                </div>
              </div>
              <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-200 flex items-center gap-1.5 sm:gap-2">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                      Phone Number
                    </label>
                <Input
                      className="w-full text-sm"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +1234567890"
                  type="tel"
                />
              </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-200">Username *</label>
                    <div className="relative">
                      <Input
                        className="w-full text-sm pr-8"
                        value={slug}
                        onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="your-username"
                      />
                      {checkingSlug && (
                        <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    {slug && (
                      <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm">
                        {checkingSlug ? (
                          <span className="text-gray-500">Checking availability...</span>
                        ) : slugAvailable ? (
                          <span className="text-green-600 font-medium">✓ Available</span>
                        ) : (
                          <span className="text-red-600 font-medium">✗ Username taken</span>
                        )}
                      </div>
                    )}
                    <div className="mt-1.5 sm:mt-2 text-xs text-gray-500 dark:text-gray-400 break-all bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg border">
                      Your profile will be available at: <br></br><span className="font-mono text-blue-600 dark:text-blue-400">{window.location.origin}/{slug || 'your-username'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Settings Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span>Privacy Settings</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                  Control what information is visible on your public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                        Show Email Address
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Display your email address on your public profile
                      </p>
                  </div>
                  <Switch
                    checked={showEmail}
                    onCheckedChange={(checked) => handlePrivacySettingChange('show_email', checked)}
                    className="self-start sm:self-auto ml-0 sm:ml-4 flex-shrink-0"
                  />
                </div>
                  
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <label className={`text-xs sm:text-sm font-medium ${!showPhone ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                        Phone Number
                      </label>
                      <p className={`text-xs mt-1 ${!showPhone ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {!showPhone 
                          ? 'Phone number is hidden from your profile'
                          : 'Your phone number will be visible on your profile'
                        }
                      </p>
                  </div>
                  <Switch
                    checked={showPhone}
                    onCheckedChange={(checked) => handlePrivacySettingChange('show_phone', checked)}
                    className="self-start sm:self-auto ml-0 sm:ml-4 flex-shrink-0"
                  />
                </div>
                </div>
            </CardContent>
          </Card>
        </motion.div>

      {/* Social Links Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <AtSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span>Social Links</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                Add your social profiles and websites to create a complete digital presence.
                Your links will be displayed beautifully on your profile page.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Plan Status Display */}
          {planFeatures.isFreeUser && (
                <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 sm:gap-2 mb-1 text-xs sm:text-sm">
                    🆓 Free Plan
                    <Badge variant="outline" className="text-xs">
                      {remainingLinks === Infinity ? 'Unlimited' : `${remainingLinks} remaining`}
                    </Badge>
                  </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                    {remainingLinks > 0 
                      ? `You can add ${remainingLinks === Infinity ? 'unlimited' : remainingLinks} more links` 
                      : 'You\'ve reached your 7-link limit'
                    }
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <RouterLink to="/dashboard/settings?section=subscription">
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white w-full sm:w-auto text-xs h-8">
                          <Crown className="w-3 h-3 mr-1" />
                      Upgrade
                    </Button>
                  </RouterLink>
                </div>
              </div>
            </div>
          )}



              {/* Social Platform Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {availablePresets.map(preset => (
              <button
                key={preset.label}
                    className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm hover:shadow-md min-w-0 group"
                onClick={() => handlePresetClick(preset)}
                type="button"
              >
                    <preset.icon className="text-sm sm:text-lg flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium truncate min-w-0">{preset.label}</span>
              </button>
            ))}
          </div>

              {/* Added Social Links */}
              <div className="space-y-2 sm:space-y-3">
            {socialLinks.map((link: any, idx: number) => {
              const preset = SOCIAL_PRESETS.find(p => p.label === link.label);
              const Icon = preset ? preset.icon : null;
              const displayUsername = preset?.key && preset.key !== 'website' 
                ? getDisplayUsername(link.url, preset.key) 
                : null;
              
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all min-w-0 group"
                >
                  {Icon && (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                          <Icon className="text-sm sm:text-lg text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                          <div className="text-xs sm:text-sm font-medium truncate text-gray-900 dark:text-white">
                        {link.label}
                      </div>
                      {displayUsername && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex-shrink-0">
                          {displayUsername}
                        </div>
                      )}
                    </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{link.url}</div>
                  </div>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon"
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 h-7 w-7 sm:h-9 sm:w-9 rounded-lg flex-shrink-0" 
                    onClick={() => handleRemoveLink(links.indexOf(link))}
                  >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Custom Links Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span>Custom Links</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                Add any other links you want to share. For example, your website, portfolio, or any other resource.
                These will appear alongside your social media links.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Link Input Form */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Input
                    className="flex-1 text-sm"
                placeholder="Label (e.g. Portfolio)"
                value={newLink.label}
                onChange={e => setNewLink({ ...newLink, label: e.target.value })}
                    // maxLength removed to allow longer labels
              />
              <Input
                    className="flex-1 text-sm"
                placeholder="URL (e.g. https://...)"
                value={newLink.url}
                onChange={e => setNewLink({ ...newLink, url: e.target.value })}
              />
                </div>
                
                {/* Thumbnail Upload Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail</span>
                  </div>
                  
                  {thumbnailFile ? (
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                        <img 
                          src={URL.createObjectURL(thumbnailFile)} 
                          alt="Thumbnail preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {thumbnailFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeThumbnail}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setThumbnailFile(file);
                            setShowThumbnailModal(true);
                          }
                        }}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors flex-shrink-0"
                      >
                        <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Upload Icon</span>
                        <span className="sm:hidden">Upload</span>
                      </label>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-1">
                        Optional - Add a custom icon for your link
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Add Link Button */}
                <Button 
                  onClick={handleAddLink} 
                  className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm" 
                  disabled={!newLink.label || !newLink.url || uploadingThumbnail}
                >
                  {uploadingThumbnail ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1 sm:mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Add Link
                    </>
                  )}
              </Button>
            </div>
              
              {/* Custom Links List */}
              <div className="space-y-2 sm:space-y-3">
              {customLinks.length === 0 && (
                  <div className="text-center py-6 sm:py-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <LinkIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No custom links added yet.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add your website, portfolio, or any other links above.</p>
                </div>
              )}
              {customLinks.map((link: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all min-w-0 group"
                  >
                    {/* Thumbnail or Default Icon */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors overflow-hidden">
                      {link.thumbnail ? (
                        <img 
                          src={link.thumbnail} 
                          alt={`${link.label} thumbnail`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      )}
                  </div>
                    
                    {/* Link Info - Fixed responsiveness */}
                  <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words line-clamp-1" title={link.label}>
                        {link.label}
                  </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 break-all line-clamp-1" title={link.url}>
                        {link.url}
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                  <Button 
            type="button"
                    variant="ghost" 
                    size="icon"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 h-7 w-7 sm:h-9 sm:w-9 rounded-lg flex-shrink-0" 
                    onClick={() => handleRemoveLink(links.indexOf(link))}
                  >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </motion.div>
              ))}
        </div>
            </CardContent>
          </Card>
          </motion.div>

      {/* Save Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
              <div className="flex justify-center">
        <Button
          onClick={handleSave}
                  className="h-10 sm:h-12 px-6 sm:px-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-600 transition-all text-xs sm:text-sm min-w-[180px] sm:min-w-[200px]"
          disabled={saving}
        >
            {saving ? (
              <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                      <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {!profile ? 'Create Profile' : 'Save Profile'}
              </>
            )}
        </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Social Add Dialog */}
      {showSocialDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSocialDialog(false)} />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 bg-white dark:bg-gray-800 backdrop-blur-xl p-4 sm:p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm sm:max-w-md mx-2 sm:mx-3"
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <selectedSocial.icon className="text-lg sm:text-xl" />
              <h4 className="text-base sm:text-lg font-semibold">Add {selectedSocial?.label}</h4>
      </div>
            
            <div className="space-y-3 sm:space-y-4">
              <Input
                autoFocus
                placeholder={selectedSocial?.placeholder}
                value={socialInput}
                onChange={e => setSocialInput(e.target.value)}
                className={`text-sm transition-all ${
                  socialInput && !socialPreview.isValid 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : socialInput && socialPreview.isValid 
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                    : ''
                }`}
              />
              
              {socialInput && (
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 text-xs ${
                    socialPreview.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {socialPreview.isValid ? (
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                    <span>
                      {socialPreview.isValid 
                        ? 'Valid input detected' 
                        : 'Please enter a valid username or URL'
                      }
                    </span>
                  </div>
                  
                  {socialPreview.isValid && socialPreview.url && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg border">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</div>
                      <div className="text-xs sm:text-sm font-mono text-blue-600 dark:text-blue-400 break-all">
                        {socialPreview.url}
                      </div>
                      {socialPreview.username && selectedSocial.key !== 'website' && (
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          Username: <span className="font-medium">{getDisplayUsername(socialPreview.url, selectedSocial.key)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 justify-end mt-4 sm:mt-6">
              <Button variant="outline" onClick={() => setShowSocialDialog(false)} className="text-xs sm:text-sm h-8 sm:h-9">
                Cancel
              </Button>
              <Button 
                onClick={handleAddSocial} 
                disabled={!socialInput || !socialPreview.isValid} 
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                Add {selectedSocial?.label}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <UpgradePrompt
          variant="modal"
          title="Link Limit Reached"
          description="You've reached the 6-link limit for free accounts. Upgrade to Pro for unlimited links and premium features."
          feature="links"
          onClose={() => setShowUpgradePrompt(false)}
          showCloseButton={true}
        />
      )}

      {/* Thumbnail Upload Modal */}
      {showThumbnailModal && thumbnailFile && (
        <ImageCropModal
          isOpen={showThumbnailModal}
          initialImage={thumbnailFile}
          onCropComplete={(croppedImage) => {
            handleThumbnailUpload(croppedImage);
          }}
          onClose={() => setShowThumbnailModal(false)}
          aspectRatio={1}
          circular={false}
          maxFileSize={5}
        />
      )}
    </>
  );
} 