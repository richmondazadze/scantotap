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
      {/* iPhone 15 Pro Max Frame - Enhanced design */}
      <div className="relative mx-auto w-72 h-[580px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-[3rem] p-1 shadow-2xl border border-gray-700">
        {/* Phone Screen */}
        <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden shadow-inner">
          {/* Live Profile iframe - Enhanced container */}
          <div className="relative h-full overflow-hidden scrollbar-hide mobile-preview-container">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 z-20">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-3">
                    <RefreshCw className="w-full h-full animate-spin text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Loading preview...</p>
                  <p className="text-xs text-gray-500 mt-1">This may take a moment</p>
                </div>
              </div>
            )}
            
            {iframeError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 z-20">
                <div className="text-center p-6">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-500" />
                  <p className="text-sm font-medium text-gray-800 mb-2">Failed to load profile</p>
                  <p className="text-xs text-gray-600 mb-4">The preview couldn't be loaded</p>
                  <div className="space-y-2">
                    <button
                      onClick={refreshIframe}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Try Again
                    </button>
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ExternalLink className="w-3 h-3 inline mr-1" />
                      Open in new tab
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-full scrollbar-hide mobile-preview-container">
                <div 
                  className="relative bg-white scrollbar-hide mobile-preview-container shadow-lg"
                  style={{
                    width: '264px',
                    height: '572px',
                    overflow: 'hidden',
                    borderRadius: '8px'
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
                      transform: 'scale(0.68)',
                      transformOrigin: 'top left',
                      border: 'none',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      margin: '0',
                      padding: '0',
                      display: 'block'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Home Indicator */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-sm"></div>
        
        {/* Subtle reflection effect */}
        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-transparent via-transparent to-black/5 pointer-events-none"></div>
      </div>
    </div>
  );
}; 