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
  RefreshCw,
  QrCode,
  Mail,
  MessageSquare
} from 'lucide-react';
import Loading from '@/components/ui/loading';

export default function DashboardQR() {
  useAuthGuard(); // Ensure user is authenticated
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const qrRef = useRef<any>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!profile) {
    return (
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col h-full pb-16 gap-6 mt-6 px-4 overflow-x-hidden">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loading size="lg" text="Loading profile..." />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col h-full pb-12 sm:pb-16 gap-8 mt-6 px-4 sm:px-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loading size="lg" text="Loading QR code..." />
        </div>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/profile/${profile.slug || profile.id}`;

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
          title: `${profile?.name || 'Digital Business Card'} - QR Code`,
          text: 'Scan this QR code to view my digital business card',
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
    <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col h-full pb-8 sm:pb-16 gap-8 mt-6 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent mb-3">
              Your QR Code
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Share your digital business card with others
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 shrink-0">
            <Button 
              onClick={downloadQRCode} 
              disabled={loading}
              className="w-full sm:w-auto h-12 px-6 bg-scan-blue hover:bg-scan-blue-dark shadow-lg hover:shadow-xl transition-all rounded-xl font-medium"
            >
              <Download className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Downloading...' : 'Download'}
            </Button>
            <Button 
              variant="outline"
              onClick={shareQRCode}
              className="w-full sm:w-auto h-12 px-6 border-2 border-scan-blue/20 hover:border-scan-blue/40 hover:bg-scan-blue/5 transition-all rounded-xl font-medium"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1"
      >
        <Card className="overflow-hidden rounded-3xl shadow-xl bg-white/95 dark:bg-[#1A1D24]/95 border border-gray-200/50 dark:border-scan-blue/20 backdrop-blur-xl">
          <CardHeader className="p-6 sm:p-8 lg:p-10">
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-scan-blue/10 dark:bg-scan-blue/20 rounded-xl flex items-center justify-center">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-scan-blue" />
              </div>
              QR Code Preview
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
              Anyone can scan this code to view your digital business card
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8 sm:space-y-10">
            {/* QR Code Section */}
            <div className="flex flex-col xl:flex-row gap-8 sm:gap-10 lg:gap-12 items-start overflow-x-hidden">
              {/* QR Code Display */}
              <div className="w-full xl:w-1/2 flex justify-center min-w-0">
                <div className="w-full max-w-sm p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="w-full aspect-square max-w-[300px] sm:max-w-[320px] mx-auto">
                    <QRCodeGenerator 
                      ref={qrRef}
                      profileUrl={profileUrl} 
                      username={profile.slug || profile.id} 
                    />
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="w-full xl:w-1/2 space-y-6 sm:space-y-8 min-w-0">
                {/* Profile URL */}
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                    Your Profile URL
                  </label>
                  <div className="flex gap-2 sm:gap-3">
                    <Input 
                      value={profileUrl} 
                      readOnly 
                      className="text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/50 font-mono min-w-0 flex-1 rounded-xl border-gray-200 dark:border-gray-700 py-3 sm:py-4 overflow-hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(profileUrl)}
                      className="shrink-0 h-10 sm:h-12 px-3 sm:px-4 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(profileUrl, '_blank')}
                      className="shrink-0 h-10 sm:h-12 px-3 sm:px-4 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      View
                    </Button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    This URL opens your digital business card
                  </p>
                </div>

                {/* Instructions */}
                <div className="p-6 sm:p-8 bg-gradient-to-r from-scan-blue/5 to-scan-purple/5 dark:from-scan-blue/10 dark:to-scan-purple/10 border border-scan-blue/20 dark:border-scan-blue/30 rounded-2xl backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <h4 className="font-semibold text-scan-blue dark:text-scan-blue-light text-base sm:text-lg">How to use:</h4>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => window.open(profileUrl, '_blank')}
                      className="w-full sm:w-auto bg-scan-blue hover:bg-scan-blue-dark shadow-lg hover:shadow-xl transition-all rounded-xl font-medium h-10 sm:h-12 px-4 sm:px-6"
                    >
                      Preview Your Profile
                    </Button>
                  </div>
                  <ul className="text-sm sm:text-base text-gray-600 dark:text-gray-400 space-y-2 leading-relaxed">
                    <li>• Show the QR code to others to scan</li>
                    <li>• Share the link via email or messaging</li>
                    <li>• Preview how your profile looks to visitors</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Mobile Share Section */}
            <div className="lg:hidden border-t pt-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Share Options</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 p-4 h-auto justify-center"
                    onClick={() => window.open(`mailto:?subject=My Digital Business Card&body=Check out my digital business card: ${profileUrl}`, '_blank')}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 p-4 h-auto justify-center"
                    onClick={() => window.open(`sms:?body=Check out my digital business card: ${profileUrl}`, '_blank')}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>SMS</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        {/* Platform Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Maximize Your Digital Presence</CardTitle>
            <CardDescription>
              Unlock the full potential of your SCAN2TAP digital identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-scan-blue/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-scan-blue font-bold">💼</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Lead Generation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Turn every scan into a potential business opportunity. Capture leads directly from your digital profile.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-scan-blue/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-scan-blue font-bold">🔗</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Social Integration</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Connect all your social profiles, websites, and contact methods in one powerful digital identity.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-scan-blue/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-scan-blue font-bold">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Instant Updates</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Change your contact info once, and it updates everywhere. No more outdated business cards.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-scan-blue/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-scan-blue font-bold">🚀</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Scale Your Network</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Build meaningful connections faster than traditional networking. One scan opens doors to unlimited opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics or Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold text-lg">✓</span>
            </div>
            <h3 className="font-semibold mb-2">Eco-Friendly</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Digital business cards reduce paper waste and are environmentally sustainable
            </p>
          </Card>
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold text-lg">∞</span>
            </div>
            <h3 className="font-semibold mb-2">Always Updated</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your information stays current automatically when you update your profile
            </p>
          </Card>
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold text-lg">📱</span>
            </div>
            <h3 className="font-semibold mb-2">Mobile Ready</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Optimized for all smartphone cameras and QR code scanner apps
            </p>
          </Card>
        </div>
      </motion.div>
    </div>
  );
} 