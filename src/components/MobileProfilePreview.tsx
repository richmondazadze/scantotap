import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface MobileProfilePreviewProps {
  profile: any;
  className?: string;
}

export const MobileProfilePreview: React.FC<MobileProfilePreviewProps> = ({ profile, className = '' }) => {
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
    const iframe = document.querySelector('iframe[title="Profile Preview"]') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* iPhone 15 Pro Max Frame - Clean square border */}
      <div className="relative mx-auto w-72 h-[580px] bg-gray-900 rounded-[3.5rem] p-3 shadow-2xl">
        {/* Phone Screen */}
        <div className="relative w-full h-full bg-white rounded-[3rem] overflow-hidden">
          {/* Live Profile iframe - Clean square border */}
          <div className="relative h-full overflow-hidden scrollbar-hide mobile-preview-container">
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
              <div className="flex justify-center items-start h-full scrollbar-hide mobile-preview-container">
                <div 
                  className="relative bg-white scrollbar-hide mobile-preview-container"
                  style={{
                    width: '260px', // 390 * 0.67 scale factor
                    height: '566px', // 844 * 0.67 scale factor
                    overflow: 'hidden',
                    borderRadius: '12px'
                  }}
                >
                  <iframe
                    src={profileUrl}
                    className="w-full h-full border-0 scrollbar-hide mobile-preview-iframe"
                    title="Profile Preview"
                    loading="lazy"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    style={{
                      width: '390px',
                      height: '844px',
                      transform: 'scale(0.67)',
                      transformOrigin: 'top left',
                      border: 'none',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full"></div>
      </div>


    </div>
  );
}; 