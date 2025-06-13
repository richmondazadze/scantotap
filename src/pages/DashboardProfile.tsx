import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useProfile } from '@/contexts/ProfileContext';
import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import AvatarUploader from '@/components/AvatarUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, useLocation, UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import { NavigationPromptModal } from '@/components/ui/NavigationPromptModal';
import { processSocialInput, SOCIAL_PLATFORMS, getDisplayUsername } from '@/lib/socialUrlParser';

import { motion } from 'framer-motion';
import { Camera, Plus, X, Phone, Globe, Link, ExternalLink, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { FaInstagram, FaTwitter, FaSnapchat, FaTiktok, FaWhatsapp, FaYoutube, FaFacebook, FaLinkedin, FaSpotify, FaPinterest, FaTwitch } from 'react-icons/fa6';

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
];

function useBlocker(shouldBlock, onBlock) {
  const { navigator } = useContext(NavigationContext);
  useEffect(() => {
    const push = navigator.push;
    navigator.push = (...args) => {
      if (shouldBlock()) {
        onBlock(args[0]);
        return;
      }
      return push.apply(navigator, args);
    };
    return () => {
      navigator.push = push;
    };
  }, [shouldBlock, onBlock, navigator]);
}

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
  const [newLink, setNewLink] = useState({ label: '', url: '' });
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState(profile?.slug || '');
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSocialDialog, setShowSocialDialog] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState(null);
  const [socialInput, setSocialInput] = useState('');
  const [socialPreview, setSocialPreview] = useState({ url: '', username: '', isValid: false });
  const [phone, setPhone] = useState(profile?.phone || '');
  const [showNavPrompt, setShowNavPrompt] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(null);

  const slugCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const avatarTriggerRef = useRef<HTMLDivElement>(null);

  // Block navigation if there are unsaved changes
  useBlocker(
    () => hasUnsavedChanges,
    (nextLocation) => {
      setShowNavPrompt(true);
      setPendingLocation(typeof nextLocation === 'string' ? { pathname: nextLocation } : nextLocation);
      console.log('Pending location:', nextLocation);
    }
  );

  // Handle browser/tab close only
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Effect to update form fields when profile changes
  useEffect(() => {
    if (profile) {
      console.log('[ProfileEffect] Syncing form state from profile:', profile);
      setName(profile.name || '');
      setTitle(profile.title || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setLinks(Array.isArray(profile.links) ? profile.links : []);
      setSlug(profile.slug || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Effect to check for unsaved changes by comparing form state with database profile, with debug logs
  useEffect(() => {
    if (!profile) {
      setHasUnsavedChanges(false);
      console.log('[UnsavedChanges] No profile loaded, hasUnsavedChanges = false');
      return;
    }
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
    const isChanged = Object.values(diffs).some(Boolean);
    console.log('[UnsavedChanges] Field diffs:', diffs);
    console.log('[UnsavedChanges] isChanged:', isChanged);
    setHasUnsavedChanges(isChanged);
  }, [name, title, bio, avatarUrl, links, slug, phone, profile]);

  // Slug (username) availability check
  useEffect(() => {
    if (!slug) {
      setSlugAvailable(true);
      return;
    }
    setCheckingSlug(true);
    if (slugCheckTimeout.current) clearTimeout(slugCheckTimeout.current);
    slugCheckTimeout.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('slug', slug)
        .neq('id', profile?.id || '')
        .maybeSingle();
      setSlugAvailable(!data);
      setCheckingSlug(false);
    }, 500);
    // eslint-disable-next-line
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

    // Handle website separately (no parsing needed)
    if (selectedSocial.key === 'website') {
      const isValidUrl = socialInput.startsWith('http://') || socialInput.startsWith('https://') || socialInput.includes('.');
      setSocialPreview({
        url: socialInput.startsWith('http') ? socialInput : `https://${socialInput}`,
        username: socialInput,
        isValid: isValidUrl
      });
      return;
    }

    // Use smart parsing for social platforms
    const result = processSocialInput(socialInput, selectedSocial.key);
    setSocialPreview(result);
  }, [socialInput, selectedSocial]);

  const handlePresetClick = (preset) => {
    setSelectedSocial(preset);
    setSocialInput('');
    setSocialPreview({ url: '', username: '', isValid: false });
    setShowSocialDialog(true);
  };

  const handleAddSocial = () => {
    if (!selectedSocial || !socialInput) return;
    
    let finalUrl = '';
    
    if (selectedSocial.key === 'website') {
      // Handle website URLs
      finalUrl = socialInput.startsWith('http') ? socialInput : `https://${socialInput}`;
    } else {
      // Use smart parsing for social platforms
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

  if (authLoading || profileLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const handleAddLink = () => {
    if (newLink.label && newLink.url) {
      setLinks([...links, newLink]);
      setNewLink({ label: '', url: '' });
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
      if (!profile) {
        // Create new profile
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
        }).select().single());
      } else {
        // Update existing profile
        ({ data, error } = await supabase.from('profiles').update({
        name,
        title,
        bio,
        avatar_url: avatarUrl,
        links,
        slug,
          phone,
        }).eq('id', profile.id).select().single());
      }
      if (error) throw error;
      setProfile(data);
      // Reset form state to match saved profile
      setName(data.name || '');
      setTitle(data.title || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatar_url || '');
      setLinks(Array.isArray(data.links) ? data.links : []);
      setSlug(data.slug || '');
      setPhone(data.phone || '');
      toast.success(profile ? 'Profile updated!' : 'Profile created successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    }
    setSaving(false);
    setHasUnsavedChanges(false);
  };

  const handleRemoveAvatar = async () => {
    // Delete the old avatar from storage if it exists
    if (avatarUrl && profile?.id) {
      try {
        // Extract file path from URL
        const url = new URL(avatarUrl);
        const filePath = url.pathname.split('/').slice(-2).join('/'); // Get 'avatars/filename'
        
        // Delete from Supabase storage
        await supabase.storage.from('avatars').remove([filePath]);
      } catch (error) {
        console.log('Could not delete old avatar:', error);
        // Continue even if deletion fails
      }
    }

    setAvatarUrl("");
    // Also update the profile in the database to remove the avatar_url
    try {
      await supabase.from('profiles').update({ avatar_url: '' }).eq('id', profile.id);
      toast.success('Avatar removed successfully!');
    } catch (err) {
      toast.error('Failed to remove avatar. Please try again.');
    }
  };

  // Card styles - updated to match other dashboard pages
  const cardBase = 'relative rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10 bg-white/95 dark:bg-[#1A1D24]/95 border border-gray-200/50 dark:border-scan-blue/20 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:bg-white dark:hover:bg-[#1A1D24] hover:border-gray-300/60 dark:hover:border-scan-blue/30';
  const cardTitle = 'text-xl sm:text-2xl lg:text-3xl font-bold mb-3 text-gray-900 dark:text-white bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent';
  const cardDesc = 'text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed';

  // Modal handlers
  const handleModalSave = async () => {
    await handleSave();
    setShowNavPrompt(false);
    setHasUnsavedChanges(false);
    if (pendingLocation) {
      const path = typeof pendingLocation === 'string'
        ? pendingLocation
        : pendingLocation.pathname +
          (pendingLocation.search || '') +
          (pendingLocation.hash || '');
      setPendingLocation(null);
      setTimeout(() => navigate(path), 10); // Delay navigation to allow modal to close
    }
  };
  const handleModalDiscard = () => {
    setHasUnsavedChanges(false);
    setShowNavPrompt(false);
    if (pendingLocation) {
      const path = typeof pendingLocation === 'string'
        ? pendingLocation
        : pendingLocation.pathname +
          (pendingLocation.search || '') +
          (pendingLocation.hash || '');
      setPendingLocation(null);
      setTimeout(() => navigate(path), 10); // Delay navigation to allow modal to close
    }
  };
  const handleModalCancel = () => {
    setShowNavPrompt(false);
    setPendingLocation(null);
  };

  return (
    <>
      <NavigationPromptModal
        open={showNavPrompt}
        onSave={handleModalSave}
        onDiscard={handleModalDiscard}
        onCancel={handleModalCancel}
      />
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col h-full pb-24 sm:pb-8 gap-6 sm:gap-8 lg:gap-10 mt-4 sm:mt-6 lg:mt-8 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 overflow-x-hidden">
      {/* Profile Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cardBase}
        >
        <h2 className={cardTitle}>Your Digital Identity</h2>
          <p className={cardDesc}>Create your unique digital presence that will be displayed when someone scans your QR code.</p>
          
          {!profile && (
            <div className="mb-8 p-6 sm:p-8 bg-gradient-to-r from-scan-blue/5 to-scan-purple/5 dark:from-scan-blue/10 dark:to-scan-purple/10 border border-scan-blue/20 dark:border-scan-blue/30 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-scan-blue rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-scan-blue dark:text-scan-blue-light text-base sm:text-lg">Welcome! Let's create your digital profile</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                Fill in your information below to create your digital business card. Don't worry, you can always edit this later!
              </p>
            </div>
          )}
          
          <div className="flex flex-col xl:flex-row xl:items-start gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
            {/* Avatar Section */}
            <div className="flex flex-col items-center xl:items-start gap-4 sm:gap-6 w-full xl:w-1/3">
              <div ref={avatarTriggerRef} className="relative group cursor-pointer select-none">
                <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 xl:w-56 xl:h-56 rounded-full overflow-hidden border-4 border-scan-blue/20 dark:border-scan-blue/30 bg-gradient-to-br from-scan-blue/10 to-scan-purple/10 dark:from-scan-blue/20 dark:to-scan-purple/20 flex items-center justify-center transition-all duration-300 lg:group-hover:border-scan-blue/40 dark:lg:group-hover:border-scan-blue/50 shadow-xl lg:group-hover:shadow-2xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="object-cover w-full h-full" />
                ) : (
                    <span className="text-gray-400 text-5xl sm:text-6xl lg:text-7xl">?</span>
                )}
                
              </div>
                <AvatarUploader 
                  onUpload={(newUrl) => {
                    // Clean up old avatar when uploading new one
                    if (avatarUrl && avatarUrl !== newUrl) {
                      try {
                        const url = new URL(avatarUrl);
                        const filePath = url.pathname.split('/').slice(-2).join('/');
                        supabase.storage.from('avatars').remove([filePath]);
                      } catch (error) {
                        console.log('Could not delete old avatar:', error);
                      }
                    }
                    setAvatarUrl(newUrl);
                  }} 
                  triggerRef={avatarTriggerRef} 
                />
                <div className="flex flex-col items-center mt-3 sm:mt-4 gap-3">
              {!avatarUrl ? (
                <button
                      className="text-sm sm:text-base text-scan-blue dark:text-scan-blue-light font-semibold hover:text-scan-blue-dark dark:hover:text-scan-blue transition-colors cursor-pointer px-6 py-3 rounded-xl hover:bg-scan-blue/5 dark:hover:bg-scan-blue/10 border border-scan-blue/20 hover:border-scan-blue/40 shadow-sm hover:shadow-md"
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && avatarTriggerRef.current?.click()}
                  onClick={() => avatarTriggerRef.current?.click()}
                >
                  📸 Add Profile Photo
                </button>
              ) : (
                <div className="flex flex-col gap-2 items-center">
                  <button
                        className="text-sm sm:text-base text-scan-blue dark:text-scan-blue-light font-semibold hover:text-scan-blue-dark dark:hover:text-scan-blue transition-colors cursor-pointer px-6 py-3 rounded-xl hover:bg-scan-blue/5 dark:hover:bg-scan-blue/10 border border-scan-blue/20 hover:border-scan-blue/40 shadow-sm hover:shadow-md"
                    tabIndex={0}
                    role="button"
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && avatarTriggerRef.current?.click()}
                    onClick={() => avatarTriggerRef.current?.click()}
                  >
                    🔄 Update Photo
                  </button>
                  <button
                    type="button"
                        className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 hover:border-red-300 dark:hover:border-red-500/40"
                    onClick={handleRemoveAvatar}
                  >
                    🗑️ Remove Photo
                  </button>
                </div>
              )}
            </div>
          </div>
            </div>

          {/* Profile Fields */}
            <div className="flex-1 space-y-4 sm:space-y-6">
            <div>
                <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-700 dark:text-gray-200">Full Name</label>
              <Input
                  className="w-full bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:py-4 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all text-sm sm:text-base shadow-sm hover:shadow-md"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
                <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-700 dark:text-gray-200">Title / Role</label>
              <Input
                  className="w-full bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:py-4 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all text-sm sm:text-base shadow-sm hover:shadow-md"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
                <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-700 dark:text-gray-200">Bio</label>
              <Textarea
                  className="w-full bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:py-4 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all min-h-[120px] text-sm sm:text-base shadow-sm hover:shadow-md resize-none"
                value={bio}
                onChange={e => setBio(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center gap-2"><Phone className="w-4 h-4 sm:w-5 sm:h-5" /> Phone Number</label>
                <Input
                  className="w-full bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:py-4 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all text-sm sm:text-base shadow-sm hover:shadow-md"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +1234567890"
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-700 dark:text-gray-200">Username</label>
                <div className="relative">
                  <Input
                    className="w-full bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:py-4 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all text-sm sm:text-base shadow-sm hover:shadow-md"
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="your-username"
                  />
                  {checkingSlug && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {slug && (
                  <div className="mt-2 text-sm">
                    {checkingSlug ? (
                      <span className="text-gray-500">Checking availability...</span>
                    ) : slugAvailable ? (
                      <span className="text-green-600 font-medium">✓ Available</span>
                    ) : (
                      <span className="text-red-600 font-medium">✗ Username taken</span>
                    )}
                  </div>
                )}
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 break-all bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  Your profile will be available at: <span className="font-mono text-scan-blue">{window.location.origin}/profile/{slug || 'your-username'}</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      {/* Social Links Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cardBase}
        >
        <h3 className={cardTitle}>Social Links</h3>
          <p className={cardDesc}>Add your social profiles and websites to create a complete digital presence.</p>

          {/* Preset Social Icons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 mb-8">
            {availablePresets.map(preset => (
              <button
                key={preset.label}
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 lg:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-[#1A1D24]/90 hover:bg-scan-blue/5 dark:hover:bg-scan-blue/10 hover:border-scan-blue/30 transition-all focus:outline-none focus:ring-2 focus:ring-scan-blue/30 shadow-sm hover:shadow-lg min-w-0 group"
                onClick={() => handlePresetClick(preset)}
                type="button"
              >
                <preset.icon className="text-xl sm:text-2xl lg:text-3xl flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm lg:text-base font-medium truncate min-w-0">{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Social Add Dialog */}
          {showSocialDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSocialDialog(false)} />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 bg-white/95 dark:bg-[#1A1D24]/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-md mx-3"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <selectedSocial.icon className="text-xl sm:text-2xl" />
                  <h4 className="text-base sm:text-lg font-semibold">Add {selectedSocial?.label}</h4>
                </div>
                
                <div className="space-y-4">
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
                  
                  {/* Real-time validation feedback */}
                  {socialInput && (
                    <div className="space-y-2">
                      <div className={`flex items-center gap-2 text-xs ${
                        socialPreview.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {socialPreview.isValid ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        <span>
                          {socialPreview.isValid 
                            ? 'Valid input detected' 
                            : 'Please enter a valid username or URL'
                          }
                        </span>
                      </div>
                      
                      {/* URL Preview */}
                      {socialPreview.isValid && socialPreview.url && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</div>
                          <div className="text-sm font-mono text-scan-blue dark:text-scan-blue-light break-all">
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
                
                <div className="flex gap-2 justify-end mt-6">
                  <Button variant="outline" onClick={() => setShowSocialDialog(false)} className="text-sm">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddSocial} 
                    disabled={!socialInput || !socialPreview.isValid} 
                    className="text-sm"
                  >
                    Add {selectedSocial?.label}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Social Links List */}
          <div className="space-y-3 sm:space-y-4">
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
                  className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#1A1D24]/90 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all min-w-0 group"
                >
                  {Icon && (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-scan-blue/10 dark:bg-scan-blue/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-scan-blue/20 dark:group-hover:bg-scan-blue/30 transition-colors">
                      <Icon className="text-xl sm:text-2xl text-scan-blue" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm sm:text-base font-semibold truncate text-gray-900 dark:text-white">
                        {link.label}
                      </div>
                      {displayUsername && (
                        <div className="text-xs sm:text-sm text-scan-blue dark:text-scan-blue-light font-medium bg-scan-blue/10 dark:bg-scan-blue/20 px-2 py-1 rounded-md flex-shrink-0">
                          {displayUsername}
                        </div>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{link.url}</div>
                  </div>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex-shrink-0" 
                    onClick={() => handleRemoveLink(links.indexOf(link))}
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Custom Links Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={cardBase}
        >
            <h3 className={cardTitle}>Custom Links</h3>
            <p className={cardDesc}>Add any other links you want to share. For example, your website, portfolio, or any other resource.</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
              <Input
                className="flex-1 bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:py-4 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all text-sm sm:text-base shadow-sm hover:shadow-md"
                placeholder="Label (e.g. Portfolio)"
                value={newLink.label}
                onChange={e => setNewLink({ ...newLink, label: e.target.value })}
              />
              <Input
                className="flex-1 bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:py-4 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all text-sm sm:text-base shadow-sm hover:shadow-md"
                placeholder="URL (e.g. https://...)"
                value={newLink.url}
                onChange={e => setNewLink({ ...newLink, url: e.target.value })}
              />
              <Button onClick={handleAddLink} className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-scan-blue hover:bg-scan-blue-dark shadow-lg hover:shadow-xl transition-all rounded-xl font-medium" disabled={!newLink.label || !newLink.url}>
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Add Link
              </Button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {customLinks.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Link className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No custom links added yet.</p>
                  <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">Add your website, portfolio, or any other links above.</p>
                </div>
              )}
              {customLinks.map((link: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#1A1D24]/90 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all min-w-0 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-scan-blue/10 dark:bg-scan-blue/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-scan-blue/20 dark:group-hover:bg-scan-blue/30 transition-colors">
                    <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-scan-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-semibold truncate text-gray-900 dark:text-white">{link.label}</div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{link.url}</div>
                  </div>
                  <Button 
            type="button"
                    variant="ghost" 
                    size="icon"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex-shrink-0" 
                    onClick={() => handleRemoveLink(links.indexOf(link))}
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </motion.div>
              ))}
        </div>
          </motion.div>

      {/* Save Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mt-4 mb-8 sm:mb-0"
        >
        <Button
          onClick={handleSave}
            className="h-12 sm:h-14 px-8 sm:px-12 bg-gradient-to-r from-scan-blue to-scan-purple text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:from-scan-blue-dark hover:to-scan-purple/80 transition-all text-sm sm:text-base min-w-[200px] sm:min-w-[240px]"
          disabled={saving}
        >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {!profile ? 'Create Profile' : 'Save Changes'}
              </>
            )}
        </Button>
        </motion.div>
        
      </div>
    </>
  );
} 