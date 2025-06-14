import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Scan2TapLogo from "@/components/Scan2TapLogo";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2, User, ArrowRight, Globe, ArrowLeft, Upload, Wand2, ChevronRight, Link, Plus, Trash2 } from "lucide-react";
import { FaInstagram, FaTwitter, FaSnapchat, FaTiktok, FaWhatsapp, FaYoutube, FaFacebook, FaLinkedin, FaSpotify, FaPinterest, FaTwitch } from 'react-icons/fa6';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from '@/components/ui/loading';

// Simple Threads icon component
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.2 1.8c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10zm0 1.5c-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5 8.5-3.8 8.5-8.5-3.8-8.5-8.5-8.5zm-1.5 4.5h3v1.5h-3v4.5h3v1.5h-4.5v-7.5z"/>
  </svg>
);

// Predefined avatar options
const AVATAR_OPTIONS = [
  {
    id: 'avatar1',
    type: 'preset',
    url: '/avatars/avatar1.png',
    alt: 'Avatar 1'
  },
  {
    id: 'avatar2', 
    type: 'preset',
    url: '/avatars/avatar2.png',
    alt: 'Avatar 2'
  },
  {
    id: 'avatar3',
    type: 'preset',
    url: '/avatars/avatar3.png',
    alt: 'Avatar 3'
  },
  {
    id: 'upload',
    type: 'upload',
    style: 'bg-gray-100 border-2 border-dashed border-gray-300',
    alt: 'Upload custom'
  }
];

// Popular platforms for selection
const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    bgColor: 'bg-gradient-to-br from-pink-500 to-orange-500',
    placeholder: '@username',
    urlFormat: (username: string) => `https://instagram.com/${username.replace('@', '')}`
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: FaWhatsapp,
    bgColor: 'bg-green-500',
    placeholder: '+1234567890',
    urlFormat: (phone: string) => `https://wa.me/${phone.replace(/[^0-9]/g, '')}`
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: FaTiktok,
    bgColor: 'bg-black',
    placeholder: '@username',
    urlFormat: (username: string) => `https://tiktok.com/@${username.replace('@', '')}`
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: FaYoutube,
    bgColor: 'bg-red-500',
    placeholder: '@username or full URL',
    urlFormat: (input: string) => input.includes('youtube.com') ? input : `https://youtube.com/@${input.replace('@', '')}`
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: FaSnapchat,
    bgColor: 'bg-yellow-400',
    placeholder: 'username',
    urlFormat: (username: string) => `https://snapchat.com/add/${username}`
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: FaLinkedin,
    bgColor: 'bg-blue-600',
    placeholder: 'username or full URL',
    urlFormat: (input: string) => input.includes('linkedin.com') ? input : `https://linkedin.com/in/${input}`
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: FaFacebook,
    bgColor: 'bg-blue-600',
    placeholder: 'username or full URL',
    urlFormat: (input: string) => input.includes('facebook.com') ? input : `https://facebook.com/${input}`
  },
  {
    id: 'twitter',
    name: 'X',
    icon: FaTwitter,
    bgColor: 'bg-black',
    placeholder: '@username',
    urlFormat: (username: string) => `https://x.com/${username.replace('@', '')}`
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: FaSpotify,
    bgColor: 'bg-green-500',
    placeholder: 'Artist/Playlist URL',
    urlFormat: (input: string) => input.includes('spotify.com') ? input : `https://open.spotify.com/user/${input}`
  },
  {
    id: 'website',
    name: 'Website',
    icon: Globe,
    bgColor: 'bg-gradient-to-br from-gray-600 to-gray-700',
    placeholder: 'https://yourwebsite.com',
    urlFormat: (url: string) => url.startsWith('http') ? url : `https://${url}`
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: FaPinterest,
    bgColor: 'bg-red-600',
    placeholder: 'username',
    urlFormat: (username: string) => `https://pinterest.com/${username}`
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: FaTwitch,
    bgColor: 'bg-purple-600',
    placeholder: 'username',
    urlFormat: (username: string) => `https://twitch.tv/${username}`
  }
];

interface OnboardingStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  submitting: boolean;
}

