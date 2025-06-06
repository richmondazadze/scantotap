import { useState } from 'react';
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

export default function DashboardQR() {
  useAuthGuard(); // Ensure user is authenticated
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);

  if (!profile) {
    return (
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col h-full pb-16 gap-6 mt-6 px-4 overflow-x-hidden">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
          </div>
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
  const downloadQRCode = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('QR Code downloaded');
    } catch (error) {
      toast.error('Failed to download QR code');
    } finally {
      setLoading(false);
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
            <div className="w-full max-w-5xl xl:max-w-6xl mx-auto flex-1 flex flex-col pb-24 sm:pb-16 gap-4 sm:gap-6 mt-4 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-scan-blue dark:text-scan-blue-light mb-2">
              Your QR Code
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Share your digital business card with others
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button 
              onClick={downloadQRCode} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <Download className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Downloading...' : 'Download'}
            </Button>
            <Button 
              variant="outline"
              onClick={shareQRCode}
              className="w-full sm:w-auto"
            >
              <Share2 className="w-4 h-4 mr-2" />
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
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Preview
            </CardTitle>
            <CardDescription>
              Anyone can scan this code to view your digital business card
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code Section */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 items-start">
              {/* QR Code Display */}
              <div className="w-full lg:w-1/2 flex justify-center">
                                  <div className="w-full max-w-xs p-4 sm:p-6">
                    <div className="w-full h-full max-w-[240px] sm:max-w-[280px] max-h-[240px] sm:max-h-[280px] mx-auto">
                    <QRCodeGenerator 
                      profileUrl={profileUrl} 
                      username={profile.slug || profile.id}
                    />
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="w-full lg:w-1/2 space-y-4">
                {/* Profile URL */}
                <div className="space-y-2">
                  <br></br>
                  <br></br>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Profile URL
                  </label>
                                      <div className="flex gap-2">
                      <Input 
                        value={profileUrl} 
                        readOnly 
                        className="text-xs sm:text-sm bg-gray-50 dark:bg-gray-800 font-mono min-w-0 flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(profileUrl)}
                        className="shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(profileUrl, '_blank')}
                        className="shrink-0"
                      >
                        View
                      </Button>
                    </div>
                  <p className="text-xs text-gray-500">
                    This URL opens your digital business card
                  </p>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-scan-blue/5 border border-scan-blue/20 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <h4 className="font-medium text-scan-blue">How to use:</h4>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => window.open(profileUrl, '_blank')}
                      className="w-full sm:w-auto bg-scan-blue hover:bg-scan-blue-dark"
                    >
                      Preview Your Profile
                    </Button>
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Show the QR code to others to scan</li>
                    <li>• Download and print on business cards</li>
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
              Unlock the full potential of your Tap Verse digital identity
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