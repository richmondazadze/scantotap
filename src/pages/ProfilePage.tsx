import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from '@/lib/supabaseClient';
import { WallpaperService } from '@/services/wallpaperService';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/loading';
import analyticsService from '@/services/analyticsService';
import { UsernameHistoryService } from '@/services/usernameHistoryService';
import {
  FaInstagram, FaTwitter, FaLinkedin, FaFacebook, FaGithub, FaWhatsapp, FaYoutube, FaSnapchat, FaTiktok, FaLink, FaSpotify, FaTelegram, FaDiscord
} from 'react-icons/fa6';
import { 
  Phone, 
  Mail, 
  Download, 
  ExternalLink, 
  Sparkles, 
  User, 
  Globe, 
  Share2,
  Copy,
  CheckCircle,
  Loader2,
  Shield,
  Crown,
  Star,
  Zap,
  UserCheck,
  AtSign,
  MoreHorizontal // <-- use the correct icon
} from 'lucide-react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const SOCIAL_ICON_MAP: Record<string, any> = {
  instagram: FaInstagram,
  twitter: FaTwitter,
  x: FaTwitter,
  linkedin: FaLinkedin,
  facebook: FaFacebook,
  github: FaGithub,
  whatsapp: FaWhatsapp,
  youtube: FaYoutube,
  snapchat: FaSnapchat,
  tiktok: FaTiktok,
  spotify: FaSpotify,
  telegram: FaTelegram,
  discord: FaDiscord,
  threads: AtSign,
};

const SOCIAL_ICON_LIST = [
  'twitter', 'facebook', 'instagram', 'spotify', 'linkedin', 'github', 'whatsapp', 'youtube', 'snapchat', 'tiktok', 'x', 'telegram', 'discord', 'threads'
];

