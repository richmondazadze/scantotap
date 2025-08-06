import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import { X, Check, RotateCcw, Upload, Camera, Image as ImageIcon, Sparkles, ArrowLeft, Plus } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: File) => void;
  initialImage?: File | null;
  maxFileSize?: number; // in MB
  aspectRatio?: number;
  circular?: boolean;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  onCropComplete,
  initialImage,
  maxFileSize = 5,
  aspectRatio = 1,
  circular = true,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [step, setStep] = useState<'select' | 'crop'>('select');
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Initialize with image if provided
  useEffect(() => {
    if (initialImage && isOpen) {
      handleFileSelect(initialImage);
    }
  }, [initialImage, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('select');
        setImageSrc('');
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setCroppedAreaPixels(null);
        setSelectedFile(null);
        setIsProcessing(false);
      }, 200);
    }
  }, [isOpen]);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      toast({
        title: "File too large",
        description: `Please select an image smaller than ${maxFileSize}MB.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setImageSrc(imageUrl);
      setStep('crop');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const onCropAreaChange = useCallback((croppedArea: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels || !imageSrc) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const image = new Image();
    image.crossOrigin = 'anonymous';

    return new Promise<File>((resolve, reject) => {
      image.onload = () => {
        // Calculate dimensions
        const { width, height, x, y } = croppedAreaPixels;
        
        canvas.width = width;
        canvas.height = height;

        // Apply rotation if needed
        if (rotation !== 0) {
          ctx.translate(width / 2, height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-width / 2, -height / 2);
        }

        // Draw the cropped area
        ctx.drawImage(
          image,
          x,
          y,
          width,
          height,
          0,
          0,
          width,
          height
        );

        // Convert to blob and then to File
        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], `cropped-${selectedFile?.name || 'image.jpg'}`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(croppedFile);
          } else {
            reject(new Error('Failed to create cropped image'));
          }
        }, 'image/jpeg', 0.9);
      };

      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = imageSrc;
    });
  }, [croppedAreaPixels, imageSrc, rotation, selectedFile]);

  const handleCropConfirm = async () => {
    setIsProcessing(true);
    try {
      const croppedFile = await createCroppedImage();
      if (croppedFile) {
        onCropComplete(croppedFile);
        onClose();
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to crop the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const renderSelectStep = () => (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center min-h-[350px] sm:min-h-[400px] relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-900/10 dark:via-purple-900/5 dark:to-pink-900/10 animate-gradient-shift"></div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm mx-auto">
        {/* Icon container with glassmorphism */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 flex items-center justify-center mb-6 shadow-xl relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-2xl"></div>
          <Camera className="w-12 h-12 sm:w-14 sm:h-14 text-blue-600 dark:text-blue-400 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 absolute top-1 right-1 sm:top-2 sm:right-2 animate-pulse" />
        </div>
        
        {/* Title with gradient text */}
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Upload & Crop
        </h3>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
          Select an image and create the perfect profile picture
        </p>
        
        {/* Upload button with modern design */}
        <div className="space-y-3 sm:space-y-4">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 border-0 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base lg:text-lg font-semibold relative overflow-hidden group"
            size="lg"
          >
            {/* Button background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 to-purple-700/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 relative z-10" />
            <span className="relative z-10">Choose Image</span>
          </Button>
          
          {/* File info with modern styling */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 dark:border-gray-700/20">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-1 sm:gap-2">
              <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              Max {maxFileSize}MB • JPG, PNG, GIF
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );

  const renderCropStep = () => (
    <div className="flex flex-col h-full min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] relative">
      {/* Header with title */}
      <div className="flex items-center justify-center p-2 sm:p-3 lg:p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 relative z-20">
        <h3 className="text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1 sm:gap-2">
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-purple-500" />
          Crop & Perfect
        </h3>
      </div>

      {/* Crop area with enhanced styling */}
      <div className="relative flex-1 min-h-[200px] bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.1)_1px,_transparent_0)] bg-[length:20px_20px]"></div>
        </div>
        
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropAreaChange}
          cropShape={circular ? 'round' : 'rect'}
          showGrid={!circular}
          objectFit="contain"
          style={{
            containerStyle: {
              backgroundColor: 'transparent',
            },
            mediaStyle: {
              borderRadius: '12px',
              filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))',
            },
            cropAreaStyle: {
              border: circular 
                ? '4px solid rgba(59, 130, 246, 0.8)' 
                : '4px solid rgba(59, 130, 246, 0.8)',
              borderRadius: circular ? '50%' : '12px',
              boxShadow: circular 
                ? '0 0 0 9999px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(59, 130, 246, 0.2), 0 0 20px rgba(59, 130, 246, 0.3)' 
                : '0 0 0 9999px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(59, 130, 246, 0.2), 0 0 20px rgba(59, 130, 246, 0.3)',
            },
          }}
        />
      </div>

      {/* Enhanced controls panel - Compact design */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 relative z-20">
        {/* Zoom control with compact design */}
        <div className="p-2 sm:p-3 border-b border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              Zoom
            </label>
            <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg">
              {zoom.toFixed(1)}x
            </span>
          </div>
          
          <div className="relative">
            {/* Modern slider with enhanced styling */}
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 sm:h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded-full appearance-none cursor-pointer modern-slider"
              style={{
                background: `linear-gradient(to right, 
                  rgb(59, 130, 246) 0%, 
                  rgb(59, 130, 246) ${((zoom - 1) / 2) * 100}%, 
                  rgb(229, 231, 235) ${((zoom - 1) / 2) * 100}%, 
                  rgb(229, 231, 235) 100%)`
              }}
            />
            
            {/* Zoom level indicators */}
            <div className="flex justify-between text-xs text-gray-400 mt-1 sm:mt-2">
              <span>1x</span>
              <span>2x</span>
              <span>3x</span>
            </div>
          </div>
        </div>

        {/* Action buttons - All in one row for small screens */}
        <div className="p-2 sm:p-3">
          <div className="flex gap-1 sm:gap-2">
            {/* Rotate Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              className="flex-1 h-9 sm:h-10 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-medium text-xs">Rotate</span>
            </Button>
            
            {/* Reset Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1 h-9 sm:h-10 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="font-medium text-xs">Reset</span>
            </Button>
            
            {/* Back Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep('select')}
              className="flex-1 h-9 sm:h-10 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="font-medium text-xs">Back</span>
            </Button>
            
            {/* Upload Button */}
            <Button
              onClick={handleCropConfirm}
              disabled={isProcessing}
              size="sm"
              className="flex-[2] h-9 sm:h-10 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
            >
              {/* Button animation overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 to-purple-700/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              {isProcessing ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span className="font-semibold text-xs">Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 relative z-10" />
                  <span className="font-semibold text-xs relative z-10">Upload</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] lg:max-h-[85vh] p-0 gap-0 overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
        <DialogHeader className="sr-only">
          <DialogTitle>Image Crop Editor</DialogTitle>
          <DialogDescription>
            Crop and adjust your profile image to the perfect size and position
          </DialogDescription>
        </DialogHeader>
        
        {/* Universal close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-110 transition-all duration-200 shadow-lg group"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors duration-200" />
        </button>

        {/* Main content container */}
        <div className="flex flex-col h-full bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/20 dark:border-gray-700/20">
          {step === 'select' && renderSelectStep()}
          {step === 'crop' && renderCropStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};