// Step 1: Username Selection Component
function UsernameStep({ currentStep, totalSteps, onNext, onBack, onSkip, submitting }: OnboardingStepProps) {
  const { session } = useAuth();
  const { profile } = useProfile();
  const [username, setUsername] = useState(profile?.slug || "");
  const [fullName, setFullName] = useState(profile?.name || "");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState("");

  // Validate username format
  const validateUsername = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleaned.length < 3) return { isValid: false, message: "Username must be at least 3 characters" };
    if (cleaned.length > 30) return { isValid: false, message: "Username must be less than 30 characters" };
    if (!/^[a-z]/.test(cleaned)) return { isValid: false, message: "Username must start with a letter" };
    return { isValid: true, message: "" };
  };

  // Check username availability
  const checkUsername = async (value: string) => {
    const validation = validateUsername(value);
    if (!validation.isValid) {
      setError(validation.message);
      setAvailable(false);
      setChecking(false);
      return;
    }

    if (!value) {
      setAvailable(false);
      setChecking(false);
      setError("");
      return;
    }
    
    setChecking(true);
    setError("");
    
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("slug", value)
        .neq("id", profile?.id || "")
        .maybeSingle();
      
      setAvailable(!data);
      if (data) {
        setError("This username is already taken. Try another one!");
      }
    } catch (err) {
      setError("Unable to check username availability. Please try again.");
      setAvailable(false);
    }
    setChecking(false);
  };

  // Handle username input change
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    setUsername(value);
    setError("");
    setAvailable(false);
  };

  // Check username on input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username) {
        checkUsername(username);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleContinue = () => {
    if (available && username && fullName.trim()) {
      // Store username and full name for later use
      sessionStorage.setItem('onboarding_username', username);
      sessionStorage.setItem('onboarding_fullname', fullName.trim());
      onNext();
    }
  };

  const handleSkipStep = () => {
    // Generate a random username for skipping
    const randomUsername = `user${Date.now().toString().slice(-6)}`;
    const defaultName = session?.user?.email?.split('@')[0] || 'User';
    sessionStorage.setItem('onboarding_username', randomUsername);
    sessionStorage.setItem('onboarding_fullname', defaultName);
    onSkip();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Username</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{currentStep} of {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm relative overflow-hidden"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-serif">
            Create Your Profile
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            Set up your unique Scan2Tap identity
          </p>
        </div>

        {/* Full Name Input */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-base font-bold">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={submitting}
            className="h-12 text-base"
          />
        </div>
        
        {/* URL Preview */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-base">
            <Globe className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-gray-500 flex-shrink-0">scan2tap.com/</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 truncate">
              {username || 'yourusername'}
            </span>
          </div>
        </div>

        {/* Username Input */}
        <div className="space-y-3">
          <Label htmlFor="username" className="text-base font-bold">Username</Label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={handleUsernameChange}
              disabled={submitting}
              className={`pl-10 pr-10 h-12 text-base ${
                username && error ? 'border-red-300' : 
                username && available ? 'border-green-300' :
                'border-gray-300'
              }`}
            />
            <User className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
            
            {/* Status Icon */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {checking && <Loading size="sm" />}
              {!checking && username && error && <AlertCircle className="h-4 w-4 text-red-500" />}
              {!checking && username && available && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
          {!error && username && available && (
            <p className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Perfect! This username is available
            </p>
          )}
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!username || !available || !fullName.trim() || checking || submitting}
          className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loading size="sm" />
              Setting up...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Step 2: Profile Details Component
function ProfileStep({ currentStep, totalSteps, onNext, onBack, onSkip, submitting }: OnboardingStepProps) {
  const { session } = useAuth();
  const { profile } = useProfile();
  const [selectedAvatar, setSelectedAvatar] = useState<string>('avatar1');
  const [profileTitle, setProfileTitle] = useState("");
  const [bio, setBio] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);

  // Handle file upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session?.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setUploadedImage(publicUrl);
      setSelectedAvatar('upload');
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload image. Please try again.");
    }
    setUploading(false);
  };

  // Generate AI bio
  const generateBio = async () => {
    if (!profileTitle.trim()) {
      toast.error("Please add a title first to generate a bio");
      return;
    }

    setGeneratingBio(true);
    try {
      const templates = [
        `Passionate ${profileTitle} with a drive for excellence and innovation.`,
        `Experienced ${profileTitle} dedicated to making a positive impact.`,
        `Creative ${profileTitle} who loves turning ideas into reality.`,
        `Results-driven ${profileTitle} with a passion for problem-solving.`
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      setBio(randomTemplate);
      toast.success("Bio generated!");
    } catch (error) {
      toast.error("Failed to generate bio. Please try again.");
    }
    setGeneratingBio(false);
  };

  // Get user initials
  const getUserInitials = () => {
    const savedFullName = sessionStorage.getItem('onboarding_fullname');
    if (savedFullName) {
      const names = savedFullName.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
      }
      return savedFullName.charAt(0).toUpperCase();
    }
    if (!session?.user?.email) return 'U';
    const email = session.user.email;
    return email.charAt(0).toUpperCase();
  };

  const handleContinue = () => {
    // Store profile data for completion
    const avatarData = selectedAvatar === 'upload' 
      ? { type: 'upload', url: uploadedImage }
      : AVATAR_OPTIONS.find(opt => opt.id === selectedAvatar);
      
    sessionStorage.setItem('onboarding_profile', JSON.stringify({
      selectedAvatar,
      profileTitle,
      bio,
      avatarData
    }));
    onNext();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Profile Details</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{currentStep} of {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm relative overflow-hidden"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-serif">
            Add Profile Details
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            Complete your profile
          </p>
        </div>

        {/* Avatar Selection */}
        <div>
          <Label className="text-base font-bold mb-3 block">Profile Image</Label>
          <div className="flex justify-center gap-3">
            {AVATAR_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  if (option.type === 'upload') {
                    document.getElementById('avatar-upload')?.click();
                  } else {
                    setSelectedAvatar(option.id);
                  }
                }}
                className={`relative w-16 h-16 rounded-full border-2 transition-all ${
                  selectedAvatar === option.id 
                    ? 'border-blue-500' 
                    : 'border-gray-200'
                }`}
              >
                {option.type === 'upload' ? (
                  <div className="w-full h-full rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    {uploading ? (
                      <Loading size="sm" />
                    ) : uploadedImage && selectedAvatar === 'upload' ? (
                      <img src={uploadedImage} alt="Uploaded" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                ) : (
                  <img 
                    src={option.url} 
                    alt={option.alt}
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-base font-bold">Title</Label>
          <Input
            id="title"
            placeholder="e.g., Software Engineer"
            value={profileTitle}
            onChange={(e) => setProfileTitle(e.target.value)}
            className="mt-2 h-12 text-base"
          />
        </div>

        {/* Bio */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="bio" className="text-base font-bold">Bio</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateBio}
              disabled={generatingBio || !profileTitle.trim()}
              className="h-8 text-sm font-bold"
            >
              {generatingBio ? (
                <Loading size="sm" />
              ) : (
                <><Wand2 className="w-4 h-4 mr-1" />AI</>
              )}
            </Button>
          </div>
          <Textarea
            id="bio"
            placeholder="Tell people about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 80))}
            className="resize-none h-20 text-base"
            rows={3}
          />
          <p className="text-sm text-gray-400 mt-2">{bio.length}/80</p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={submitting}
          className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loading size="sm" />
              Setting up...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Step 3: Platform Selection Component
function PlatformStep({ currentStep, totalSteps, onNext, onBack, onSkip, submitting }: OnboardingStepProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        return prev.filter(id => id !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

  const handleContinue = () => {
    // Store selected platforms
    sessionStorage.setItem('onboarding_platforms', JSON.stringify(selectedPlatforms));
    onNext();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Choose Platforms</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{currentStep} of {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm relative overflow-hidden"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-serif">
            Which platforms are you on?
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            Select all that apply. You can always add more later.
          </p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {PLATFORMS.map((platform) => {
            const IconComponent = platform.icon;
            return (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`
                  group relative aspect-square flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10 rounded-[2rem] border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                  ${selectedPlatforms.includes(platform.id)
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 shadow-xl shadow-blue-500/20'
                    : 'border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:bg-white dark:hover:bg-gray-800/70 backdrop-blur-sm'
                  }
                `}
              >
                {/* Selection indicator */}
                {selectedPlatforms.includes(platform.id) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {/* Icon container */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl ${platform.bgColor} flex items-center justify-center text-white mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                  <IconComponent className="w-9 h-9 sm:w-11 sm:h-11 lg:w-13 lg:h-13" />
                </div>
                
                {/* Platform name */}
                <span className="text-sm sm:text-base lg:text-lg font-bold text-center leading-tight text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {platform.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selection Counter */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={submitting}
          className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loading size="sm" />
              Setting up...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Step 4: Social Links Component
function SocialLinksStep({ currentStep, totalSteps, onNext, onBack, onSkip, submitting }: OnboardingStepProps) {
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem('onboarding_platforms');
    if (saved) {
      setSelectedPlatforms(JSON.parse(saved));
    }
  }, []);

  const handleLinkChange = (platformId: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platformId]: value
    }));
  };

  const handleContinue = () => {
    // Store social links
    sessionStorage.setItem('onboarding_social_links', JSON.stringify(socialLinks));
    onNext();
  };

  const getPlatformData = (platformId: string) => {
    return PLATFORMS.find(p => p.id === platformId);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Add Your Links</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{currentStep} of {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm relative overflow-hidden"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-serif">
            Add Your Links
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            Add your usernames or profile links
          </p>
        </div>

        {selectedPlatforms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No platforms selected. You can skip this step.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedPlatforms.map((platformId) => {
              const platform = getPlatformData(platformId);
              if (!platform) return null;

              const IconComponent = platform.icon;
              
              return (
                <div key={platformId} className="relative">
                  <div className="flex items-center gap-3 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${platform.bgColor} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <Input
                      placeholder={platform.placeholder}
                      value={socialLinks[platformId] || ''}
                      onChange={(e) => handleLinkChange(platformId, e.target.value)}
                      className="flex-1 h-12 text-base border-0 bg-transparent focus:ring-0 focus:border-0 px-0"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={submitting}
          className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loading size="sm" />
              Setting up...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Step 5: Additional URLs Component
function AdditionalUrlsStep({ currentStep, totalSteps, onNext, onBack, onSkip, submitting }: OnboardingStepProps) {
  const [additionalUrls, setAdditionalUrls] = useState<Array<{ label: string; url: string }>>([
    { label: '', url: '' }
  ]);

  const handleUrlChange = (index: number, field: 'label' | 'url', value: string) => {
    setAdditionalUrls(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addUrl = () => {
    setAdditionalUrls(prev => [...prev, { label: '', url: '' }]);
  };

  const removeUrl = (index: number) => {
    if (additionalUrls.length > 1) {
      setAdditionalUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleComplete = () => {
    // Filter out empty entries
    const validUrls = additionalUrls.filter(item => item.label.trim() && item.url.trim());
    sessionStorage.setItem('onboarding_additional_urls', JSON.stringify(validUrls));
    onNext(); // This will trigger the final completion
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Additional Links</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{currentStep} of {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm relative overflow-hidden"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-serif">
            Additional Links
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            Add any other links you'd like to share
          </p>
        </div>

        <div className="space-y-4">
          {additionalUrls.map((item, index) => (
            <div key={index} className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="flex justify-between items-center">
                <Label className="text-base font-bold">Link #{index + 1}</Label>
                {additionalUrls.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUrl(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <Input
                  placeholder="Label (e.g., Portfolio, Blog)"
                  value={item.label}
                  onChange={(e) => handleUrlChange(index, 'label', e.target.value)}
                  className="h-12 text-base"
                />
                <Input
                  placeholder="https://example.com"
                  value={item.url}
                  onChange={(e) => handleUrlChange(index, 'url', e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addUrl}
            className="w-full h-12 text-base font-bold border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Link
          </Button>
        </div>

        {/* Complete Button */}
        <Button
          onClick={handleComplete}
          disabled={submitting}
          className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loading size="sm" />
              Setting up...
            </>
          ) : (
            <>
              Complete Setup
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Main Onboarding Page
export default function OnboardingPage() {
  const { session } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const totalSteps = 5;

  // Get intended plan from location state (passed from AuthPage)
  const intendedPlan = location.state?.intendedPlan;
  const billingCycle = location.state?.billingCycle || 'monthly';

  // Redirect if already onboarded
  useEffect(() => {
    if (profile?.onboarding_complete) {
      // If user intended to get Pro plan, redirect to payment flow
      if (intendedPlan === 'pro') {
        navigate('/pricing', { 
          replace: true,
          state: { 
            message: 'Complete your Pro subscription to unlock premium features.',
            highlightPro: true,
            autoTriggerUpgrade: true,
            billingCycle: billingCycle
          }
        });
      } else {
        // Navigate to original intended location or dashboard profile as fallback
        const from = location.state?.from?.pathname || '/dashboard/profile';
        navigate(from, { replace: true });
      }
    }
  }, [profile, navigate, location, intendedPlan, billingCycle]);

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleSkip = () => {
    // If user intended to get Pro plan, redirect to payment flow
    if (intendedPlan === 'pro') {
      navigate('/pricing', { 
        replace: true,
        state: { 
          message: 'Complete your Pro subscription to unlock premium features.',
          highlightPro: true,
          autoTriggerUpgrade: true,
          billingCycle: billingCycle
        }
      });
    } else {
      // Navigate to original intended location or dashboard profile as fallback
      const from = location.state?.from?.pathname || '/dashboard/profile';
      navigate(from, { replace: true });
    }
  };

  // Complete onboarding
  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const savedUsername = sessionStorage.getItem('onboarding_username');
      const savedFullName = sessionStorage.getItem('onboarding_fullname');
      const savedProfile = sessionStorage.getItem('onboarding_profile');
      const savedPlatforms = sessionStorage.getItem('onboarding_platforms');
      const savedSocialLinks = sessionStorage.getItem('onboarding_social_links');
      const savedAdditionalUrls = sessionStorage.getItem('onboarding_additional_urls');
      
      const profileData = savedProfile ? JSON.parse(savedProfile) : {};
      const platformsData = savedPlatforms ? JSON.parse(savedPlatforms) : [];
      const socialLinksData = savedSocialLinks ? JSON.parse(savedSocialLinks) : {};
      const additionalUrlsData = savedAdditionalUrls ? JSON.parse(savedAdditionalUrls) : [];
      
      // Use saved data or generate defaults
      const finalUsername = savedUsername || `user${Date.now().toString().slice(-6)}`;
      const finalFullName = savedFullName || session?.user?.email?.split('@')[0] || 'User';
      
      // Handle avatar URL based on selection
      let avatarUrl = null;
      if (profileData.avatarData) {
        if (profileData.avatarData.type === 'upload') {
          avatarUrl = profileData.avatarData.url;
        } else if (profileData.avatarData.type === 'preset') {
          avatarUrl = profileData.avatarData.url;
        }
      }

      // Prepare links array for the profiles table
      const allLinks = [];

      // Add social platform links
      platformsData.forEach((platformId: string) => {
        const platform = PLATFORMS.find(p => p.id === platformId);
        const linkValue = socialLinksData[platformId];
        
        if (platform && linkValue && linkValue.trim()) {
          let finalUrl = linkValue.trim();
          
          // Format URL using platform's urlFormat function
          try {
            finalUrl = platform.urlFormat(linkValue.trim());
          } catch (error) {
            // If URL formatting fails, use the original value
            console.warn(`Failed to format URL for ${platform.name}:`, error);
          }

          allLinks.push({
            label: platform.name,
            url: finalUrl
          });
        }
      });

      // Add additional custom URLs
      additionalUrlsData.forEach((urlData: { label: string; url: string }) => {
        if (urlData.label.trim() && urlData.url.trim()) {
          let finalUrl = urlData.url.trim();
          
          // Ensure URL has protocol
          if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = `https://${finalUrl}`;
          }

          allLinks.push({
            label: urlData.label.trim(),
            url: finalUrl
          });
        }
      });
      
      // Update profile with all data including links
      // IMPORTANT: Always create profile with 'free' plan - Pro access only after payment
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          name: finalFullName,
          slug: finalUsername,
          title: profileData.profileTitle?.trim() || null,
          bio: profileData.bio?.trim() || null,
          avatar_url: avatarUrl,
          links: allLinks, // Save links directly in the profiles table
          onboarding_complete: true,
          plan_type: 'free' // Always start with free plan - Pro requires payment
        })
        .eq("id", profile?.id);
      
      if (profileError) throw profileError;

      // Clear session storage
      sessionStorage.removeItem('onboarding_username');
      sessionStorage.removeItem('onboarding_fullname');
      sessionStorage.removeItem('onboarding_profile');
      sessionStorage.removeItem('onboarding_platforms');
      sessionStorage.removeItem('onboarding_social_links');
      sessionStorage.removeItem('onboarding_additional_urls');

      // Refresh profile data
      await refreshProfile();
      
      // Handle post-onboarding navigation based on intended plan
      if (intendedPlan === 'pro') {
        // User intended to get Pro plan - redirect to payment flow
        navigate('/pricing', { 
          replace: true,
          state: { 
            message: 'Welcome! Complete your Pro subscription to unlock unlimited features.',
            highlightPro: true,
            autoTriggerUpgrade: true,
            billingCycle: billingCycle
          }
        });
      } else {
        // Normal flow - navigate to original intended location or dashboard profile as fallback
        const from = location.state?.from?.pathname || '/dashboard/profile';
        navigate(from, { replace: true });
      }
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 overflow-x-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Top Navigation - Fixed at very top of screen */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="flex justify-between items-center px-4 lg:px-8 py-4 max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={submitting}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Home
          </Button>
          
          {/* Logo in center */}
          <div className="flex-1 flex justify-center">
            <Scan2TapLogo />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={submitting}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
          >
            Skip
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4 pt-24 relative z-10">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <UsernameStep
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                  submitting={submitting}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileStep
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                  submitting={submitting}
                />
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PlatformStep
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                  submitting={submitting}
                />
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SocialLinksStep
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                  submitting={submitting}
                />
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AdditionalUrlsStep
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                  submitting={submitting}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip Notice */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            You can always update your profile details later in dashboard
          </p>
        </div>
      </div>
    </div>
  );
} 