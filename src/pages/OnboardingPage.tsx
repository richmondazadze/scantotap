import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Scan2TapLogo from "@/components/Scan2TapLogo";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2, User, ArrowRight, Globe, ArrowLeft, Upload, Wand2, ChevronRight, Plus, Trash2, Users, Crown, Check, X, Star, Shield, Infinity, AtSign } from "lucide-react";
import { FaInstagram, FaTwitter, FaSnapchat, FaTiktok, FaWhatsapp, FaYoutube, FaFacebook, FaLinkedin, FaSpotify, FaPinterest, FaTwitch, FaTelegram, FaDiscord } from 'react-icons/fa6';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from '@/components/ui/loading';
import { PaystackService } from '@/services/paystackService';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import AIService from '@/services/aiService';
import BioEnhancementModal from '@/components/BioEnhancementModal';
import { EmailTriggers, EmailUtils } from '@/utils/emailHelpers';

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
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: FaTelegram,
    bgColor: 'bg-blue-500',
    placeholder: '@username',
    urlFormat: (username: string) => `https://t.me/${username.replace('@', '')}`
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: FaDiscord,
    bgColor: 'bg-indigo-600',
    placeholder: 'server invite',
    urlFormat: (input: string) => input.includes('discord.gg') ? input : `https://discord.gg/${input}`
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: AtSign,
    bgColor: 'bg-black',
    placeholder: '@username',
    urlFormat: (username: string) => `https://threads.net/@${username.replace('@', '')}`
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
            <span className="text-gray-500 flex-shrink-0">scan2tap.vercel.app/</span>
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
  const [showBioModal, setShowBioModal] = useState(false);

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

  // Generate AI bio - now opens modal
  const generateBio = () => {
    if (!bio.trim() && !profileTitle.trim()) {
      toast.error("Please enter some bio content first");
      return;
    }
    setShowBioModal(true);
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
              disabled={generatingBio || (!bio.trim() && !profileTitle.trim())}
              className="h-8 text-sm font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="flex items-center">
              {generatingBio ? (
                <Loading size="sm" />
              ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-1" />
                    <span className="font-bold">✨ AI</span>
                  </>
              )}
              </span>
            </Button>
          </div>
          <Textarea
            id="bio"
            placeholder="Tell people about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 100))}
            className="resize-none h-20 text-base"
            rows={3}
          />
          <p className="text-sm text-gray-400 mt-2">{bio.length}/100</p>
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

        {/* Bio Enhancement Modal */}
        <BioEnhancementModal
          isOpen={showBioModal}
          onClose={() => setShowBioModal(false)}
          currentBio={bio}
          title={profileTitle}
          name={sessionStorage.getItem('onboarding_fullname') || undefined}
          onBioSelect={(newBio) => setBio(newBio)}
        />
      </div>
    </div>
  );
}

