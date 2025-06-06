import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useProfile } from '@/contexts/ProfileContext';
import { useState, useEffect, useRef } from 'react';
import AvatarUploader from '@/components/AvatarUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

import { motion } from 'framer-motion';
import { Camera, Plus, X, Phone } from 'lucide-react';
import { FaInstagram, FaTwitter, FaSnapchat, FaTiktok, FaWhatsapp, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa6';

const SOCIAL_PRESETS = [
  { label: 'Instagram', icon: FaInstagram, placeholder: 'Instagram username', urlPrefix: 'https://instagram.com/' },
  { label: 'X', icon: FaTwitter, placeholder: 'X (Twitter) username', urlPrefix: 'https://x.com/' },
  { label: 'Snapchat', icon: FaSnapchat, placeholder: 'Snapchat username', urlPrefix: 'https://snapchat.com/add/' },
  { label: 'TikTok', icon: FaTiktok, placeholder: 'TikTok username', urlPrefix: 'https://tiktok.com/@' },
  { label: 'WhatsApp', icon: FaWhatsapp, placeholder: 'WhatsApp number', urlPrefix: 'https://wa.me/' },
  { label: 'YouTube', icon: FaYoutube, placeholder: 'YouTube channel', urlPrefix: 'https://youtube.com/' },
  { label: 'Facebook', icon: FaFacebook, placeholder: 'Facebook profile', urlPrefix: 'https://facebook.com/' },
  { label: 'LinkedIn', icon: FaLinkedin, placeholder: 'LinkedIn profile', urlPrefix: 'https://linkedin.com/in/' },
];

export default function DashboardProfile() {
  const { session, loading: authLoading } = useAuthGuard();
  const { profile, loading: profileLoading, setProfile } = useProfile();
  const [name, setName] = useState(profile?.name || '');
  const [title, setTitle] = useState(profile?.title || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [links, setLinks] = useState(profile?.links || []);
  const [newLink, setNewLink] = useState({ label: '', url: '' });
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState(profile?.slug || '');
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const slugCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const avatarTriggerRef = useRef<HTMLDivElement>(null);
  const [showSocialDialog, setShowSocialDialog] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState(null);
  const [socialInput, setSocialInput] = useState('');
  const [phone, setPhone] = useState(profile?.phone || '');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setTitle(profile.title || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setLinks(Array.isArray(profile.links) ? profile.links : []);
      setSlug(profile.slug || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

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

  const handlePresetClick = (preset) => {
    setSelectedSocial(preset);
    setSocialInput('');
    setShowSocialDialog(true);
  };
  const handleAddSocial = () => {
    if (!selectedSocial || !socialInput) return;
    setLinks([...links, { label: selectedSocial.label, url: selectedSocial.urlPrefix + socialInput }]);
    setShowSocialDialog(false);
    setSelectedSocial(null);
    setSocialInput('');
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
      if (!profile) {
        // Create new profile
        const { data, error } = await supabase.from('profiles').insert({
          id: session.user.id,
          user_id: session.user.id,
          name,
          title,
          bio,
          avatar_url: avatarUrl,
          links,
          slug,
          phone,
        }).select().single();
        if (error) throw error;
        setProfile(data);
        toast.success('Profile created successfully!');
      } else {
        // Update existing profile
      const { data, error } = await supabase.from('profiles').update({
        name,
        title,
        bio,
        avatar_url: avatarUrl,
        links,
        slug,
          phone,
      }).eq('id', profile.id).select().single();
      if (error) throw error;
      setProfile(data);
      toast.success('Profile updated!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    }
    setSaving(false);
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
  const cardBase = 'relative rounded-2xl shadow-lg p-6 sm:p-8 bg-white/95 dark:bg-[#1A1D24]/95 border border-gray-200/50 dark:border-scan-blue/20 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:bg-white dark:hover:bg-[#1A1D24]';
  const cardTitle = 'text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white';
  const cardDesc = 'text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed';

  return (
    <div className="w-full max-w-6xl xl:max-w-7xl mx-auto flex-1 flex flex-col h-full pb-24 sm:pb-8 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6 px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-20 overflow-x-hidden">
      {/* Profile Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cardBase}
      >
        <h2 className={cardTitle}>Your Digital Identity</h2>
        <p className={cardDesc}>Create your unique digital presence that will be displayed when someone scans your QR code.</p>
        
        {!profile && (
          <div className="mb-6 p-5 bg-gradient-to-r from-scan-blue/5 to-scan-purple/5 dark:from-scan-blue/10 dark:to-scan-purple/10 border border-scan-blue/20 dark:border-scan-blue/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-scan-blue rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-scan-blue dark:text-scan-blue-light">Welcome! Let's create your digital profile</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              Fill in your information below to create your digital business card. Don't worry, you can always edit this later!
            </p>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 lg:gap-12 xl:gap-16">
          {/* Avatar Section */}
          <div className="flex flex-col items-center lg:items-start gap-4 w-full lg:w-1/3 xl:w-1/4">
            <div ref={avatarTriggerRef} className="relative group cursor-pointer select-none">
                              <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 xl:w-52 xl:h-52 rounded-full overflow-hidden border-4 border-scan-blue/20 dark:border-scan-blue/30 bg-gradient-to-br from-scan-blue/10 to-scan-purple/10 dark:from-scan-blue/20 dark:to-scan-purple/20 flex items-center justify-center transition-all duration-300 group-hover:border-scan-blue/40 dark:group-hover:border-scan-blue/50">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-400 text-4xl sm:text-5xl">?</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
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
              <div className="flex flex-col items-center mt-2 sm:mt-3 gap-1">
              {!avatarUrl ? (
                <span
                    className="text-xs sm:text-sm text-scan-blue dark:text-blue-400 font-medium hover:text-scan-blue-dark transition-colors cursor-pointer"
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && avatarTriggerRef.current?.click()}
                >
                  Upload a photo
                </span>
              ) : (
                <>
                  <span
                      className="text-xs sm:text-sm text-scan-blue dark:text-blue-400 font-medium hover:text-scan-blue-dark transition-colors cursor-pointer"
                    tabIndex={0}
                    role="button"
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && avatarTriggerRef.current?.click()}
                  >
                    Change photo
                  </span>
                  <button
                    type="button"
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    onClick={handleRemoveAvatar}
                  >
                    Remove photo
                  </button>
                </>
              )}
            </div>
          </div>
          </div>

          {/* Profile Fields */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">Full Name</label>
              <Input
                className="w-full bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all text-sm shadow-sm"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">Title / Role</label>
              <Input
                className="w-full bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all text-sm shadow-sm"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">Bio</label>
              <Textarea
                className="w-full bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all min-h-[100px] text-sm shadow-sm"
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200 flex items-center gap-1"><Phone className="w-4 h-4 inline-block mr-1" /> Phone Number</label>
              <Input
                className="w-full bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all text-sm shadow-sm"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. +1234567890"
                type="tel"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">Username</label>
              <div className="relative">
                <Input
                  className="w-full bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all text-sm shadow-sm"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="your-username"
                />
                {checkingSlug && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {slug && (
                <div className="mt-1 text-xs">
                  {checkingSlug ? (
                    <span className="text-gray-500">Checking availability...</span>
                  ) : slugAvailable ? (
                    <span className="text-green-600">✓ Available</span>
                  ) : (
                    <span className="text-red-600">✗ Username taken</span>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-all">
                Your profile will be available at: {window.location.origin}/profile/{slug || 'your-username'}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
          {availablePresets.map(preset => (
            <button
              key={preset.label}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-[#1A1D24]/90 hover:bg-scan-blue/5 dark:hover:bg-scan-blue/10 hover:border-scan-blue/30 transition-all focus:outline-none focus:ring-2 focus:ring-scan-blue/30 shadow-sm hover:shadow-md min-w-0"
              onClick={() => handlePresetClick(preset)}
              type="button"
            >
              <preset.icon className="text-lg sm:text-xl lg:text-2xl flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate min-w-0">{preset.label}</span>
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
              className="relative z-10 bg-white/95 dark:bg-[#1A1D24]/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-sm mx-3"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <selectedSocial.icon className="text-xl sm:text-2xl" />
                <h4 className="text-base sm:text-lg font-semibold">Add {selectedSocial?.label}</h4>
              </div>
              <Input
                autoFocus
                placeholder={selectedSocial?.placeholder}
                value={socialInput}
                onChange={e => setSocialInput(e.target.value)}
                className="mb-3 sm:mb-4 text-sm"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowSocialDialog(false)} className="text-sm">Cancel</Button>
                <Button onClick={handleAddSocial} disabled={!socialInput} className="text-sm">Add</Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Social Links List */}
        <div className="space-y-3 lg:space-y-4">
          {socialLinks.map((link: any, idx: number) => {
            const preset = SOCIAL_PRESETS.find(p => p.label === link.label);
            const Icon = preset ? preset.icon : null;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white/95 dark:bg-[#1A1D24]/90 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all min-w-0"
              >
                {Icon && <Icon className="text-lg sm:text-xl lg:text-2xl flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{link.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{link.url}</div>
            </div>
                <Button 
            type="button"
                  variant="ghost" 
                  size="icon"
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 h-8 w-8 sm:h-9 sm:w-9" 
                  onClick={() => handleRemoveLink(links.indexOf(link))}
          >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
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
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 mb-6">
            <Input
              className="flex-1 bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all text-sm shadow-sm"
              placeholder="Label (e.g. Portfolio)"
              value={newLink.label}
              onChange={e => setNewLink({ ...newLink, label: e.target.value })}
            />
            <Input
              className="flex-1 bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all text-sm shadow-sm"
              placeholder="URL (e.g. https://...)"
              value={newLink.url}
              onChange={e => setNewLink({ ...newLink, url: e.target.value })}
            />
            <Button onClick={handleAddLink} className="h-12 px-6 text-sm bg-scan-blue hover:bg-scan-blue-dark shadow-sm" disabled={!newLink.label || !newLink.url}>Add</Button>
          </div>
          <div className="space-y-3 lg:space-y-4">
            {customLinks.length === 0 && <div className="text-sm text-gray-400">No custom links added yet.</div>}
            {customLinks.map((link: any, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white/95 dark:bg-[#1A1D24]/90 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all min-w-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{link.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{link.url}</div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 h-8 w-8 sm:h-9 sm:w-9" 
                  onClick={() => handleRemoveLink(links.indexOf(link))}
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
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
        className="flex justify-center sm:justify-end mt-2 mb-4 sm:mb-0"
      >
        <Button
          onClick={handleSave}
          className="h-10 sm:h-12 px-6 sm:px-8 bg-gradient-to-r from-scan-blue to-scan-purple text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:from-scan-blue-dark hover:to-scan-purple/80 transition-all text-xs sm:text-sm"
          disabled={saving}
        >
          {saving ? 'Saving...' : (!profile ? 'Create Profile' : 'Save Changes')}
        </Button>
      </motion.div>
      
    </div>
  );
} 