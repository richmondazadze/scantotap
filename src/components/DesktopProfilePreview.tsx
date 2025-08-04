import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface DesktopProfilePreviewProps {
  profile: any;
  className?: string;
}

export const DesktopProfilePreview: React.FC<DesktopProfilePreviewProps> = ({ profile, className = '' }) => {
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [urlAccessible, setUrlAccessible] = useState(false);

  if (!profile?.slug) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No profile slug found</p>
            <p className="text-xs text-gray-400 mt-1">Please complete your profile setup</p>
          </div>
        </div>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/${profile.slug}`;

  // Test if the URL is accessible
  useEffect(() => {
    const testUrl = async () => {
      try {
        const response = await fetch(profileUrl, { method: 'HEAD' });
        setUrlAccessible(response.ok);
      } catch (error) {
        setUrlAccessible(false);
      }
    };
    testUrl();
  }, [profileUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIframeError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setIframeError(true);
  };

  const refreshIframe = () => {
    setIsLoading(true);
    setIframeError(false);
    const iframe = document.querySelector('iframe[title="Desktop Profile Preview"]') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Desktop Frame - Optimized proportions */}
      <div className="relative mx-auto w-full max-w-lg bg-gray-800 rounded-lg p-3 shadow-2xl">
        {/* Browser Frame */}
        <div className="relative w-full bg-white rounded-lg overflow-hidden">
          {/* Browser Header */}
          <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600">scan2tap.com/{profile.slug}</span>
              </div>
            </div>
          </div>

          {/* Live Profile iframe - Optimized for desktop viewport */}
          <div className="relative min-h-[450px]">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
                <div className="text-center">
                  <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-gray-400" />
                  <p className="text-xs text-gray-500">Loading profile...</p>
                </div>
              </div>
            )}
            
            {iframeError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
                <div className="text-center p-4">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-400" />
                  <p className="text-xs text-gray-600 mb-2">Failed to load profile</p>
                  <button
                    onClick={refreshIframe}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Retry
                  </button>
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 text-xs text-blue-500 hover:text-blue-600"
                  >
                    <ExternalLink className="w-3 h-3 inline mr-1" />
                    Open in new tab
                  </a>
                </div>
              </div>
            ) : (
              <iframe
                src={profileUrl}
                className="w-full h-full border-0"
                title="Desktop Profile Preview"
                loading="lazy"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{
                  // Ensure proper desktop viewport scaling
                  transform: 'scale(1)',
                  transformOrigin: 'top left'
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Preview Label */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          Desktop Preview
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Live profile as seen on desktop devices
        </p>
      </div>
    </div>
  );
}; 