// Generate dynamic colors based on user name
const generateUserColors = (name: string) => {
  if (!name) return { primary: '#3B82F6', secondary: '#1E40AF', gradient: 'from-blue-500 to-blue-600' };
  
  const colors = [
    { primary: '#3B82F6', secondary: '#1E40AF', gradient: 'from-blue-500 to-blue-600' }, // Blue
    { primary: '#8B5CF6', secondary: '#7C3AED', gradient: 'from-purple-500 to-purple-600' }, // Purple
    { primary: '#10B981', secondary: '#059669', gradient: 'from-emerald-500 to-emerald-600' }, // Emerald
    { primary: '#F59E0B', secondary: '#D97706', gradient: 'from-amber-500 to-amber-600' }, // Amber
    { primary: '#EF4444', secondary: '#DC2626', gradient: 'from-red-500 to-red-600' }, // Red
    { primary: '#06B6D4', secondary: '#0891B2', gradient: 'from-cyan-500 to-cyan-600' }, // Cyan
    { primary: '#84CC16', secondary: '#65A30D', gradient: 'from-lime-500 to-lime-600' }, // Lime
    { primary: '#EC4899', secondary: '#DB2777', gradient: 'from-pink-500 to-pink-600' }, // Pink
    { primary: '#6366F1', secondary: '#4F46E5', gradient: 'from-indigo-500 to-indigo-600' }, // Indigo
    { primary: '#F97316', secondary: '#EA580C', gradient: 'from-orange-500 to-orange-600' }, // Orange
  ];
  
  // Use first character's char code to select color
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Generate initials from name
const generateInitials = (name: string) => {
  if (!name) return 'U';
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Determine user status and badge
const getUserStatus = (profile: any) => {
  const profileLinks = Array.isArray(profile.links) ? profile.links : [];
  const hasLinks = profileLinks.length > 0;
  const hasPhone = !!profile.phone;
  const hasTitle = !!profile.title;
  const hasBio = !!profile.bio;
  
  const completionScore = [hasLinks, hasPhone, hasTitle, hasBio].filter(Boolean).length;
  
  if (completionScore === 4) {
    return { 
      label: 'Verified Pro', 
      icon: Crown, 
      color: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-400'
    };
  } else if (completionScore >= 3) {
    return { 
      label: 'Verified', 
      icon: Shield, 
      color: 'bg-gradient-to-r from-green-400 to-green-500',
      textColor: 'text-green-600',
      borderColor: 'border-green-400'
    };
  } else if (completionScore >= 2) {
    return { 
      label: 'Active', 
      icon: Sparkles, 
      color: 'bg-gradient-to-r from-blue-400 to-blue-500',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-400'
    };
  } else {
    return { 
      label: 'Basic', 
      icon: UserCheck, 
      color: 'bg-gradient-to-r from-gray-400 to-gray-500',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-400'
    };
  }
};

// Helper to extract username/handle from a social URL
function extractSocialUsername(url: string) {
  if (!url) return '';
  
  // Remove trailing slash if present
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  
  // Get the last segment after '/'
  const parts = cleanUrl.split('/');
  let username = parts[parts.length - 1];
  
  // Remove @ symbol if it exists at the beginning (to avoid double @)
  if (username.startsWith('@')) {
    username = username.substring(1);
  }
  
  return username;
}

// Helper to get favicon from URL
const getFavicon = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}`;
  } catch {
    return '/fav.png';
  }
};

// Theme color mapping based on the new themes from ThemeSelector
// Function to determine if a theme is light or dark
const isLightTheme = (themePreference: string | null) => {
  const lightThemes = ['air', 'breeze', 'mineral', 'default', 'confidence', 'luxury'];
  return lightThemes.includes(themePreference || 'air');
};

// Function to determine smart overlay based on wallpaper and theme
const getSmartOverlay = (wallpaperBackground: string | null, themePreference: string | null) => {
  if (!wallpaperBackground) return null;
  
  const isLight = isLightTheme(themePreference);
  const isWhiteWallpaper = wallpaperBackground.includes('white');
  
  // No overlay needed for light themes with white wallpapers
  if (isLight && isWhiteWallpaper) {
    return null;
  }
  
  // Light overlay for white wallpapers with dark themes
  if (isWhiteWallpaper) {
    return 'rgba(0,0,0,0.2)';
  }
  
  // Standard overlay for colored wallpapers
  return 'rgba(0,0,0,0.54)';
};

// Perfect text color system - uniform, solid, no shadows
const getPerfectTextColor = (wallpaperBackground: string | null, themePreference: string | null, styleSettings: any, elementType: 'primary' | 'secondary' | 'topCard' = 'primary') => {
  // Check if user has set a specific text color
  const userTextColor = styleSettings?.textColor;
  
  // If user has chosen a specific color, use it
  if (userTextColor && userTextColor !== 'auto') {
    switch (userTextColor) {
      case 'white':
        return '#ffffff';
      case 'black':
        return '#000000';
      case 'gray':
        return '#6b7280';
      case 'dark':
        return '#1e293b';
      default:
        break;
    }
  }

  // Auto mode - intelligent color selection
  if (!wallpaperBackground) {
    // No wallpaper - use theme default
    const theme = getThemeColors(themePreference);
    return elementType === 'primary' ? theme.text : theme.textSecondary;
  }

  const wallpaperId = wallpaperBackground.split('/').pop()?.split('.')[0];
  const fillStyle = styleSettings?.fill || 'solid';

  // Deep analysis of wallpaper characteristics
  const wallpaperAnalysis = {
    'white_scribble': { 
      dominantColor: '#f8f9fa',
      isLight: true,
      patternIntensity: 'medium',
      recommendedTextColor: '#1e293b',
      contrastRatio: 4.5
    },
    'white_dia-geom': { 
      dominantColor: '#ffffff',
      isLight: true,
      patternIntensity: 'low',
      recommendedTextColor: '#1e293b',
      contrastRatio: 5.0
    },
    'navy_geom': { 
      dominantColor: '#1e3a8a',
      isLight: false,
      patternIntensity: 'high',
      recommendedTextColor: '#ffffff',
      contrastRatio: 4.8
    },
    'orange_geom': { 
      dominantColor: '#fed7aa',
      isLight: true,
      patternIntensity: 'medium',
      recommendedTextColor: '#1e293b',
      contrastRatio: 4.2
    },
    'orange_green_geom': { 
      dominantColor: '#fbbf24',
      isLight: true,
      patternIntensity: 'high',
      recommendedTextColor: '#1e293b',
      contrastRatio: 4.0
    }
  };

  const wallpaper = wallpaperAnalysis[wallpaperId as keyof typeof wallpaperAnalysis];
  
  if (!wallpaper) {
    const theme = getThemeColors(themePreference);
    return elementType === 'primary' ? theme.text : theme.textSecondary;
  }

  // Special handling for top profile card (theme gradient)
  if (elementType === 'topCard') {
    const theme = getThemeColors(themePreference);
    const gradientColors = theme.background.split(' ');
    
    let dominantGradientColor = '#ffffff';
    if (gradientColors.length > 0) {
      const firstColor = gradientColors.find(color => color.startsWith('from-') || color.startsWith('via-') || color.startsWith('to-'));
      if (firstColor) {
        const colorMap: Record<string, string> = {
          'from-purple-500': '#8b5cf6',
          'from-pink-500': '#ec4899',
          'from-blue-500': '#3b82f6',
          'from-cyan-500': '#06b6d4',
          'from-orange-500': '#f97316',
          'from-red-500': '#ef4444',
          'from-green-500': '#22c55e',
          'from-yellow-500': '#eab308',
          'from-indigo-500': '#6366f1',
          'from-violet-500': '#8b5cf6',
          'from-emerald-500': '#10b981',
          'from-teal-500': '#14b8a6',
          'from-sky-500': '#0ea5e9',
          'from-slate-500': '#64748b',
          'from-gray-500': '#6b7280',
          'from-zinc-500': '#71717a',
          'from-neutral-500': '#737373',
          'from-stone-500': '#78716c',
          'from-red-600': '#dc2626',
          'from-orange-600': '#ea580c',
          'from-amber-600': '#d97706',
          'from-yellow-600': '#ca8a04',
          'from-lime-600': '#65a30d',
          'from-green-600': '#16a34a',
          'from-emerald-600': '#059669',
          'from-teal-600': '#0d9488',
          'from-cyan-600': '#0891b2',
          'from-sky-600': '#0284c7',
          'from-blue-600': '#2563eb',
          'from-indigo-600': '#4f46e5',
          'from-violet-600': '#7c3aed',
          'from-purple-600': '#9333ea',
          'from-fuchsia-600': '#c026d3',
          'from-pink-600': '#db2777',
          'from-rose-600': '#e11d48'
        };
        dominantGradientColor = colorMap[firstColor] || '#ffffff';
      }
    }
    
    // Perfect contrast for gradient backgrounds
    const isLightGradient = dominantGradientColor === '#ffffff' || 
                           dominantGradientColor.startsWith('#f') || 
                           dominantGradientColor.startsWith('#e') ||
                           dominantGradientColor.startsWith('#d');
    
    return isLightGradient ? '#000000' : '#ffffff';
  }

  // Advanced fill-aware color selection
  const getFillAwareColor = (wallpaper: any, fillStyle: string) => {
    let effectiveBackground = wallpaper.dominantColor;
    
    // Adjust background based on fill style
    if (fillStyle === 'glass') {
      // Glass effect - consider transparency
      effectiveBackground = wallpaper.dominantColor;
    } else if (fillStyle === 'outline') {
      // Outline - white background with border
      effectiveBackground = '#ffffff';
    } else if (fillStyle === 'solid') {
      // Solid - direct wallpaper color
      effectiveBackground = wallpaper.dominantColor;
    }

    // Calculate luminance for perfect contrast
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb = hexToRgb(effectiveBackground);
    if (!rgb) return wallpaper.recommendedTextColor;

    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    // Perfect contrast thresholds
    let contrastThreshold = 0.5;
    if (fillStyle === 'glass') {
      contrastThreshold = 0.35; // Glass needs stronger contrast
    } else if (fillStyle === 'outline') {
      contrastThreshold = 0.45; // Outline needs good contrast
    } else if (fillStyle === 'solid') {
      contrastThreshold = 0.5; // Solid standard
    }

    return luminance > contrastThreshold ? '#000000' : '#ffffff';
  };

  const perfectColor = getFillAwareColor(wallpaper, fillStyle);
  
  // Return uniform color based on element type
  if (elementType === 'primary') {
    return perfectColor;
  } else {
    // Secondary text - slightly muted but still uniform
    return perfectColor === '#000000' ? '#374151' : '#e5e7eb';
  }
};

// Get theme-specific button colors
const getThemeButtonColor = (themePreference: string | null) => {
  const themeColors = {
    air: '#3b82f6',      // Blue
    blocks: '#8b5cf6',    // Purple
    bloom: '#dc2626',     // Red
    breeze: '#ec4899',    // Pink
    lake: '#0f172a',      // Dark blue
    mineral: '#f59e0b',   // Amber
    default: '#3b82f6',   // Blue
    confidence: '#3b82f6', // Blue
    creative: '#8b5cf6',  // Purple
    fresh: '#dc2626',     // Red
    warm: '#ec4899',      // Pink
    energy: '#0f172a',    // Dark blue
    luxury: '#f59e0b'     // Amber
  };

  return themeColors[themePreference as keyof typeof themeColors] || '#3b82f6';
};

// Apply style settings to profile elements
const getStyleClasses = (styleSettings: any, elementType: 'fill' | 'corners' | 'shadow' | 'colors') => {
  if (!styleSettings) return '';
  
  const { fill, corners, shadow, colors } = styleSettings;
  
  switch (elementType) {
    case 'fill':
      switch (fill) {
        case 'solid':
          return 'bg-opacity-100';
        case 'glass':
          return 'bg-opacity-20 backdrop-blur-sm';
        case 'outline':
          return 'bg-transparent border-2';
        default:
          return '';
      }
    
    case 'corners':
      switch (corners) {
        case 'sharp':
          return 'rounded-none';
        case 'curved':
          return 'rounded-lg';
        case 'round':
          return 'rounded-full';
        default:
          return 'rounded-xl';
      }
    
    case 'shadow':
      switch (shadow) {
        case 'none':
          return 'shadow-none';
        case 'subtle':
          return 'shadow-sm';
        case 'hard':
          return 'shadow-lg';
        default:
          return 'shadow-md';
      }
    
    case 'colors':
      return {
        buttons: colors?.buttons || '#3B82F6',
        shadows: colors?.shadows || '#000000',
        text: colors?.text || '#6B7280'
      };
    
    default:
      return '';
  }
};

// Get corner styles specifically for grid layout
const getGridCornerStyles = (styleSettings: any) => {
  if (!styleSettings?.corners) return 'rounded-xl';
  
  const { corners } = styleSettings;
  
  switch (corners) {
    case 'sharp':
      return 'rounded-none';
    case 'curved':
      return 'rounded-lg';
    case 'round':
      return 'rounded-2xl'; // More rounded but not fully circular for grid
    default:
      return 'rounded-xl';
  }
};

// Get fill styles that work with existing background classes
const getFillStyles = (styleSettings: any, isLightTheme: boolean) => {
  if (!styleSettings?.fill) return '';
  
  const { fill } = styleSettings;
  
  switch (fill) {
    case 'solid':
      return isLightTheme ? 'bg-white/95' : 'bg-white/30';
    case 'glass':
      return isLightTheme ? 'bg-white/40 backdrop-blur-md' : 'bg-white/20 backdrop-blur-md';
    case 'outline':
      return 'bg-transparent border-2';
    default:
      return isLightTheme ? 'bg-white/80' : 'bg-white/10';
  }
};

// Apply custom colors to elements
const getCustomColors = (styleSettings: any, elementType: 'buttons' | 'shadows' | 'text') => {
  if (!styleSettings?.colors) return null;
  
  const colors = getStyleClasses(styleSettings, 'colors');
  return colors[elementType];
};

const getThemeColors = (themePreference: string | null) => {
  const themes = {
    // NEW THEMES with distinctive fonts using system fonts
    air: {
      background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      text: '#1e293b',
      textSecondary: '#64748b',
      fontFamily: '"Link Sans Medium", ui-sans-serif, system-ui, sans-serif'
    },
    blocks: {
      background: 'linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)',
      text: '#ffffff',
      textSecondary: '#f3e8ff',
      fontFamily: '"Georgia", "Times New Roman", serif'
    },
    bloom: {
      background: 'linear-gradient(180deg, #dc2626 0%, #ea580c 100%)',
      text: '#ffffff',
      textSecondary: '#fef3c7',
      fontFamily: '"Courier New", "Courier", monospace'
    },
    breeze: {
      background: 'linear-gradient(180deg, #fce7f3 0%, #fbcfe8 100%)',
      text: '#374151',
      textSecondary: '#6b7280',
      fontFamily: '"Playfair Display", "Georgia", serif'
    },
    lake: {
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      text: '#ffffff',
      textSecondary: '#cbd5e1',
      fontFamily: '"Verdana", "Geneva", sans-serif'
    },
    mineral: {
      background: 'linear-gradient(180deg, #fdefe3 0%, #f5e6d3 100%)',
      text: '#292524',
      textSecondary: '#78716c',
      fontFamily: '"Trebuchet MS", "Lucida Grande", sans-serif'
    },
    // Legacy themes for backward compatibility
    default: {
      background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      text: '#1e293b',
      textSecondary: '#64748b',
      fontFamily: '"Link Sans Medium", ui-sans-serif, system-ui, sans-serif'
    },
    confidence: {
      background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      text: '#1e293b',
      textSecondary: '#64748b',
      fontFamily: '"Link Sans Medium", ui-sans-serif, system-ui, sans-serif'
    },
    creative: {
      background: 'linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)',
      text: '#ffffff',
      textSecondary: '#f3e8ff',
      fontFamily: '"Raleway", sans-serif'
    },
    fresh: {
      background: 'linear-gradient(180deg, #dc2626 0%, #ea580c 100%)',
      text: '#ffffff',
      textSecondary: '#fef3c7',
      fontFamily: '"Syne Mono", monospace'
    },
    warm: {
      background: 'linear-gradient(180deg, #fce7f3 0%, #fbcfe8 100%)',
      text: '#374151',
      textSecondary: '#6b7280',
      fontFamily: '"Space Mono", monospace'
    },
    energy: {
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      text: '#ffffff',
      textSecondary: '#cbd5e1',
      fontFamily: '"Manrope", sans-serif'
    },
    luxury: {
      background: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)',
      text: '#292524',
      textSecondary: '#78716c',
      fontFamily: '"IBM Plex Sans", sans-serif'
    },
    mystery: {
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      text: '#ffffff',
      textSecondary: '#cbd5e1',
      fontFamily: 'font-sans'
    },
    innovation: {
      background: 'linear-gradient(180deg, #7c3aed 0%, #f97316 100%)',
      text: '#ffffff',
      textSecondary: '#fef3c7',
      fontFamily: 'font-sans'
    },
    aurora: {
      background: 'linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)',
      text: '#ffffff',
      textSecondary: '#f3e8ff',
      fontFamily: 'font-sans'
    },
    peach: {
      background: 'linear-gradient(180deg, #fce7f3 0%, #fbcfe8 100%)',
      text: '#374151',
      textSecondary: '#6b7280',
      fontFamily: 'font-serif'
    },
    sunset: {
      background: 'linear-gradient(180deg, #7c3aed 0%, #f97316 100%)',
      text: '#ffffff',
      textSecondary: '#fef3c7',
      fontFamily: 'font-sans'
    },
    ocean: {
      background: 'linear-gradient(180deg, #7c3aed 0%, #f97316 100%)',
      text: '#ffffff',
      textSecondary: '#fef3c7',
      fontFamily: 'font-sans'
    },
    forest: {
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      text: '#ffffff',
      textSecondary: '#cbd5e1',
      fontFamily: 'font-sans'
    },
    royal: {
      background: 'linear-gradient(180deg, #7c3aed 0%, #f97316 100%)',
      text: '#ffffff',
      textSecondary: '#fef3c7',
      fontFamily: 'font-sans'
    },
    midnight: {
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      text: '#ffffff',
      textSecondary: '#cbd5e1',
      fontFamily: 'font-sans'
    }
  };
  return themes[themePreference as keyof typeof themes] || themes.air;
};

const lightenGradient = (gradient: string) => {
  // Simple approach: add more transparency to the gradient for card backgrounds
  if (gradient.includes('linear-gradient')) {
    return gradient.replace(/(#[0-9A-Fa-f]{6})/g, '$180'); // add 80 alpha for lighter
  }
  return gradient;
};

const ProfilePage = () => {
  const { username, userId } = useParams<{ username?: string; userId?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      let data = null;

      try {
        if (userId) {
          // Direct user_id lookup - most reliable
          console.log('🔍 PROFILE: Fetching by user_id:', userId);
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (userError) {
            console.error('❌ PROFILE: Error fetching by user_id:', userError);
          } else if (userData) {
            data = userData;
            console.log('✅ PROFILE: Found profile by user_id');
          }
        } else if (username) {
          // Username lookup with redirect logic
          console.log('🔍 PROFILE: Fetching by username:', username);
          
          // First, try to find by current username
          let { data: currentData, error: currentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', username)
        .maybeSingle();

          if (currentError) {
            console.error('❌ PROFILE: Error fetching by current username:', currentError);
          } else if (currentData) {
            data = currentData;
            console.log('✅ PROFILE: Found profile by current username');
          } else {
            // Check username history for redirect
            console.log('🔍 PROFILE: Checking username history for redirect');
            const historyResult = await UsernameHistoryService.getUserIdByUsername(username);
            
            if (historyResult.userId && !historyResult.error) {
              // Found in history, get current profile and redirect
              const { data: redirectData, error: redirectError } = await supabase
                .from('profiles')
                .select('slug')
                .eq('user_id', historyResult.userId)
                .single();

              if (!redirectError && redirectData?.slug) {
                console.log('🔄 PROFILE: Redirecting from old username to current:', redirectData.slug);
                navigate(`/${redirectData.slug}`, { replace: true });
                return;
              }
            }

            // If still not found, try by profile id (fallback)
            const { data: idData, error: idError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', username)
          .maybeSingle();

            if (idError) {
              console.error('❌ PROFILE: Error fetching by profile id:', idError);
            } else if (idData) {
              data = idData;
              console.log('✅ PROFILE: Found profile by profile id');
            }
          }
      }

      setProfile(data);
      
      // Track profile visit after successful profile load
      if (data?.id) {
        try {
          console.log('🔍 PROFILE: Attempting to track visit for profile:', data.id);
          const result = await analyticsService.trackProfileVisit(data.id);
          if (result.success) {
            console.log('✅ PROFILE: Visit tracked successfully');
          } else {
            console.error('❌ PROFILE: Visit tracking failed:', result.error);
          }
        } catch (error) {
          console.error('❌ PROFILE: Exception during visit tracking:', error);
        }
        }
      } catch (error) {
        console.error('❌ PROFILE: Exception during profile fetch:', error);
      }
      
      setLoading(false);
    };
    fetchProfile();
  }, [username, userId, navigate]);

  // Debug: Log the applied CSS class
  useEffect(() => {
    if (profile?.theme_preference) {
      console.log('🔍 CSS CLASS DEBUG: Applied class:', `theme-${profile.theme_preference || 'air'}`);
      
      // Check computed styles after a short delay
      setTimeout(() => {
        const mainContainer = document.querySelector('.min-h-screen.overflow-x-hidden.flex.flex-col.relative');
        if (mainContainer) {
          const computedStyle = window.getComputedStyle(mainContainer);
          console.log('🔍 COMPUTED STYLES DEBUG:');
          console.log('Applied font-family:', computedStyle.fontFamily);
          console.log('Applied CSS class:', mainContainer.className);
        }
      }, 100);
    }
  }, [profile?.theme_preference]);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Still set copied state for UI feedback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Track link clicks
  const trackLinkClick = async (link: any, linkType: string) => {
    if (!profile?.id) return;
    
    try {
      console.log('🔍 PROFILE: Attempting to track link click for profile:', profile.id, 'Link:', link.label || link.platform || 'Unknown', 'Type:', linkType);
      const result = await analyticsService.trackLinkClick(
        profile.id,
        linkType,
        link.platform || link.label || 'Unknown',
        link.url,
        linkType === 'social' ? (link.platform || link.label) : undefined
      );
      if (result.success) {
        console.log('✅ PROFILE: Link click tracked successfully');
      } else {
        console.error('❌ PROFILE: Link click tracking failed:', result.error);
      }
    } catch (error) {
      console.error('❌ PROFILE: Exception during link click tracking:', error);
    }
  };

  // Soothing loading animation component
  const LoadingAnimation = () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        {/* Top floating dots animation */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              animate={{
                y: [0, -20, 0],
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Infinity loop animation */}
        <div className="relative w-32 h-16 mx-auto">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 300 150" 
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="profileLoadingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <path 
              fill="none" 
              stroke="url(#profileLoadingGradient)" 
              strokeWidth="12" 
              strokeLinecap="round" 
              strokeDasharray="300 385" 
              strokeDashoffset="0" 
              d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"
            >
              <animate 
                attributeName="stroke-dashoffset" 
                calcMode="spline" 
                dur="2.5" 
                values="685;-685" 
                keySplines="0 0 1 1" 
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        {/* Bottom pulsing text */}
        <motion.div
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading Profile
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Preparing your digital identity...
          </p>
        </motion.div>

        {/* Bottom floating dots animation */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              animate={{
                y: [0, 15, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.1, 0.8],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
      </div>
    );

  if (loading) {
    return <LoadingAnimation />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Profile Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">This digital profile doesn't exist or the username is incorrect.</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-scan-blue hover:bg-scan-blue/90"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract social links and main links
  const profileLinks = Array.isArray(profile.links) ? profile.links : [];
  const socialLinks = profileLinks.filter((link: any) => SOCIAL_ICON_LIST.includes((link.platform || link.label || '').toLowerCase()));
  const mainLinks = profileLinks.filter((link: any) => !SOCIAL_ICON_LIST.includes((link.platform || link.label || '').toLowerCase()));

  // Get dynamic user data
  const userColors = generateUserColors(profile.name || '');
  const userInitials = generateInitials(profile.name || '');
  const userStatus = getUserStatus(profile);
  
  // Get theme colors based on user preference
  const themeColors = getThemeColors(profile.theme_preference);
  
  // Debug: Log theme information
  console.log('🔍 THEME DEBUG:');
  console.log('Profile theme_preference from DB:', profile.theme_preference);
  console.log('Applied theme colors:', themeColors);
  console.log('Font family being applied:', themeColors.fontFamily);
  console.log('Profile data:', profile);
  
  // Debug: Check if fonts are loaded
  if (typeof document !== 'undefined') {
    const fonts = [
      'Link Sans Medium',
      'Georgia',
      'Courier New', 
      'Arial',
      'Verdana',
      'Trebuchet MS'
    ];
    
    fonts.forEach(font => {
      if (document.fonts && document.fonts.check) {
        const isLoaded = document.fonts.check(`12px "${font}"`);
        console.log(`🔍 FONT DEBUG: ${font} loaded:`, isLoaded);
        
        // Additional debugging for font loading
        if (!isLoaded) {
          console.log(`⚠️ FONT WARNING: ${font} is not loaded. Checking if it's being requested...`);
          
          // Check if the font is in the document's font list
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
              const isReady = document.fonts.check(`12px "${font}"`);
              console.log(`🔍 FONT READY CHECK: ${font} ready:`, isReady);
            });
          }
        }
      }
    });
    
    // Test font loading by creating a test element
    const testFontLoading = () => {
      const testFonts = ['Georgia', 'Courier New', 'Arial', 'Verdana', 'Trebuchet MS'];
      testFonts.forEach(font => {
        const testElement = document.createElement('div');
        testElement.style.fontFamily = `"${font}", sans-serif`;
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        testElement.style.fontSize = '12px';
        testElement.textContent = 'Test';
        document.body.appendChild(testElement);
        
        // Check if the font is actually applied
        const computedStyle = window.getComputedStyle(testElement);
        const appliedFont = computedStyle.fontFamily;
        console.log(`🔍 FONT TEST: ${font} applied as:`, appliedFont);
        
        document.body.removeChild(testElement);
      });
    };
    
    testFontLoading();
  }
  
  // Check for custom background and wallpaper
  const customBackground = (profile as any)?.custom_background;
  const wallpaperBackground = profile.wallpaper_preference;
  
  const backgroundStyle = customBackground 
    ? {
        backgroundImage: `url(${customBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : wallpaperBackground
    ? {
        backgroundImage: `url(${wallpaperBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : { 
        background: themeColors.background
      };

  return (
    <div 
      className={`min-h-screen overflow-x-hidden flex flex-col relative theme-${profile.theme_preference || 'air'}`} 
      style={{ 
        ...backgroundStyle,
        fontFamily: themeColors.fontFamily, // Add inline style as backup
        '--theme-font-family': themeColors.fontFamily // Add CSS custom property
      } as React.CSSProperties & { '--theme-font-family': string }}
    >
      {/* Smart overlay for custom background or wallpaper */}
      {(customBackground || wallpaperBackground) && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none" 
          style={{ 
            background: customBackground 
              ? 'rgba(0,0,0,0.54)' // Standard overlay for custom backgrounds
              : getSmartOverlay(wallpaperBackground, profile.theme_preference) || 'transparent'
          }} 
        />
      )}
      {/* Professional Share Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" />
        <DialogContent className="share-modal-content data-[state=open]:animate-slide-up data-[state=closed]:animate-slide-down sm:data-[state=open]:animate-in sm:data-[state=closed]:animate-out sm:data-[state=closed]:fade-out-0 sm:data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]">
          <DialogTitle className="sr-only">Share Profile</DialogTitle>
          <DialogDescription className="sr-only">Share this profile with others through various platforms</DialogDescription>
          
          {/* Handle bar for mobile */}
          <div className="flex justify-center pt-3 pb-4 sm:hidden">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>

          {/* Close Button - Top Right */}
          <button
            onClick={() => setModalOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Unified Card Content */}
          <div className="px-5 pb-5 space-y-5">
            {/* User Profile Section - Compact */}
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-md mb-2">
                <Avatar className="h-full w-full">
                  {profile.avatar_url && !imageError ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.name || 'Profile photo'} />
                  ) : (
                    <AvatarFallback className={`text-lg font-bold text-white bg-gradient-to-br ${userColors.gradient} flex items-center justify-center`}>
                      {userInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate max-w-full">
                @{profile.slug || profile.name?.toLowerCase().replace(/\s+/g, '') || 'user'}
              </h3>
            </div>

            {/* Primary Action - Copy Link */}
            <Button
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
              onClick={() => { 
                copyToClipboard(window.location.href); 
                setModalOpen(false); 
                toast.success('Profile link copied to clipboard!');
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" />
                <span className="text-sm">Copy Profile Link</span>
              </div>
            </Button>

            {/* Social Sharing Options */}
            <div className="w-full">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Share on</h4>
              <div className="social-scroll-container">
                <div className="social-buttons-flex">
                  {/* WhatsApp */}
                  <button
                    onClick={() => {
                      const text = `Check out ${profile.name}'s profile`;
                      const message = encodeURIComponent(text + ' ' + window.location.href);
                      // Use WhatsApp deep link for mobile
                      const whatsappUrl = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ? `whatsapp://send?text=${message}`
                        : `https://wa.me/?text=${message}`;
                      window.open(whatsappUrl, '_blank');
                      setModalOpen(false);
                    }}
                    className="social-button bg-green-500 hover:bg-green-600 text-white transition-all duration-200 hover:scale-105 shadow-sm rounded-2xl"
                  >
                    <FaWhatsapp className="w-6 h-6" />
                  </button>
                  
                  {/* Twitter/X */}
                  <button
                    onClick={() => {
                      const text = `Check out ${profile.name}'s profile`;
                      const encodedText = encodeURIComponent(text);
                      const encodedUrl = encodeURIComponent(window.location.href);
                      // Use Twitter deep link for mobile
                      const twitterUrl = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ? `twitter://post?message=${encodedText} ${encodedUrl}`
                        : `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
                      window.open(twitterUrl, '_blank');
                      setModalOpen(false);
                    }}
                    className="social-button bg-black hover:bg-gray-800 text-white transition-all duration-200 hover:scale-105 shadow-sm rounded-2xl"
                  >
                    <FaTwitter className="w-6 h-6" />
                  </button>
                  
                  {/* LinkedIn */}
                  <button
                    onClick={() => {
                      const encodedUrl = encodeURIComponent(window.location.href);
                      // Use LinkedIn deep link for mobile
                      const linkedinUrl = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ? `linkedin://sharing/share-offsite/?url=${encodedUrl}`
                        : `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                      window.open(linkedinUrl, '_blank');
                      setModalOpen(false);
                    }}
                    className="social-button bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105 shadow-sm rounded-2xl"
                  >
                    <FaLinkedin className="w-6 h-6" />
                  </button>
                  
                  {/* Facebook */}
                  <button
                    onClick={() => {
                      const encodedUrl = encodeURIComponent(window.location.href);
                      // Use Facebook deep link for mobile
                      const facebookUrl = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ? `fb://share?href=${encodedUrl}`
                        : `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                      window.open(facebookUrl, '_blank');
                      setModalOpen(false);
                    }}
                    className="social-button bg-blue-700 hover:bg-blue-800 text-white transition-all duration-200 hover:scale-105 shadow-sm rounded-2xl"
                  >
                    <FaFacebook className="w-6 h-6" />
                  </button>
                  
                  {/* Instagram */}
                  <button
                    onClick={() => {
                      copyToClipboard(window.location.href);
                      toast.success('Link copied! You can now share it on Instagram');
                      setModalOpen(false);
                    }}
                    className="social-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200 hover:scale-105 shadow-sm rounded-2xl"
                  >
                    <FaInstagram className="w-6 h-6" />
                  </button>
                  
                  {/* Telegram */}
                  <button
                    onClick={() => {
                      const text = `Check out ${profile.name}'s profile`;
                      const message = encodeURIComponent(text);
                      const encodedUrl = encodeURIComponent(window.location.href);
                      // Use Telegram deep link for mobile
                      const telegramUrl = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ? `tg://msg_url?url=${encodedUrl}&text=${message}`
                        : `https://t.me/share/url?url=${encodedUrl}&text=${message}`;
                      window.open(telegramUrl, '_blank');
                      setModalOpen(false);
                    }}
                    className="social-button bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 shadow-sm rounded-2xl"
                  >
                    <FaTelegram className="w-6 h-6" />
                  </button>
                  
                  {/* Snapchat */}
                  <button
                    onClick={() => {
                      copyToClipboard(window.location.href);
                      toast.success('Link copied! You can now share it on Snapchat');
                      setModalOpen(false);
                    }}
                    className="social-button bg-yellow-400 hover:bg-yellow-500 text-black transition-all duration-200 hover:scale-105 shadow-sm rounded-2xl"
                  >
                    <FaSnapchat className="w-6 h-6" />
                  </button>
                  
                  {/* TikTok */}
                  <button
                    onClick={() => {
                      copyToClipboard(window.location.href);
                      toast.success('Link copied! You can now share it on TikTok');
                      setModalOpen(false);
                    }}
                    className="social-button bg-black hover:bg-gray-800 text-white transition-all duration-200 hover:scale-105 shadow-sm rounded-2xl"
                  >
                    <FaTiktok className="w-6 h-6" />
                  </button>
                  
                  {/* Discord */}
                  <button
                    onClick={() => {
                      copyToClipboard(window.location.href);
                      toast.success('Link copied! You can now share it on Discord');
                      setModalOpen(false);
                    }}
                    className="social-button bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 hover:scale-105 shadow-sm rounded-2xl"
                  >
                    <FaDiscord className="w-6 h-6" />
                  </button>
                  
                  {/* Email */}
                  <button
                    onClick={() => {
                      const subject = `Check out ${profile.name}'s profile`;
                      const body = `I thought you might be interested in ${profile.name}'s profile: ${window.location.href}`;
                      const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      window.open(url, '_blank');
                      setModalOpen(false);
                    }}
                    className="social-button bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200 hover:scale-105 shadow-sm rounded-2xl"
                  >
                    <Mail className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Join CTA Section - More Compact */}
            <div className="text-center">
              
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Create Your Own Profile</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Join thousands of professionals</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    window.open('/', '_blank');
                    setModalOpen(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg h-9 text-sm"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Sign Up Free
                </Button>
                <Button
                  onClick={() => {
                    window.open('/pricing', '_blank');
                    setModalOpen(false);
                  }}
                  variant="outline"
                  className="flex-1 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium rounded-lg h-9 text-sm"
                >
                  Learn More
                </Button>
              </div>
            </div>

            
          </div>
        </DialogContent>
      </Dialog>

      {/* Per-link modal */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" />
        <DialogContent className="share-modal-content data-[state=open]:animate-slide-up data-[state=closed]:animate-slide-down sm:data-[state=open]:animate-in sm:data-[state=closed]:animate-out sm:data-[state=closed]:fade-out-0 sm:data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%] p-0 overflow-hidden">
          <DialogTitle className="text-xl font-bold mb-0 px-6 pt-6">Link Details</DialogTitle>
          {selectedLink && (
            <div className="flex flex-col items-center w-full">
              {/* Thumbnail & Label */}
              <div className="flex flex-col items-center w-full px-6 pt-4 pb-2">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-lg mb-3 flex items-center justify-center">
                  {selectedLink.thumbnail ? (
                    <img src={selectedLink.thumbnail} alt="Link thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <img src={getFavicon(selectedLink.url)} alt="Favicon" className="w-10 h-10" />
                  )}
                </div>
                <div className="text-center w-full">
                  <div className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-1 break-words whitespace-normal max-w-full" style={{wordBreak: 'break-word'}}>{selectedLink.platform || selectedLink.label}</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-all mb-1 max-w-full" style={{wordBreak: 'break-all'}}>{selectedLink.url}</div>
                </div>
              </div>
              {/* Divider */}
              <div className="w-full border-t border-gray-200 dark:border-gray-700 my-2"></div>
              {/* Action Buttons */}
              <div className="flex gap-2 w-full px-6 mb-2">
                <Button
                  className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-11 text-base shadow-md"
                  onClick={() => window.open(selectedLink.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />Open Link
                </Button>
                <Button
                  className="flex-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold h-11 text-base border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedLink.url);
                    toast.success('Link copied!');
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />Copy Link
                </Button>
              </div>
              {/* Social Sharing Options for this link - 2x5 grid, brand colors, functional */}
              <div className="w-full px-6 mt-2 mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Share this link on</h4>
                <div className="grid grid-cols-5 grid-rows-2 gap-x-6 gap-y-4 justify-items-center">
                  {/* Top Row */}
                  {/* WhatsApp */}
                  <button title="Share on WhatsApp"
                    onClick={() => {
                      const text = `Check out this link: ${selectedLink.url}`;
                      const message = encodeURIComponent(text);
                      const whatsappUrl = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ? `whatsapp://send?text=${message}`
                        : `https://wa.me/?text=${message}`;
                      window.open(whatsappUrl, '_blank');
                      setLinkModalOpen(false);
                    }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#25D366] hover:bg-[#1DA851] text-white text-3xl shadow-md transition-all"
                  >
                    <FaWhatsapp />
                  </button>
                  {/* LinkedIn */}
                  <button title="Share on LinkedIn"
                    onClick={() => {
                      const encodedUrl = encodeURIComponent(selectedLink.url);
                      const linkedinUrl = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ? `linkedin://sharing/share-offsite/?url=${encodedUrl}`
                        : `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                      window.open(linkedinUrl, '_blank');
                      setLinkModalOpen(false);
                    }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#0077B5] hover:bg-[#005983] text-white text-3xl shadow-md transition-all"
                  >
                    <FaLinkedin />
                  </button>
                  {/* Instagram */}
                  <button title="Share on Instagram"
                    onClick={() => {
                      copyToClipboard(selectedLink.url);
                      toast.success('Link copied! You can now share it on Instagram');
                      setLinkModalOpen(false);
                    }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white text-3xl shadow-md transition-all"
                    style={{background: 'linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)'}}
                  >
                    <FaInstagram />
                  </button>
                  {/* Snapchat */}
                  <button title="Share on Snapchat"
                    onClick={() => {
                      copyToClipboard(selectedLink.url);
                      toast.success('Link copied! You can now share it on Snapchat');
                      setLinkModalOpen(false);
                    }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#FFFC00] hover:bg-yellow-300 text-black text-3xl shadow-md transition-all"
                  >
                    <FaSnapchat />
                  </button>
                  {/* Discord */}
                  <button title="Share on Discord"
                    onClick={() => {
                      copyToClipboard(selectedLink.url);
                      toast.success('Link copied! You can now share it on Discord');
                      setLinkModalOpen(false);
                    }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#5865F2] hover:bg-[#404EED] text-white text-3xl shadow-md transition-all"
                  >
                    <FaDiscord />
                  </button>
                  {/* Bottom Row */}
                  {/* Twitter/X */}
                  <button title="Share on Twitter/X"
                    onClick={() => {
                      const text = `Check out this link: ${selectedLink.url}`;
                      const encodedText = encodeURIComponent(text);
                      const twitterUrl = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ? `twitter://post?message=${encodedText}`
                        : `https://twitter.com/intent/tweet?text=${encodedText}`;
                      window.open(twitterUrl, '_blank');
                      setLinkModalOpen(false);
                    }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-black hover:bg-gray-800 text-white text-3xl shadow-md transition-all"
                  >
                    <FaTwitter />
                  </button>
                  {/* Facebook */}
                  <button title="Share on Facebook"
                    onClick={() => {
                      const encodedUrl = encodeURIComponent(selectedLink.url);
                      const facebookUrl = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ? `fb://share?href=${encodedUrl}`
                        : `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                      window.open(facebookUrl, '_blank');
                      setLinkModalOpen(false);
                    }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#1877F3] hover:bg-[#145db2] text-white text-3xl shadow-md transition-all"
                  >
                    <FaFacebook />
                  </button>
                  {/* Telegram */}
                  <button title="Share on Telegram"
                    onClick={() => {
                      const text = `Check out this link: ${selectedLink.url}`;
                      const message = encodeURIComponent(text);
                      const telegramUrl = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ? `tg://msg_url?url=${encodeURIComponent(selectedLink.url)}&text=${message}`
                        : `https://t.me/share/url?url=${encodeURIComponent(selectedLink.url)}&text=${message}`;
                      window.open(telegramUrl, '_blank');
                      setLinkModalOpen(false);
                    }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#229ED9] hover:bg-[#1b7fa8] text-white text-3xl shadow-md transition-all"
                  >
                    <FaTelegram />
                  </button>
                  {/* TikTok */}
                  <button title="Share on TikTok"
                    onClick={() => {
                      copyToClipboard(selectedLink.url);
                      toast.success('Link copied! You can now share it on TikTok');
                      setLinkModalOpen(false);
                    }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-black hover:bg-gray-800 text-white text-3xl shadow-md transition-all"
                  >
                    <FaTiktok />
                  </button>
                  {/* Email */}
                  <button title="Share via Email"
                    onClick={() => {
                      const subject = `Check out this link`;
                      const body = `I thought you might be interested in this: ${selectedLink.url}`;
                      const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      window.open(url, '_blank');
                      setLinkModalOpen(false);
                    }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-400 hover:bg-gray-600 text-white text-3xl shadow-md transition-all"
                  >
                    <Mail />
                  </button>
                </div>
              </div>
              {/* Divider */}
              <div className="w-full border-t border-gray-200 dark:border-gray-700 my-4"></div>
              {/* Join CTA Section - More Compact */}
              <div className="text-center w-full px-6 pb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Create Your Own Profile</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Join thousands of professionals</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      window.open('/', '_blank');
                      setLinkModalOpen(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-full h-10 text-base shadow-md"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Sign Up Free
                  </Button>
                  <Button
                    onClick={() => {
                      window.open('/pricing', '_blank');
                      setLinkModalOpen(false);
                    }}
                    variant="outline"
                    className="flex-1 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium rounded-full h-10 text-base shadow-md"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="relative z-10 w-full max-w-3xl lg:max-w-3xl mx-auto flex-1 flex flex-col min-h-screen py-4 sm:py-6 lg:py-10 px-2 xs:px-3 sm:px-4 lg:px-8 overflow-x-hidden">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-1 sm:mb-2"
        >
          <div className="overflow-hidden rounded-3xl shadow-2xl relative border border-white/20"
               style={{ 
                 background: themeColors.background,
                 backdropFilter: 'blur(40px)',
                 WebkitBackdropFilter: 'blur(40px)',
                 boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2), 0 10px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
               }}>
            {/* Premium gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none"></div>
            
            {/* Subtle sparkle effect */}
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
            <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white/50 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            

            
            {/* Three-dot menu in top right corner of profile card */}
            <div className="absolute top-4 right-4 z-20">
              <button
                className={`p-2.5 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 backdrop-blur-sm border hover:scale-110 hover:shadow-xl ${isLightTheme(profile.theme_preference) ? 'bg-white/80 hover:bg-white/90 focus:ring-gray-400 border-gray-200' : 'bg-white/20 hover:bg-white/30 focus:ring-white/50 border-white/30'}`}
                aria-label="More actions"
                onClick={() => setModalOpen(true)}
              >
                <span className="sr-only">More actions</span>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`${isLightTheme(profile.theme_preference) ? 'text-gray-700' : 'text-white'}`}>
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </button>
          </div>
          
            {/* Centered content */}
            <div className="relative p-8 sm:p-10 lg:p-12 flex flex-col items-center text-center">
              {/* Avatar with theme border/glow */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                className="relative flex-shrink-0 mb-3"
                >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden shadow-2xl border-4 transition-all duration-500 hover:scale-110 hover:rotate-3 group"
                  style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.95)', 
                    boxShadow: `0 0 0 4px ${themeColors.text}30, 0 0 0 8px ${themeColors.text}15, 0 25px 50px rgba(0,0,0,0.4), 0 15px 30px rgba(0,0,0,0.3)` 
                  }}>
                  {/* Animated ring effect */}
                  <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border border-white/20 group-hover:border-white/40 transition-all duration-300"></div>
                    <Avatar className="h-full w-full">
                      {profile.avatar_url && !imageError ? (
                        <AvatarImage 
                          src={profile.avatar_url} 
                          alt={profile.name || 'Profile photo'}
                          onLoad={() => setImageLoading(false)}
                          onError={() => {
                            setImageError(true);
                            setImageLoading(false);
                          }}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback 
                      className={`text-2xl sm:text-3xl font-bold text-white bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-inner`}
                      >
                        {imageLoading && profile.avatar_url && !imageError ? (
                          <Loading size="sm" />
                        ) : (
                          userInitials
                        )}
                      </AvatarFallback>
            </Avatar>
                  </div>
                </motion.div>
              {/* Name, title, bio with perfect text contrast */}
              <div className="flex flex-col items-center gap-2">
                <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight`}
                    style={{ 
                    color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'topCard'),
                    fontFamily: getThemeColors(profile.theme_preference).fontFamily
                    }}>
                      {profile.use_username_instead_of_name ? `@${profile.slug}` : profile.name}
                    </h1>
                  {profile.title && (
                  <p className={`text-base sm:text-lg font-semibold`} 
                     style={{ 
                       color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'topCard')
                     }}>
                      {profile.title}
                    </p>
                  )}
                  {profile.bio && (
                  <p className={`text-sm sm:text-base leading-relaxed w-full font-medium mt-2`} 
                     style={{ 
                       color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'topCard')
                     }}>
                      {profile.bio}
                    </p>
                  )}
                </div>
                

                  </div>
                </div>
        </motion.div>

        <div className="space-y-12 lg:space-y-16">
          {/* Contact & Actions */}
          <div className="space-y-8">
            
            {/* Horizontal Divider Before Contact */}
            {((profile.phone && profile.show_phone !== false) || (profile.email && profile.show_email !== false)) && (
              <div className="flex justify-center py-2">
                <div className={`w-24 h-0.5 rounded-full ${isLightTheme(profile.theme_preference) ? 'bg-gray-300' : 'bg-white/30'}`}></div>
              </div>
            )}
            
            {/* Contact Information */}
            {((profile.phone && profile.show_phone !== false) || (profile.email && profile.show_email !== false)) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="pb-1 px-1 sm:px-2 pt-2">
                  <div className="space-y-3">
                    <div className="text-center">
                      <h3 className={`flex items-center justify-center gap-2 text-lg sm:text-xl font-semibold mb-1`}
                        style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'primary') }}>
                        <Phone className={`w-5 h-5`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }} />
                      Contact Information
                      </h3>
                      <p className={`text-sm`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }}>
                      Get in touch directly
                      </p>
                    </div>
                    <div className="space-y-3">
                    {/* Contact Details */}
                    <div className="grid grid-cols-1 gap-3">
                      {profile.phone && profile.show_phone !== false && (
                          <div className={`flex items-center gap-3 p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl backdrop-blur-sm border ${getStyleClasses(profile.style_settings, 'corners')} ${getStyleClasses(profile.style_settings, 'shadow')} ${getFillStyles(profile.style_settings, isLightTheme(profile.theme_preference))} ${isLightTheme(profile.theme_preference) ? 'border-gray-200 hover:border-gray-300' : 'border-white/20 hover:border-white/30'}`}>
                            <div className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center shadow-md ${isLightTheme(profile.theme_preference) ? 'bg-blue-100' : 'bg-white/20'}`}>
                              <Phone className={`w-5 h-5`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }} />
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className={`text-xs`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }}>Phone Number</p>
                              <p className={`font-semibold text-sm sm:text-base truncate`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'primary') }}>{profile.phone}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Copy phone number"
                            onClick={() => copyToClipboard(profile.phone)}
                              className={`opacity-70 hover:opacity-100 flex-shrink-0 focus:ring-2 focus:ring-offset-2 transition-all duration-300 hover:scale-110 ${isLightTheme(profile.theme_preference) ? 'focus:ring-blue-400 text-gray-600 hover:text-gray-900' : 'focus:ring-white/50 text-white/80 hover:text-white'}`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                </div>
              )}
              
                      {profile.email && profile.show_email !== false && (
                          <div className={`flex items-center gap-3 p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl backdrop-blur-sm border ${getStyleClasses(profile.style_settings, 'corners')} ${getStyleClasses(profile.style_settings, 'shadow')} ${getFillStyles(profile.style_settings, isLightTheme(profile.theme_preference))} ${isLightTheme(profile.theme_preference) ? 'border-gray-200 hover:border-gray-300' : 'border-white/20 hover:border-white/30'}`}>
                            <div className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center shadow-md ${isLightTheme(profile.theme_preference) ? 'bg-green-100' : 'bg-white/20'}`}>
                              <Mail className={`w-5 h-5`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }} />
                  </div>
                          <div className="flex-1 min-w-0">
                              <p className={`text-xs`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }}>Email Address</p>
                              <p className={`font-semibold text-sm sm:text-base truncate`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'primary') }}>{profile.email}</p>
                  </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Copy email address"
                            onClick={() => copyToClipboard(profile.email)}
                              className={`opacity-70 hover:opacity-100 flex-shrink-0 focus:ring-2 focus:ring-offset-2 transition-all duration-300 hover:scale-110 ${isLightTheme(profile.theme_preference) ? 'focus:ring-blue-400 text-gray-600 hover:text-gray-900' : 'focus:ring-white/50 text-white/80 hover:text-white'}`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                </div>
              )}
        </div>
        
                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {profile.phone && profile.show_phone !== false && (
                        <a
                          href={`tel:${profile.phone}`}
                          className="w-full"
                            aria-label="Call"
                            onClick={() => trackLinkClick({ platform: 'phone', label: 'Phone', url: `tel:${profile.phone}` }, 'contact')}
                        >
                            <Button 
                              className="w-full transition-all duration-300 hover:scale-105 hover:shadow-xl text-white font-medium border-0"
                              style={{ 
                                backgroundColor: getThemeButtonColor(profile.theme_preference),
                                borderRadius: profile.style_settings?.corners === 'round' ? '9999px' : 
                                           profile.style_settings?.corners === 'curved' ? '8px' : 
                                           profile.style_settings?.corners === 'sharp' ? '0px' : '12px',
                                boxShadow: profile.style_settings?.shadow === 'hard' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' :
                                           profile.style_settings?.shadow === 'subtle' ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' :
                                           profile.style_settings?.shadow === 'none' ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                              }}
                            >
                            <Phone className="w-4 h-4 mr-2" />
                              Call
                          </Button>
                        </a>
                      )}
                      
                      {profile.email && profile.show_email !== false && (
                        <a
                          href={`mailto:${profile.email}`}
                          className="w-full"
                          aria-label="Send email"
                          onClick={() => trackLinkClick({ platform: 'email', label: 'Email', url: `mailto:${profile.email}` }, 'contact')}
                        >
                            <Button 
                              className="w-full transition-all duration-300 hover:scale-105 hover:shadow-xl text-white font-medium border-0"
                              style={{ 
                                backgroundColor: getThemeButtonColor(profile.theme_preference),
                                borderRadius: profile.style_settings?.corners === 'round' ? '9999px' : 
                                           profile.style_settings?.corners === 'curved' ? '8px' : 
                                           profile.style_settings?.corners === 'sharp' ? '0px' : '12px',
                                boxShadow: profile.style_settings?.shadow === 'hard' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' :
                                           profile.style_settings?.shadow === 'subtle' ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' :
                                           profile.style_settings?.shadow === 'none' ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                              }}
                            >
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </Button>
                        </a>
                      )}
                      

                      
                      <Button
                        onClick={() => {
                          // Create enhanced vCard content
                          const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.name}
${profile.phone && profile.show_phone !== false ? `TEL;TYPE=CELL:${profile.phone}` : ''}
${profile.email && profile.show_email !== false ? `EMAIL:${profile.email}` : ''}
${profile.title ? `TITLE:${profile.title}` : ''}
${profile.bio ? `NOTE:${profile.bio}` : ''}
${profileLinks.length > 0 ? `URL:${profileLinks[0].url}` : ''}
END:VCARD`;
                          
                          // Create blob and download link
                          const blob = new Blob([vCard], { type: 'text/vcard' });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `${profile.name.replace(/\s+/g, '_')}.vcf`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                          
                          toast.success('Contact saved to your device!');
                        }}
                          className="w-full transition-all duration-200 hover:scale-105 hover:shadow-xl text-white font-medium border-0"
                          style={{ 
                            backgroundColor: getThemeButtonColor(profile.theme_preference),
                            borderRadius: profile.style_settings?.corners === 'round' ? '9999px' : 
                                       profile.style_settings?.corners === 'curved' ? '8px' : 
                                       profile.style_settings?.corners === 'sharp' ? '0px' : '12px',
                            boxShadow: profile.style_settings?.shadow === 'hard' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' :
                                       profile.style_settings?.shadow === 'subtle' ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' :
                                       profile.style_settings?.shadow === 'none' ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Save Contact
                      </Button>
                    </div>
                  </div>
                </div>
                </div>
              </motion.div>
            )}

            {/* Horizontal Divider */}
            {((profile.phone && profile.show_phone !== false) || (profile.email && profile.show_email !== false)) && mainLinks.length > 0 && (
              <div className="flex justify-center py-2">
                <div className={`w-16 h-0.5 rounded-full ${isLightTheme(profile.theme_preference) ? 'bg-gray-300' : 'bg-white/30'}`}></div>
              </div>
            )}

            {/* Main Links */}
            {mainLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="pb-1 px-1 sm:px-2 lg:px-2 pt-2">
                  <div className="space-y-3">
                    <div className="text-center">
                      <h3 className={`flex items-center justify-center gap-2 text-lg sm:text-xl font-semibold mb-1`}
                        style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'primary') }}>
                        <Globe className={`w-5 h-5`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }} />
                      Quick Links
                      </h3>
                      <p className={`text-sm`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }}>
                      Explore my digital presence
                      </p>
                    </div>
                    <div className="space-y-2">
                    {mainLinks.map((link: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        className="block"
                      >
                        <Button
                          variant="outline"
                            className={`w-full justify-between text-left h-auto p-3 group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl backdrop-blur-sm border overflow-hidden ${getStyleClasses(profile.style_settings, 'corners')} ${getStyleClasses(profile.style_settings, 'shadow')} ${getFillStyles(profile.style_settings, isLightTheme(profile.theme_preference))} ${isLightTheme(profile.theme_preference) ? 'border-gray-200 hover:border-gray-300' : 'border-white/20 hover:border-white/30'}`}
                          onClick={() => window.open(link.url, '_blank')}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 overflow-hidden flex-shrink-0 ${isLightTheme(profile.theme_preference) ? 'bg-gray-100 group-hover:bg-gray-200' : 'bg-white/20 group-hover:bg-white/30'}`}>
                              {link.thumbnail ? (
                                <img 
                                  src={link.thumbnail} 
                                  alt={`${link.platform || link.label} thumbnail`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                  <MoreHorizontal className={`w-5 h-5`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }} />
                              )}
                            </div>
                              <span className={`font-medium break-words whitespace-normal min-w-0 flex-1`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'primary') }}>{link.platform || link.label}</span>
                </div>
                          <button
                            type="button"
                              className={`ml-2 p-1 rounded-full bg-transparent transition-colors ${isLightTheme(profile.theme_preference) ? 'hover:bg-gray-200' : 'hover:bg-white/20'}`}
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedLink(link);
                              setLinkModalOpen(true);
                            }}
                          >
                            <MoreHorizontal 
                                className={`w-5 h-5 opacity-50 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 cursor-pointer`}
                                style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }}
                            />
                          </button>
                        </Button>
                      </motion.div>
            ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Horizontal Divider */}
            {mainLinks.length > 0 && socialLinks.length > 0 && (
              <div className="flex justify-center py-1">
                <div className={`w-16 h-0.5 rounded-full ${isLightTheme(profile.theme_preference) ? 'bg-gray-300' : 'bg-white/30'}`}></div>
              </div>
            )}
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="pb-1 px-1 sm:px-2 lg:px-2 pt-2">
                <div className="space-y-3">
                  <div className="text-center">
                    <h3 className={`flex items-center justify-center gap-2 text-lg sm:text-xl font-semibold mb-1`}
                      style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'primary') }}>
                      <Share2 className={`w-5 h-5`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }} />
                    Social Media
                    </h3>
                    <p className={`text-sm`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }}>
                    Connect with me on social platforms
                    </p>
                  </div>
                  <div className="pt-0">
                  {/* More compact social links layout */}
                  <div className={`grid gap-2 ${
                    profile.social_layout_style === 'horizontal' 
                      ? 'grid-cols-1' 
                      : 'grid-cols-2 lg:grid-cols-4'
                  }`}>
                    {socialLinks.map((link: any, idx: number) => {
                      const key = (link.platform || link.label || '').toLowerCase();
                      const Icon = SOCIAL_ICON_MAP[key] || FaLink;
                      // Define platform-specific colors
                      const getPlatformColor = (platform: string) => {
                        const colors: Record<string, { bg: string; hover: string; text: string }> = {
                          instagram: { bg: 'bg-gradient-to-br from-purple-500 to-pink-500', hover: 'hover:from-purple-600 hover:to-pink-600', text: 'text-white' },
                          twitter: { bg: 'bg-sky-500', hover: 'hover:bg-sky-600', text: 'text-white' },
                          x: { bg: 'bg-black', hover: 'hover:bg-gray-800', text: 'text-white' },
                          linkedin: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-white' },
                          facebook: { bg: 'bg-blue-700', hover: 'hover:bg-blue-800', text: 'text-white' },
                          github: { bg: 'bg-gray-800', hover: 'hover:bg-gray-900', text: 'text-white' },
                          whatsapp: { bg: 'bg-green-500', hover: 'hover:bg-green-600', text: 'text-white' },
                          youtube: { bg: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-white' },
                          snapchat: { bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500', text: 'text-black' },
                          tiktok: { bg: 'bg-black', hover: 'hover:bg-gray-800', text: 'text-white' },
                          spotify: { bg: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-white' }
                        };
                        return colors[platform] || { bg: 'bg-gray-600', hover: 'hover:bg-gray-700', text: 'text-white' };
                      };
                      const platformColors = getPlatformColor(key);
                      return (
                        <motion.a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackLinkClick(link, 'social')}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + idx * 0.1 }}
                          className="block group"
                        >
                          {profile.social_layout_style === 'horizontal' ? (
                            /* Horizontal layout - full width cards */
                            <div className={`flex items-center gap-3 p-3 sm:p-4 border transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl ${getStyleClasses(profile.style_settings, 'corners')} ${getStyleClasses(profile.style_settings, 'shadow')} ${getFillStyles(profile.style_settings, isLightTheme(profile.theme_preference))} ${isLightTheme(profile.theme_preference) ? 'border-gray-200 hover:border-gray-300' : 'border-white/20 hover:border-white/30'}`}>
                              {/* Horizontal Icon Container */}
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${platformColors.bg} ${platformColors.hover} ${platformColors.text} flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg`}>
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                              </div>
                              
                              {/* Horizontal Content */}
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-sm sm:text-base capitalize mb-1`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'primary') }}>
                                  {link.platform || link.label}
                                </h3>
                                <p className={`text-xs sm:text-sm truncate`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }}>
                                  @{extractSocialUsername(link.url)}
                                </p>
                              </div>
                              
                              {/* Horizontal External Link Icon */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ExternalLink className={`w-4 h-4 sm:w-5 sm:h-5`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }} />
                              </div>
                            </div>
                          ) : (
                            /* Grid layout - more compact square cards on large screens */
                            <div className={`aspect-square border transition-all duration-300 flex flex-col items-center justify-center text-center group-hover:scale-105 group-hover:shadow-xl p-3 sm:p-4 lg:p-2 lg:w-28 lg:h-28 ${getGridCornerStyles(profile.style_settings)} ${getStyleClasses(profile.style_settings, 'shadow')} ${getFillStyles(profile.style_settings, isLightTheme(profile.theme_preference))} ${isLightTheme(profile.theme_preference) ? 'border-gray-200 hover:border-gray-300' : 'border-white/20 hover:border-white/30'}`}>
                              {/* Grid Icon Container */}
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-8 lg:h-8 rounded-lg ${platformColors.bg} ${platformColors.hover} ${platformColors.text} flex items-center justify-center transition-all duration-300 mb-2 group-hover:scale-110 shadow-lg`}>
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5" />
                              </div>
                              {/* Grid Platform Name */}
                              <h3 className={`font-semibold text-xs sm:text-sm lg:text-xs capitalize mb-1`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'primary') }}>
                                {link.platform || link.label}
                              </h3>
                              {/* Grid Username */}
                              <p className={`text-xs lg:text-[11px] truncate w-full`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }}>
                                @{extractSocialUsername(link.url)}
                              </p>
                              {/* Grid External Link Icon */}
                              <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ExternalLink className={`w-3 h-3`} style={{ color: getPerfectTextColor(profile.wallpaper_preference, profile.theme_preference, profile.style_settings, 'secondary') }} />
                              </div>
                            </div>
                          )}
                        </motion.a>
                      );
                    })}
                  </div>
                  
                  {/* Add empty space if odd number of social links - only for grid layout */}
                </div>
              </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-4 text-center"
        >
          <Separator className="my-4" style={{ background: themeColors.background, opacity: 0.3, height: 1 }} />
          {/* Bouncing Join Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
            className="mx-auto mt-2 mb-4 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center gap-3"
            onClick={() => window.open('/', '_blank')}
          >
            <img 
              src="/fav.png" 
              alt="Scan2Tap logo" 
              className="h-4 w-4 sm:h-5 sm:w-5" 
            />
            <span className="text-sm sm:text-base font-['Link_Sans_Medium']">
              Join <span className={`font-bold drop-shadow-sm ${isLightTheme(profile.theme_preference) ? 'text-blue-600' : 'text-yellow-300'}`}>@{profile.slug || profile.name?.toLowerCase().replace(/\s+/g, '') || 'user'}</span> on Scan2Tap
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;