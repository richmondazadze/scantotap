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
              Share your digital profile with others
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
              Anyone can scan this code to view your digital profile
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
                    This URL opens your digital profile
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
                    onClick={() => window.open(`mailto:?subject=My Digital Profile&body=Check out my digital profile: ${profileUrl}`, '_blank')}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 p-4 h-auto justify-center"
                    onClick={() => window.open(`sms:?body=Check out my digital profile: ${profileUrl}`, '_blank')}
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
        <div className="relative rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-10 bg-white/98 dark:bg-[#1A1D24]/98 border border-gray-200/30 dark:border-scan-blue/20 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:bg-white dark:hover:bg-[#1A1D24] hover:border-gray-300/50 dark:hover:border-scan-blue/30 group overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-scan-blue/3 via-transparent to-scan-purple/3 dark:from-scan-blue/5 dark:to-scan-purple/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-bl from-scan-blue/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 bg-gradient-to-tr from-scan-purple/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-6 sm:mb-8 lg:mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-scan-blue/10 to-scan-purple/10 dark:from-scan-blue/20 dark:to-scan-purple/20 text-scan-blue dark:text-scan-blue-light px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-scan-blue/20 dark:border-scan-blue/30 backdrop-blur-sm">
                <Rocket className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Digital Excellence</span>
                <span className="xs:hidden">Excellence</span>
              </div>
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent leading-tight px-2">
                <span className="block xs:hidden">Maximize Your Digital Presence</span>
                <span className="hidden xs:block">Maximize Your Digital Presence</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto px-2 sm:px-4">
                <span className="block sm:hidden">Transform how you network with powerful digital identity tools</span>
                <span className="hidden sm:block">Unlock the full potential of your SCAN2TAP digital identity and transform how you network</span>
              </p>
            </div>

            {/* Mobile: Single column layout */}
            <div className="block lg:hidden space-y-4 sm:space-y-6">
              <div className="group/item flex items-start gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all duration-300 border border-transparent hover:border-blue-500/20 dark:hover:border-blue-400/20">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-500/20 dark:border-blue-500/30 group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-300 leading-tight">Lead Generation</h4>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    <span className="block sm:hidden">Turn scans into business opportunities with smart analytics</span>
                    <span className="hidden sm:block">Turn every scan into a potential business opportunity. Capture leads directly from your digital profile with smart analytics.</span>
                  </p>
                </div>
              </div>

              <div className="group/item flex items-start gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all duration-300 border border-transparent hover:border-purple-500/20 dark:hover:border-purple-400/20">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-500/20 dark:to-purple-600/30 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 border border-purple-500/20 dark:border-purple-500/30 group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300">
                  <Link className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors duration-300 leading-tight">Social Integration</h4>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    <span className="block sm:hidden">Connect all your profiles in one unified digital identity</span>
                    <span className="hidden sm:block">Connect all your social profiles, websites, and contact methods in one powerful, unified digital identity.</span>
                  </p>
                </div>
              </div>

              <div className="group/item flex items-start gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all duration-300 border border-transparent hover:border-emerald-500/20 dark:hover:border-emerald-400/20">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-emerald-500/20 dark:to-emerald-600/30 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 border border-emerald-500/20 dark:border-emerald-500/30 group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors duration-300 leading-tight">Instant Updates</h4>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    <span className="block sm:hidden">Update once, changes everywhere instantly</span>
                    <span className="hidden sm:block">Change your contact info once, and it updates everywhere instantly. No more outdated business cards or missed connections.</span>
                  </p>
                </div>
              </div>

              <div className="group/item flex items-start gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all duration-300 border border-transparent hover:border-orange-500/20 dark:hover:border-orange-400/20">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-500/10 to-orange-600/20 dark:from-orange-500/20 dark:to-orange-600/30 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 border border-orange-500/20 dark:border-orange-500/30 group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300">
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors duration-300 leading-tight">Scale Your Network</h4>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    <span className="block sm:hidden">Build connections faster than traditional networking</span>
                    <span className="hidden sm:block">Build meaningful connections faster than traditional networking. One scan opens doors to unlimited opportunities.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop: Two column layout */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-8 xl:gap-12">
              <div className="space-y-8">
                <div className="group/item flex items-start gap-5 p-5 rounded-2xl hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all duration-300 border border-transparent hover:border-blue-500/20 dark:hover:border-blue-400/20">
                  <div className="w-16 h-16 xl:w-18 xl:h-18 bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-500/20 dark:border-blue-500/30 group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300">
                    <Users className="w-7 h-7 xl:w-8 xl:h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl xl:text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-300">Lead Generation</h4>
                    <p className="text-base xl:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                      Turn every scan into a potential business opportunity. Capture leads directly from your digital profile with smart analytics.
                    </p>
                  </div>
                </div>

                <div className="group/item flex items-start gap-5 p-5 rounded-2xl hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all duration-300 border border-transparent hover:border-purple-500/20 dark:hover:border-purple-400/20">
                  <div className="w-16 h-16 xl:w-18 xl:h-18 bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-500/20 dark:to-purple-600/30 rounded-2xl flex items-center justify-center flex-shrink-0 border border-purple-500/20 dark:border-purple-500/30 group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300">
                    <Link className="w-7 h-7 xl:w-8 xl:h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl xl:text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors duration-300">Social Integration</h4>
                    <p className="text-base xl:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                      Connect all your social profiles, websites, and contact methods in one powerful, unified digital identity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="group/item flex items-start gap-5 p-5 rounded-2xl hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all duration-300 border border-transparent hover:border-emerald-500/20 dark:hover:border-emerald-400/20">
                  <div className="w-16 h-16 xl:w-18 xl:h-18 bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-emerald-500/20 dark:to-emerald-600/30 rounded-2xl flex items-center justify-center flex-shrink-0 border border-emerald-500/20 dark:border-emerald-500/30 group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300">
                    <Zap className="w-7 h-7 xl:w-8 xl:h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl xl:text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors duration-300">Instant Updates</h4>
                    <p className="text-base xl:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                      Change your contact info once, and it updates everywhere instantly. No more outdated business cards or missed connections.
                    </p>
                  </div>
                </div>

                <div className="group/item flex items-start gap-5 p-5 rounded-2xl hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all duration-300 border border-transparent hover:border-orange-500/20 dark:hover:border-orange-400/20">
                  <div className="w-16 h-16 xl:w-18 xl:h-18 bg-gradient-to-br from-orange-500/10 to-orange-600/20 dark:from-orange-500/20 dark:to-orange-600/30 rounded-2xl flex items-center justify-center flex-shrink-0 border border-orange-500/20 dark:border-orange-500/30 group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300">
                    <Rocket className="w-7 h-7 xl:w-8 xl:h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl xl:text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors duration-300">Scale Your Network</h4>
                    <p className="text-base xl:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                      Build meaningful connections faster than traditional networking. One scan opens doors to unlimited opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="group relative rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 md:p-8 bg-white/98 dark:bg-[#1A1D24]/98 border border-gray-200/30 dark:border-scan-blue/20 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:bg-white dark:hover:bg-[#1A1D24] hover:border-emerald-300/50 dark:hover:border-emerald-500/30 text-center hover:-translate-y-2 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-600/5 dark:from-emerald-500/10 dark:to-emerald-600/10"></div>
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-emerald-500/20 dark:to-emerald-600/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 border border-emerald-500/20 dark:border-emerald-500/30 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                <Leaf className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 leading-tight">Eco-Friendly</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                <span className="block sm:hidden">Reduce paper waste with digital cards</span>
                <span className="hidden sm:block lg:hidden">Digital cards reduce paper waste and promote sustainability</span>
                <span className="hidden lg:block">Digital profiles reduce paper waste and promote environmental sustainability for conscious networking</span>
              </p>
            </div>
          </div>

          <div className="group relative rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 md:p-8 bg-white/98 dark:bg-[#1A1D24]/98 border border-gray-200/30 dark:border-scan-blue/20 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:bg-white dark:hover:bg-[#1A1D24] hover:border-blue-300/50 dark:hover:border-blue-500/30 text-center hover:-translate-y-2 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5 dark:from-blue-500/10 dark:to-blue-600/10"></div>
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 border border-blue-500/20 dark:border-blue-500/30 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                <Infinity className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">Always Updated</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                <span className="block sm:hidden">Information stays current automatically</span>
                <span className="hidden sm:block lg:hidden">Your information stays current when you update your profile</span>
                <span className="hidden lg:block">Your information stays current automatically when you update your profile - no reprinting ever needed</span>
              </p>
            </div>
          </div>

          <div className="group relative rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 md:p-8 bg-white/98 dark:bg-[#1A1D24]/98 border border-gray-200/30 dark:border-scan-blue/20 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:bg-white dark:hover:bg-[#1A1D24] hover:border-purple-300/50 dark:hover:border-purple-500/30 text-center hover:-translate-y-2 overflow-hidden sm:col-span-2 lg:col-span-1">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-600/5 dark:from-purple-500/10 dark:to-purple-600/10"></div>
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-500/20 dark:to-purple-600/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 border border-purple-500/20 dark:border-purple-500/30 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 leading-tight">Mobile Ready</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                <span className="block sm:hidden">Optimized for all smartphone cameras</span>
                <span className="hidden sm:block lg:hidden">Optimized for all smartphone cameras and QR scanners</span>
                <span className="hidden lg:block">Optimized for all smartphone cameras and QR code scanner apps with lightning-fast recognition</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 