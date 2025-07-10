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
  MessageSquare,
  Users,
  Link,
  Zap,
  Rocket,
  Leaf,
  Infinity,
  Smartphone
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
    <div className="w-full max-w-7xl mx-auto pb-8 sm:pb-16 gap-8 mt-6 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent mb-3">
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
      >
        <Card className="overflow-hidden rounded-xl shadow-xl bg-white/95 dark:bg-[#1A1D24]/95 border border-gray-200/50 dark:border-scan-blue/20 backdrop-blur-xl">
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
                <div className="w-full max-w-sm p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
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
                <div className="p-6 sm:p-8 bg-gradient-to-r from-scan-blue/5 to-scan-purple/5 dark:from-scan-blue/10 dark:to-scan-purple/10 border border-scan-blue/20 dark:border-scan-blue/30 rounded-xl backdrop-blur-sm">
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
        className="space-y-6 sm:space-y-8"
      >
        {/* Platform Features */}
        <div className="relative rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 bg-white/98 dark:bg-[#1A1D24]/98 border border-gray-200/30 dark:border-scan-blue/20 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:bg-white dark:hover:bg-[#1A1D24] hover:border-gray-300/50 dark:hover:border-scan-blue/30 group">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-scan-blue/10 to-scan-purple/10 dark:from-scan-blue/20 dark:to-scan-purple/20 text-scan-blue dark:text-scan-blue-light px-4 py-2 rounded-full text-sm font-medium mb-6 border border-scan-blue/20 dark:border-scan-blue/30">
              <Rocket className="w-4 h-4" />
              Digital Excellence
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent">
              Maximize Your Digital Presence
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl mx-auto">
              Unlock the full potential of your SCAN2TAP digital identity and transform how you network
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
            <div className="space-y-8">
              <div className="group/item flex items-start gap-4 sm:gap-5 p-4 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-500/20 dark:border-blue-500/30 group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-300">Lead Generation</h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    Turn every scan into a potential business opportunity. Capture leads directly from your digital profile with smart analytics.
                  </p>
                </div>
              </div>

              <div className="group/item flex items-start gap-4 sm:gap-5 p-4 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-500/20 dark:to-purple-600/30 rounded-2xl flex items-center justify-center flex-shrink-0 border border-purple-500/20 dark:border-purple-500/30 group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300">
                  <Link className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors duration-300">Social Integration</h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    Connect all your social profiles, websites, and contact methods in one powerful, unified digital identity.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="group/item flex items-start gap-4 sm:gap-5 p-4 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-emerald-500/20 dark:to-emerald-600/30 rounded-2xl flex items-center justify-center flex-shrink-0 border border-emerald-500/20 dark:border-emerald-500/30 group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors duration-300">Instant Updates</h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    Change your contact info once, and it updates everywhere instantly. No more outdated business cards or missed connections.
                  </p>
                </div>
              </div>

              <div className="group/item flex items-start gap-4 sm:gap-5 p-4 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500/10 to-orange-600/20 dark:from-orange-500/20 dark:to-orange-600/30 rounded-2xl flex items-center justify-center flex-shrink-0 border border-orange-500/20 dark:border-orange-500/30 group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300">
                  <Rocket className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors duration-300">Scale Your Network</h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    Build meaningful connections faster than traditional networking. One scan opens doors to unlimited opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="group relative rounded-2xl shadow-xl p-6 sm:p-8 bg-white/98 dark:bg-[#1A1D24]/98 border border-gray-200/30 dark:border-scan-blue/20 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:bg-white dark:hover:bg-[#1A1D24] hover:border-gray-300/50 dark:hover:border-scan-blue/30 text-center hover:-translate-y-1">
            <div className="w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-emerald-500/20 dark:to-emerald-600/30 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 dark:border-emerald-500/30 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
              <Leaf className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">Eco-Friendly</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Digital business cards reduce paper waste and promote environmental sustainability for conscious networking
            </p>
          </div>

          <div className="group relative rounded-2xl shadow-xl p-6 sm:p-8 bg-white/98 dark:bg-[#1A1D24]/98 border border-gray-200/30 dark:border-scan-blue/20 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:bg-white dark:hover:bg-[#1A1D24] hover:border-gray-300/50 dark:hover:border-scan-blue/30 text-center hover:-translate-y-1">
            <div className="w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20 dark:border-blue-500/30 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
              <Infinity className="w-8 h-8 sm:w-9 sm:h-9 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Always Updated</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Your information stays current automatically when you update your profile - no reprinting ever needed
            </p>
          </div>

          <div className="group relative rounded-2xl shadow-xl p-6 sm:p-8 bg-white/98 dark:bg-[#1A1D24]/98 border border-gray-200/30 dark:border-scan-blue/20 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:bg-white dark:hover:bg-[#1A1D24] hover:border-gray-300/50 dark:hover:border-scan-blue/30 text-center hover:-translate-y-1">
            <div className="w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-500/20 dark:to-purple-600/30 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20 dark:border-purple-500/30 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
              <Smartphone className="w-8 h-8 sm:w-9 sm:h-9 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Mobile Ready</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Optimized for all smartphone cameras and QR code scanner apps with lightning-fast recognition
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 