import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useProfile } from '@/contexts/ProfileContext';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Download,
  Share2,
  Copy,
  QrCode,
  Mail,
  MessageSquare,
  Smartphone,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Loading from '@/components/ui/loading';

export default function DashboardQR() {
  useAuthGuard();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const qrRef = useRef<any>(null);

  if (!profile) {
    return (
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-20 lg:pb-8 pt-3 sm:pt-4 lg:pt-6 overflow-x-hidden">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loading size="lg" text="Loading profile..." />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-20 lg:pb-8 pt-3 sm:pt-4 lg:pt-6 overflow-x-hidden">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loading size="lg" text="Loading QR code..." />
        </div>
      </div>
    );
  }

  // Generate profile URL for QR code
  const profileUrl = `${window.location.origin}/${profile.slug || profile.id}`;

  // Copy URL to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  // Download QR code
  const downloadQRCode = () => {
    if (qrRef.current && qrRef.current.downloadQRCode) {
      qrRef.current.downloadQRCode();
    } else {
      toast.error("QR code not ready.");
    }
  };

  // Share QR code
  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name || 'Digital Profile'} - QR Code`,
          text: 'Scan this QR code to view my digital profile',
          url: profileUrl,
        });
      } catch (error) {
        copyToClipboard(profileUrl);
      }
    } else {
      copyToClipboard(profileUrl);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-20 lg:pb-8 pt-3 sm:pt-4 lg:pt-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 lg:mb-8"
      >
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              Your QR Code
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              Share your digital profile with others instantly
            </p>
          </div>
        </div>
      </motion.div>

      {/* QR Code Display Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-600 flex-shrink-0" />
              <span>Your Personal QR Code</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
              Anyone can scan this code to instantly view your digital profile. 
              Download, share, or print it on your business cards.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
            <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 items-start">
              {/* QR Code Display */}
              <div className="w-full xl:w-1/2 flex justify-center">
                <div className="w-full aspect-square max-w-[240px] sm:max-w-[280px] lg:max-w-[320px] mx-auto">
                  <QRCodeGenerator 
                    ref={qrRef}
                    profileUrl={profileUrl} 
                    username={profile.slug || profile.id} 
                  />
                </div>
              </div>

              {/* QR Code Actions */}
              <div className="w-full xl:w-1/2 space-y-3 sm:space-y-4 lg:space-y-6 min-w-0">
                {/* Quick Actions */}
                <div className="space-y-2 sm:space-y-3">
                  <Button 
                    onClick={downloadQRCode} 
                    disabled={loading}
                    className="w-full h-10 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all rounded-lg font-medium text-sm"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Download QR Code
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={shareQRCode}
                    className="w-full h-10 sm:h-12 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all rounded-lg font-medium text-sm"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Share QR Code
                  </Button>
                </div>

                {/* Profile URL */}
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Profile URL
                  </label>
                  <div className="flex gap-1.5 sm:gap-2 min-w-0">
                    <Input 
                      value={profileUrl} 
                      readOnly 
                      className="text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/50 font-mono flex-1 rounded-lg border-gray-200 dark:border-gray-700 min-w-0 pr-1"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(profileUrl)}
                      className="px-2 sm:px-3 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex-shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(profileUrl, '_blank')}
                      className="px-2 sm:px-3 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex-shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This URL opens your digital profile
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Share Options Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <span>Share Your Profile</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
              Multiple ways to share your digital profile with others
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {/* Email Share */}
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 h-auto rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all min-w-0"
                onClick={() => window.open(`mailto:?subject=My Digital Profile&body=Check out my digital profile: ${profileUrl}`, '_blank')}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-center min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Email</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Send via email</div>
                </div>
              </Button>

              {/* SMS Share */}
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 h-auto rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-all min-w-0"
                onClick={() => window.open(`sms:?body=Check out my digital profile: ${profileUrl}`, '_blank')}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">SMS</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Send via text</div>
                </div>
              </Button>

              {/* Mobile Share */}
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 h-auto rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all min-w-0 sm:col-span-2 lg:col-span-1"
                onClick={() => window.open(profileUrl, '_blank')}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-center min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Preview</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">View your profile</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* QR Code Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg">QR Code Features</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
            <div className="space-y-3 sm:space-y-4 lg:space-y-5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <div className="flex gap-2 sm:gap-3 lg:gap-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">1</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base mb-1">Universal Compatibility</p>
                  <p className="leading-relaxed">Works with any smartphone camera or QR code scanner app.</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 lg:gap-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-xs">2</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base mb-1">Always Up-to-Date</p>
                  <p className="leading-relaxed">Your QR code automatically reflects any changes you make to your profile.</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 lg:gap-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 dark:text-green-400 font-bold text-xs">3</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base mb-1">High Quality</p>
                  <p className="leading-relaxed">Optimized for printing on business cards, flyers, and other materials.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 