import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import {
  FaInstagram, FaTwitter, FaLinkedin, FaFacebook, FaGithub, FaWhatsapp, FaYoutube, FaSnapchat, FaTiktok, FaLink, FaSpotify
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
  UserCheck
} from 'lucide-react';

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
};

const SOCIAL_ICON_LIST = [
  'twitter', 'facebook', 'instagram', 'spotify', 'linkedin', 'github', 'whatsapp', 'youtube', 'snapchat', 'tiktok', 'x'
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
  const hasLinks = profile.links && profile.links.length > 0;
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
  // For WhatsApp, show the number after the last '/'
  // For other socials, show the last segment after '/'
  const parts = cleanUrl.split('/');
  return parts[parts.length - 1];
}

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', id)
        .maybeSingle();
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 text-scan-blue animate-spin" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Loading Profile</h3>
            <p className="text-gray-600 dark:text-gray-400">Preparing your digital experience...</p>
          </CardContent>
        </Card>
      </div>
    );
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
  const socialLinks = (profile.links || []).filter((link: any) => SOCIAL_ICON_LIST.includes((link.platform || link.label || '').toLowerCase()));
  const mainLinks = (profile.links || []).filter((link: any) => !SOCIAL_ICON_LIST.includes((link.platform || link.label || '').toLowerCase()));

  // Get dynamic user data
  const userColors = generateUserColors(profile.name || '');
  const userInitials = generateInitials(profile.name || '');
  const userStatus = getUserStatus(profile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-scan-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-scan-purple/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl lg:max-w-3xl mx-auto flex-1 flex flex-col min-h-screen py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="relative p-8 text-white bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/bcc.jpg)' }}>
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/40"></div>
              
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
              <div className="relative z-10 flex flex-col items-center gap-6 lg:gap-8">
                {/* Dynamic Avatar */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative flex-shrink-0"
                >
                  {/* Main avatar container */}
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 xl:w-48 xl:h-48 rounded-full overflow-hidden shadow-2xl">
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
                        className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white bg-gradient-to-br ${userColors.gradient} flex items-center justify-center`}
                      >
                        {imageLoading && profile.avatar_url && !imageError ? (
                          <Loader2 className="w-8 h-8 lg:w-10 lg:h-10 animate-spin" />
                        ) : (
                          userInitials
                        )}
                      </AvatarFallback>
            </Avatar>
                  </div>

                  {/* Dynamic status badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Badge className={`${userStatus.color} text-white border-2 border-white shadow-lg hover:scale-110 transition-all cursor-help`}>
                      <userStatus.icon className="w-3 h-3 mr-1" />
                      {userStatus.label}
                    </Badge>
                  </motion.div>
                </motion.div>

                {/* Profile Info */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex-1 text-center"
                >
                  <div className="flex items-center justify-center gap-3 mb-3 lg:mb-4">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
                      {profile.name}
                    </h1>
                    {userStatus.label === 'Verified Pro' && (
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-yellow-300 fill-current" />
                      </motion.div>
                    )}
                  </div>
              
                  {profile.title && (
                    <p className="text-lg sm:text-xl lg:text-2xl text-white/90 font-medium mb-3 lg:mb-4">
                      {profile.title}
                    </p>
                  )}
                  {profile.bio && (
                    <p className="text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed max-w-lg lg:max-w-2xl">
                      {profile.bio}
                    </p>
                  )}

                  {/* Professional tagline or connection encouragement */}
                  {(mainLinks.length > 0 || socialLinks.length > 0) && (
                    <div className="mt-6 lg:mt-8">
                      <p className="text-sm sm:text-base lg:text-lg text-white/80 font-medium">
                        Let's connect and explore opportunities together
                      </p>
                </div>
              )}
              
                  {/* Share Button */}
                  <div className="mt-6 lg:mt-8 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(window.location.href)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-sm lg:text-base px-4 py-2 lg:px-6 lg:py-3"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                          Share Profile
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
                </div>
            </div>
          </Card>
        </motion.div>

        <div className="space-y-6 lg:space-y-8">
          {/* Contact & Actions */}
          <div className="space-y-6">
            
            {/* Phone Number */}
            {profile.phone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-scan-blue" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>
                      Get in touch directly
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-scan-blue rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                        <p className="font-semibold text-lg">{profile.phone}</p>
          </div>
        </div>
        
          <div className="grid grid-cols-2 gap-3">
                      <a
                        href={`tel:${profile.phone}`}
                        className="w-full"
                      >
                        <Button className="w-full bg-scan-blue hover:bg-scan-blue/90">
                          <Phone className="w-4 h-4 mr-2" />
                          Call Now
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Create vCard content
                          const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.name}
TEL;TYPE=CELL:${profile.phone}
${profile.title ? `TITLE:${profile.title}` : ''}
${profile.bio ? `NOTE:${profile.bio}` : ''}
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
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Save Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Main Links */}
            {mainLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-scan-blue" />
                      Links & Resources
                    </CardTitle>
                    <CardDescription>
                      Explore my digital presence
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mainLinks.map((link: any, idx: number) => (
                      <motion.a
                        key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        className="block"
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-between text-left h-auto p-4 hover:bg-scan-blue hover:text-white hover:border-scan-blue group transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-scan-blue/10 group-hover:bg-white/20 rounded-lg flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-scan-blue group-hover:text-white" />
                            </div>
                            <span className="font-medium">{link.platform || link.label}</span>
                </div>
                          <ExternalLink className="w-4 h-4 opacity-50" />
                        </Button>
                      </motion.a>
            ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-scan-blue" />
                    Social Media
                  </CardTitle>
                  <CardDescription>
                    Connect with me on social platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {socialLinks.map((link: any, idx: number) => {
                    const key = (link.platform || link.label || '').toLowerCase();
                    const Icon = SOCIAL_ICON_MAP[key] || FaLink;
                    return (
                      <motion.a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + idx * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-scan-blue hover:bg-scan-blue/5 transition-all group cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 group-hover:bg-scan-blue group-hover:text-white rounded-lg flex items-center justify-center transition-all">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {link.platform || link.label}
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {extractSocialUsername(link.url)}
                          </p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-scan-blue" />
                      </motion.a>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Separator className="mb-6" />
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/fav.png" alt="Scan2Tap logo" className="h-6 w-6" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
            Powered by <span className="text-scan-blue font-semibold">Scan2Tap</span>
            </span>
        </div>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-scan-blue/10 text-scan-blue hover:bg-scan-blue/20 transition-all text-sm font-medium"
          >
            <Globe className="w-4 h-4" />
            Get Your Digital Business Card
          </a>
        </motion.div>
        
        {/* Mobile spacing */}
        <div className="block sm:hidden mb-6"></div>
      </div>
    </div>
  );
};

export default ProfilePage;
