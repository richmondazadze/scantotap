import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import { X, Check, RotateCcw, Upload, Camera } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-6 shadow-sm">
        <Camera className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Upload Profile Picture</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Select an image to crop for your profile picture
      </p>
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="w-full max-w-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        <Upload className="w-4 h-4 mr-2" />
        Choose Image
      </Button>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Max file size: {maxFileSize}MB • JPG, PNG, GIF
      </p>
      
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
    <div className="flex flex-col h-full">
      {/* Crop area */}
      <div className="relative flex-1 min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden mx-4 mb-4 shadow-inner">
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
            },
            cropAreaStyle: {
              border: circular ? '3px solid #3b82f6' : '3px solid #3b82f6',
              borderRadius: circular ? '50%' : '12px',
              boxShadow: circular 
                ? '0 0 0 9999px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(59, 130, 246, 0.3)' 
                : '0 0 0 9999px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(59, 130, 246, 0.3)',
            },
          }}
        />
      </div>

      {/* Controls */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-t-2xl border-t border-gray-200 dark:border-gray-600">
        {/* Zoom control */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">Zoom</label>
          <div className="relative">
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer slider-enhanced"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center gap-3">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              className="touch-manipulation rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="touch-manipulation rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 shadow-sm"
            >
              Reset
            </Button>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setStep('select')}
              className="touch-manipulation rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 shadow-sm"
            >
              Back
            </Button>
            <Button
              onClick={handleCropConfirm}
              disabled={isProcessing}
              className="touch-manipulation rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Uploading...' : 'Upload'}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-2xl w-[calc(100vw-2rem)] mx-auto p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl border-0 bg-white dark:bg-gray-900">
        {step === 'select' && (
          <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Select Image
              </DialogTitle>
            </div>
          </DialogHeader>
        )}

        <div className="flex-1 bg-white dark:bg-gray-900">
          {step === 'select' && renderSelectStep()}
          {step === 'crop' && renderCropStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};