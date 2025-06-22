import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Camera, Upload, X, Image } from 'lucide-react';
import { uploadAvatar } from '../lib/uploadAvatar';
import { useToast } from '../hooks/use-toast';

interface AvatarUploaderProps {
  currentAvatar?: string;
  onAvatarUpdate: (avatarUrl: string) => void;
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showRemove?: boolean;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatar,
  onAvatarUpdate,
  userId,
  size = 'md',
  showRemove = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showMobileOptions, setShowMobileOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'w-20 h-20 sm:w-24 sm:h-24',
    md: 'w-32 h-32 sm:w-40 sm:h-40',
    lg: 'w-40 h-40 sm:w-52 sm:h-52'
  };

  // Detect if user is on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Handle avatar click - shows modal on mobile for avatar area only
  const handleAvatarClick = useCallback(() => {
    if (isMobile) {
      setShowMobileOptions(true);
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  }, [isMobile]);

  // Handle upload button click - directly opens native picker
  const handleUploadButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Setup event listeners with proper cleanup
  useEffect(() => {
    const avatarElement = document.querySelector('[data-avatar-clickable="true"]');
    
    if (avatarElement) {
      // Add a small delay to ensure input is ready
      const timeoutId = setTimeout(() => {
        // Desktop click events
        avatarElement.addEventListener('click', handleAvatarClick);
        
        // Mobile touch events
        avatarElement.addEventListener('touchend', handleAvatarClick);
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        avatarElement.removeEventListener('click', handleAvatarClick);
        avatarElement.removeEventListener('touchend', handleAvatarClick);
      };
    }
  }, [handleAvatarClick]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    setShowMobileOptions(false); // Close mobile options

    try {
      const avatarUrl = await uploadAvatar(file, userId);
      onAvatarUpdate(avatarUrl);
      
      // Removed success toast - silent success
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Reset file inputs
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    onAvatarUpdate('');
    setShowMobileOptions(false);
    // Removed success toast - silent success
  };

  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
    setShowMobileOptions(false);
  };

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setShowMobileOptions(false);
  };

  const displayAvatar = previewUrl || currentAvatar;

  return (
    <div className="avatar-upload-container flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar 
          className={`${sizeClasses[size]} cursor-pointer transition-all duration-200 hover:opacity-80 border-2 border-dashed border-gray-300 hover:border-gray-400`}
          data-avatar-clickable="true"
        >
          <AvatarImage src={displayAvatar} alt="Profile" />
          <AvatarFallback className="bg-gray-100">
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            ) : (
              <Camera className="h-6 w-6 text-gray-400" />
            )}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay for better UX */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center">
          <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>

      {/* Hidden file inputs - Main input opens native device picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      
      {/* Camera-only input for modal option */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Mobile Options Modal - Only for avatar clicks */}
      {showMobileOptions && (
        <div className="avatar-upload-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="avatar-upload-modal-content bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-white">Choose Photo Source</h3>
            
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleCameraClick}
                disabled={isUploading}
                className="w-full justify-start gap-3 h-12"
              >
                <Camera className="h-5 w-5" />
                Take Photo with Camera
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleGalleryClick}
                disabled={isUploading}
                className="w-full justify-start gap-3 h-12"
              >
                <Image className="h-5 w-5" />
                Choose from Gallery
              </Button>
              
              {showRemove && displayAvatar && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                  className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300 dark:border-red-800 dark:hover:border-red-700"
                >
                  <X className="h-5 w-5" />
                  Remove Photo
                </Button>
              )}
            </div>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowMobileOptions(false)}
              className="w-full mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Upload buttons - Always use native picker */}
      <div className="avatar-upload-buttons flex flex-col gap-2 w-full max-w-xs">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadButtonClick}
          disabled={isUploading}
          className="avatar-upload-button w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </Button>

        {showRemove && displayAvatar && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
            className="avatar-upload-button w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300 dark:border-red-800 dark:hover:border-red-700"
          >
            <X className="h-4 w-4 mr-2" />
            Remove Photo
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center max-w-xs">
        {isMobile 
          ? 'Tap "Upload Photo" to choose from camera or gallery. Tap avatar for more options.'
          : 'Click the avatar or upload button to change your profile picture. Supported formats: JPG, PNG, GIF (max 5MB)'
        }
      </p>
    </div>
  );
}; 