// Step 3: Plan Selection Component
function PlanStep({ currentStep, totalSteps, onNext, onBack, onSkip, submitting }: OnboardingStepProps) {
  const { session } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free');
  const [isAnnual, setIsAnnual] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Get intended plan from location state (passed from pricing page)
  const intendedPlan = location.state?.intendedPlan;
  const billingCycle = location.state?.billingCycle || 'monthly';

  // Set initial plan selection based on intended plan
  useEffect(() => {
    if (intendedPlan === 'pro') {
      setSelectedPlan('pro');
      setIsAnnual(billingCycle === 'annually');
    }
  }, [intendedPlan, billingCycle]);

  const handlePlanSelect = (plan: 'free' | 'pro') => {
    setSelectedPlan(plan);
  };

  const handleContinue = async () => {
    if (selectedPlan === 'free') {
      // Store plan selection and continue to next step
      sessionStorage.setItem('onboarding_plan', JSON.stringify({
        planType: 'free',
        billingCycle: null
      }));
      onNext();
    } else {
      // Pro plan selected - handle payment
      if (!session?.user || !session.user.email) {
        toast.error('User information not available');
        return;
      }

      setProcessing(true);
      try {
        const result = await PaystackService.upgradeSubscription(
          session.user.id,
          session.user.email,
          profile?.name || 'User',
          isAnnual ? 'annually' : 'monthly'
        );

        // Store plan selection
        sessionStorage.setItem('onboarding_plan', JSON.stringify({
          planType: 'pro',
          billingCycle: isAnnual ? 'annually' : 'monthly',
          paymentReference: result.access_code
        }));

        // Payment successful, continue to next step
        toast.success('Payment successful! You now have Pro access.');
        onNext();
      } catch (error) {
        console.error('Payment error:', error);
        if (error instanceof Error && error.message === 'Payment cancelled by user') {
          toast.error('Payment was cancelled. You can continue with the free plan or try again.');
        } else {
          toast.error('Payment failed. You can continue with the free plan and upgrade later.');
        }
        // Allow user to continue with free plan on payment failure
        setSelectedPlan('free');
      } finally {
        setProcessing(false);
      }
    }
  };

  const planFeatures = {
    free: [
      { name: "Create a digital profile", included: true },
      { name: "Custom scan2tap link", included: true },
      { name: "Add up to 7 social or custom links", included: true },
      { name: "Dynamic QR code & download", included: true },
      { name: "Basic profile layout", included: true },
      { name: "Unlimited links", included: false },
    ],
    pro: [
      { name: "Everything in Free Plan", included: true },
      { name: "Unlimited links", included: true },
      { name: "All profile layout options", included: true },
      { name: "Coming soon: Profile analytics", included: true },
      { name: "Coming soon: Custom themes", included: true },
    ]
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Choose Your Plan</span>
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
            Choose Your Plan
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            Start free or unlock unlimited features with Pro
          </p>
        </div>

        {/* Billing Toggle - Only show for Pro plan */}
        {selectedPlan === 'pro' && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isAnnual ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold">
                Save 17%
              </div>
            )}
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div
            className={`relative rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer ${
              selectedPlan === 'free'
                ? 'ring-2 ring-blue-500 shadow-2xl shadow-blue-500/20 scale-[1.02]'
                : 'shadow-xl hover:shadow-2xl hover:scale-[1.01]'
            }`}
            onClick={() => handlePlanSelect('free')}
          >
            <div className="relative p-6 sm:p-8 h-full flex flex-col bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              {/* Selection indicator */}
              {selectedPlan === 'free' && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Plan Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Free Plan</h3>
                  <p className="text-base text-gray-600 dark:text-gray-400">Perfect for personal use</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
                  <span className="text-lg text-gray-600 dark:text-gray-400 mb-2">/forever</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Get started with basic features</p>
              </div>

              {/* Features */}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  What's included
                </h4>
                <div className="space-y-3">
                  {planFeatures.free.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        feature.included 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                      }`}>
                        {feature.included ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        feature.included ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div
            className={`relative rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer ${
              selectedPlan === 'pro'
                ? 'ring-2 ring-blue-500 shadow-2xl shadow-blue-500/20 scale-[1.02]'
                : 'shadow-xl hover:shadow-2xl hover:scale-[1.01]'
            }`}
            onClick={() => handlePlanSelect('pro')}
          >
            {/* Popular Badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Most Popular
              </div>
            </div>

            <div className="relative p-6 sm:p-8 h-full flex flex-col bg-gradient-to-br from-white via-white to-blue-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              {/* Selection indicator */}
              {selectedPlan === 'pro' && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Plan Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pro Plan</h3>
                  <p className="text-base text-gray-600 dark:text-gray-400">For professionals & creators</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-end gap-2 mb-2">
                  {isAnnual && (
                    <span className="text-xl text-gray-400 line-through">$48</span>
                  )}
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    ${isAnnual ? '40' : '4'}
                  </span>
                  <span className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Unlock unlimited features</p>
              </div>

              {/* Features */}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  What's included
                </h4>
                <div className="space-y-3">
                  {planFeatures.pro.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={submitting || processing}
          className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <Loading size="sm" />
              {selectedPlan === 'pro' ? 'Processing Payment...' : 'Setting up...'}
            </>
          ) : submitting ? (
            <>
              <Loading size="sm" />
              Setting up...
            </>
          ) : (
            <>
              {selectedPlan === 'pro' ? 'Continue with Pro' : 'Continue with Free'}
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>

        {/* Plan Change Notice */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can change your plan anytime from your dashboard
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 4: Platform Selection Component
function PlatformStep({ currentStep, totalSteps, onNext, onBack, onSkip, submitting }: OnboardingStepProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<{planType: 'free' | 'pro'; billingCycle: string | null}>({ planType: 'free', billingCycle: null });

  // Load saved plan data
  useEffect(() => {
    const savedPlan = sessionStorage.getItem('onboarding_plan');
    if (savedPlan) {
      setSelectedPlan(JSON.parse(savedPlan));
    }
  }, []);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        // Always allow deselection
        return prev.filter(id => id !== platformId);
      } else {
        // Check plan limits before adding
        if (selectedPlan.planType === 'free' && prev.length >= 7) {
          toast.error('Free plan is limited to 7 platforms. Upgrade to Pro for unlimited platforms!');
          return prev;
        }
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
          
          {/* Plan-based limit notice */}
          {selectedPlan.planType === 'free' && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Free Plan:</strong> You selected {selectedPlatforms.length} platforms. 
                Add your usernames or links for each platform next.
                {selectedPlatforms.length === 7 && (
                  <span className="block mt-1 text-blue-600 dark:text-blue-400">
                    You're using all 7 available platforms. Upgrade to Pro for unlimited platforms!
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {PLATFORMS.map((platform) => {
            const IconComponent = platform.icon;
            const isSelected = selectedPlatforms.includes(platform.id);
            const isDisabled = selectedPlan.planType === 'free' && !isSelected && selectedPlatforms.length >= 7;
            
            return (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                disabled={isDisabled}
                className={`
                  group relative aspect-square flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10 rounded-[2rem] border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                  ${isSelected
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 shadow-xl shadow-blue-500/20'
                    : isDisabled
                    ? 'border-gray-200/30 dark:border-gray-700/30 bg-gray-100/50 dark:bg-gray-800/30 opacity-50 cursor-not-allowed'
                    : 'border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:bg-white dark:hover:bg-gray-800/70 backdrop-blur-sm'
                  }
                `}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {/* Disabled indicator */}
                {isDisabled && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
                    <X className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {/* Icon container */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl ${platform.bgColor} flex items-center justify-center text-white mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 ${!isDisabled ? 'group-hover:scale-105' : ''} ${isDisabled ? 'opacity-60' : ''}`}>
                  <IconComponent className="w-9 h-9 sm:w-11 sm:h-11 lg:w-13 lg:h-13" />
                </div>
                
                {/* Platform name */}
                <span className={`text-sm sm:text-base lg:text-lg font-bold text-center leading-tight transition-colors ${
                  isDisabled 
                    ? 'text-gray-400 dark:text-gray-600' 
                    : 'text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'
                }`}>
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
              {selectedPlan.planType === 'free' && ` (${selectedPlatforms.length}/7)`}
            </p>
          </div>
        </div>

        {/* Upgrade prompt for free users at limit */}
        {selectedPlan.planType === 'free' && selectedPlatforms.length >= 7 && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Platform Limit Reached
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  You've reached the 7-platform limit for free accounts. Upgrade to Pro to add unlimited platforms!
                </p>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs"
                  onClick={() => {
                    window.open('/pricing?source=onboarding', '_blank');
                  }}
                >
                  Upgrade to Pro
                </Button>
              </div>
            </div>
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

// Step 5: Social Links Component
function SocialLinksStep({ currentStep, totalSteps, onNext, onBack, onSkip, submitting }: OnboardingStepProps) {
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<{planType: 'free' | 'pro'; billingCycle: string | null}>({ planType: 'free', billingCycle: null });
  const planFeatures = usePlanFeatures();

  useEffect(() => {
    const savedPlatforms = sessionStorage.getItem('onboarding_platforms');
    const savedPlan = sessionStorage.getItem('onboarding_plan');
    
    if (savedPlatforms) {
      setSelectedPlatforms(JSON.parse(savedPlatforms));
    }
    if (savedPlan) {
      setSelectedPlan(JSON.parse(savedPlan));
    }
  }, []);

  const handleLinkChange = (platformId: string, value: string) => {
    const updatedLinks = { ...socialLinks, [platformId]: value };
    setSocialLinks(updatedLinks);
    // Update session storage immediately for accurate cross-step calculations
    sessionStorage.setItem('onboarding_social_links', JSON.stringify(updatedLinks));
  };

  const handleContinue = () => {
    // Store social links (validation is now handled in platform selection step)
    sessionStorage.setItem('onboarding_social_links', JSON.stringify(socialLinks));
    onNext();
  };

  const getPlatformData = (platformId: string) => {
    return PLATFORMS.find(p => p.id === platformId);
  };

  // Calculate current link count for display purposes
  const currentLinkCount = Object.values(socialLinks).filter(link => link.trim()).length;

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
          
          {/* Plan-based link limit notice */}
          {selectedPlan.planType === 'free' && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Free Plan:</strong> You selected {selectedPlatforms.length} platforms. 
                Add your usernames or links for each platform below.
                {selectedPlatforms.length === 7 && (
                  <span className="block mt-1 text-blue-600 dark:text-blue-400">
                    You're using all 7 available platforms. Upgrade to Pro for unlimited platforms!
                  </span>
                )}
              </p>
            </div>
          )}
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
              const hasValue = socialLinks[platformId]?.trim();
              
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

// Step 6: Additional URLs Component
function AdditionalUrlsStep({ currentStep, totalSteps, onNext, onBack, onSkip, submitting }: OnboardingStepProps) {
  const [additionalUrls, setAdditionalUrls] = useState<Array<{ label: string; url: string }>>([
    { label: '', url: '' }
  ]);
  const [selectedPlan, setSelectedPlan] = useState<{planType: 'free' | 'pro'; billingCycle: string | null}>({ planType: 'free', billingCycle: null });

  // Load plan and calculate current usage
  useEffect(() => {
    const savedPlan = sessionStorage.getItem('onboarding_plan');
    if (savedPlan) {
      setSelectedPlan(JSON.parse(savedPlan));
    }
  }, []);

  const handleUrlChange = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...additionalUrls];
      updated[index] = { ...updated[index], [field]: value };
    setAdditionalUrls(updated);
    
    // Update session storage immediately for accurate cross-step calculations
    const validUrls = updated.filter(item => item.label.trim() && item.url.trim());
    sessionStorage.setItem('onboarding_additional_urls', JSON.stringify(validUrls));
  };

  const addUrl = () => {
    // Check plan limits before adding new URL
    if (selectedPlan.planType === 'free') {
      // Calculate current total links (social + additional)
      const savedSocialLinks = sessionStorage.getItem('onboarding_social_links');
      const socialLinksData = savedSocialLinks ? JSON.parse(savedSocialLinks) : {};
      const socialLinkCount = Object.values(socialLinksData).filter(link => link && (link as string).trim()).length;
      const additionalLinkCount = additionalUrls.filter(item => item.label.trim() && item.url.trim()).length;
      const totalLinks = socialLinkCount + additionalLinkCount;

      if (totalLinks >= 7) {
        toast.error('Free plan is limited to 7 links total. Upgrade to Pro for unlimited links!');
        return;
      }
    }

    const newUrls = [...additionalUrls, { label: '', url: '' }];
    setAdditionalUrls(newUrls);
    // Update session storage immediately for accurate calculations
    const validUrls = newUrls.filter(item => item.label.trim() && item.url.trim());
    sessionStorage.setItem('onboarding_additional_urls', JSON.stringify(validUrls));
  };

  const removeUrl = (index: number) => {
    if (additionalUrls.length > 1) {
      setAdditionalUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleComplete = () => {
    // Filter out empty entries
    const validUrls = additionalUrls.filter(item => item.label.trim() && item.url.trim());
    
    // Check total link limit for free users
    if (selectedPlan.planType === 'free') {
      const savedSocialLinks = sessionStorage.getItem('onboarding_social_links');
      const socialLinksData = savedSocialLinks ? JSON.parse(savedSocialLinks) : {};
      const socialLinkCount = Object.values(socialLinksData).filter(link => link && (link as string).trim()).length;
      const totalLinks = socialLinkCount + validUrls.length;

      if (totalLinks > 7) {
        toast.error('Free plan is limited to 7 links total. Please remove some links or upgrade to Pro.');
        return;
      }
    }

    sessionStorage.setItem('onboarding_additional_urls', JSON.stringify(validUrls));
    onNext(); // This will trigger the final completion
  };

  // Calculate current usage for display
  const savedSocialLinks = sessionStorage.getItem('onboarding_social_links');
  const socialLinksData = savedSocialLinks ? JSON.parse(savedSocialLinks) : {};
  const socialLinkCount: number = Object.values(socialLinksData).filter(link => link && (link as string).trim()).length;
  const additionalLinkCount: number = additionalUrls.filter(item => item.label.trim() && item.url.trim()).length;
  const totalLinkCount: number = socialLinkCount + additionalLinkCount;
  const canAddMoreLinks: boolean = selectedPlan.planType === 'pro' || totalLinkCount < 7;

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
          
          {/* Plan-based link limit notice */}
          {selectedPlan.planType === 'free' && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Free Plan:</strong> You have {socialLinkCount} social links. 
                {socialLinkCount < 7 ? (
                  <>You can add up to {7 - socialLinkCount} additional links</>
                ) : (
                  <>You've reached the maximum of 7 links</>
                )}
                {' '}(Total: {totalLinkCount} of 7 links used).
                {!canAddMoreLinks && (
                  <span className="block mt-1 text-blue-600 dark:text-blue-400">
                    Upgrade to Pro for unlimited links!
                  </span>
                )}
              </p>
            </div>
          )}
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

          {canAddMoreLinks && (
          <Button
            variant="outline"
            onClick={addUrl}
            className="w-full h-12 text-base font-bold border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Link
            </Button>
          )}

          {/* Upgrade prompt for free users reaching limit */}
          {selectedPlan.planType === 'free' && totalLinkCount >= 7 && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                    Link Limit Reached
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    You've reached the 7-link limit for free accounts. Upgrade to Pro to add unlimited links!
                  </p>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs"
                    onClick={() => {
                      window.open('/pricing?source=onboarding', '_blank');
                    }}
                  >
                    Upgrade to Pro
          </Button>
                </div>
              </div>
            </div>
          )}
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
  const totalSteps = 6;

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

  // Send welcome email when new user starts onboarding
  useEffect(() => {
    // Only send welcome email if:
    // 1. User is authenticated
    // 2. Profile exists but onboarding is not complete
    // 3. We haven't already sent it (check sessionStorage to avoid duplicates)
    if (session?.user?.email && profile && !profile.onboarding_complete) {
      const welcomeEmailSent = sessionStorage.getItem('welcome_email_sent');
      
      if (!welcomeEmailSent) {
        const sendWelcomeEmail = async () => {
          try {
            const userName = profile.name || session.user.email?.split('@')[0] || 'User';
            const username = profile.slug || `user${Date.now().toString().slice(-6)}`;
            
            await EmailTriggers.sendWelcomeEmail(
              session.user.email,
              userName,
              username
            );
            
            console.log('Welcome email sent to:', session.user.email);
            sessionStorage.setItem('welcome_email_sent', 'true');
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't block the flow if email fails
          }
        };
        
        sendWelcomeEmail();
      }
    }
  }, [session, profile]);

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
    // Skip functionality should only advance to next step, not complete onboarding
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // If on last step, complete onboarding
      handleComplete();
    }
  };

  // Complete onboarding
  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const savedUsername = sessionStorage.getItem('onboarding_username');
      const savedFullName = sessionStorage.getItem('onboarding_fullname');
      const savedProfile = sessionStorage.getItem('onboarding_profile');
      const savedPlan = sessionStorage.getItem('onboarding_plan');
      const savedPlatforms = sessionStorage.getItem('onboarding_platforms');
      const savedSocialLinks = sessionStorage.getItem('onboarding_social_links');
      const savedAdditionalUrls = sessionStorage.getItem('onboarding_additional_urls');
      
      const profileData = savedProfile ? JSON.parse(savedProfile) : {};
      const planData = savedPlan ? JSON.parse(savedPlan) : { planType: 'free', billingCycle: null };
      const platformsData = savedPlatforms ? JSON.parse(savedPlatforms) : [];
      const socialLinksData = savedSocialLinks ? JSON.parse(savedSocialLinks) : {};
      const additionalUrlsData = savedAdditionalUrls ? JSON.parse(savedAdditionalUrls) : [];
      
      // Use saved data or generate defaults
      const finalUsername = savedUsername || `user${Date.now().toString().slice(-6)}`;
      const finalFullName = savedFullName || session?.user?.email?.split('@')[0] || 'User';
      
      // Handle avatar URL based on selection
      let avatarUrl = null;
      if (profileData.selectedAvatar === 'upload') {
        // Check both new format (avatarData.url) and old format (uploadedImage) for backwards compatibility
        avatarUrl = profileData.avatarData?.url || profileData.uploadedImage;
      } else if (profileData.selectedAvatar && profileData.selectedAvatar !== 'upload') {
        const avatarOption = AVATAR_OPTIONS.find(opt => opt.id === profileData.selectedAvatar);
        avatarUrl = avatarOption?.url || null;
      }

      // Debug logging to help identify issues
      console.log('Avatar processing:', {
        selectedAvatar: profileData.selectedAvatar,
        avatarData: profileData.avatarData,
        uploadedImage: profileData.uploadedImage,
        finalAvatarUrl: avatarUrl
      });

      // Combine all links
      const allLinks = [];

      // Add social links
      platformsData.forEach((platformId: string) => {
        const platform = PLATFORMS.find(p => p.id === platformId);
        const linkValue = socialLinksData[platformId];
        
        if (platform && linkValue?.trim()) {
          allLinks.push({
            label: platform.name, // Use 'label' instead of 'platform' to match dashboard expectations
            url: platform.urlFormat(linkValue)
          });
        }
      });

      // Add additional URLs
      additionalUrlsData.forEach((item: { label: string; url: string }) => {
        if (item.label?.trim() && item.url?.trim()) {
          allLinks.push({
            label: item.label, // Keep as custom link
            url: item.url.startsWith('http') ? item.url : `https://${item.url}`
          });
        }
      });
      
      // For free users, limit to 7 links total
      const maxLinks = planData.planType === 'pro' ? 200 : 7;
      const finalLinks = allLinks.slice(0, maxLinks);

      // Create profile with the selected plan type
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          name: finalFullName,
          slug: finalUsername,
          title: profileData.profileTitle || '',
          bio: profileData.bio || '',
          avatar_url: avatarUrl,
          links: finalLinks,
          plan_type: planData.planType, // Set the plan type based on selection
          social_layout_style: 'horizontal', // Default to horizontal layout for all users
          onboarding_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', session?.user?.id)
        .select()
        .single();

      if (error) throw error;

      // Clear session storage
      [
        'onboarding_username',
        'onboarding_fullname', 
        'onboarding_profile',
        'onboarding_plan',
        'onboarding_platforms',
        'onboarding_social_links',
        'onboarding_additional_urls',
        'welcome_email_sent'
      ].forEach(key => sessionStorage.removeItem(key));

      // Refresh profile to get updated data
      await refreshProfile();
      
      // Send onboarding completion email
      try {
        await EmailTriggers.sendOnboardingCompleteEmail(
          session?.user?.email || '',
          finalFullName,
          finalUsername
        );
        console.log('Onboarding completion email sent');
      } catch (emailError) {
        console.error('Failed to send onboarding completion email:', emailError);
        // Don't block the flow if email fails
      }
      
      toast.success('Profile created successfully!');
      
      // Navigate to dashboard
      navigate('/dashboard/profile', { replace: true });
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
            {currentStep > 1 ? 'Back' : 'Home'}
          </Button>
          
          {/* Logo in center */}
          <div className="flex-1 flex justify-center">
            <Scan2TapLogo />
          </div>
          
          {/* Only show skip button after step 1 */}
          {currentStep > 1 && (
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
          )}
          
          {/* Spacer for step 1 to keep logo centered */}
          {currentStep === 1 && (
            <div className="w-16"></div>
          )}
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
                <PlanStep
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

            {currentStep === 5 && (
              <motion.div
                key="step5"
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

            {currentStep === 6 && (
              <motion.div
                key="step6"
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