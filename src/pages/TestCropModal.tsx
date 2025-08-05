import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { ImageCropModal } from '../components/ImageCropModal';
import { Camera, Upload } from 'lucide-react';

export const TestCropModal: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('');

  const handleCropComplete = (croppedFile: File) => {
    // Create a preview URL for the cropped image
    const url = URL.createObjectURL(croppedFile);
    setCroppedImageUrl(url);
    

  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Image Crop Modal Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Test the new image cropping functionality with mobile-optimized touch gestures
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Demo Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Demo Controls
            </h2>
            
            <div className="space-y-4">
              <Button
                onClick={openModal}
                size="lg"
                className="w-full justify-start gap-3"
              >
                <Camera className="h-5 w-5" />
                Open Crop Modal
              </Button>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>📱 <strong>Mobile Features:</strong></p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Touch-optimized drag and zoom gestures</li>
                  <li>Circle crop mask for avatar-style cropping</li>
                  <li>5MB file size validation</li>
                  <li>Smooth state transitions</li>
                  <li>Mobile-responsive design</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Cropped Result
            </h2>
            
            {croppedImageUrl ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={croppedImageUrl}
                    alt="Cropped result"
                    className="w-48 h-48 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 shadow-lg"
                  />
                </div>
                
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      URL.revokeObjectURL(croppedImageUrl);
                      setCroppedImageUrl('');
                    }}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    Clear Result
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Upload className="h-12 w-12 mb-4" />
                <p className="text-center">
                  No cropped image yet.<br />
                  Use the "Open Crop Modal" button to start.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features List */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            ✨ Features Implemented
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Core Features</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>✅ Drag and zoom gestures</li>
                <li>✅ Circle crop mask</li>
                <li>✅ File size validation (5MB)</li>
                <li>✅ Image rotation (90° increments)</li>
                <li>✅ Reset and cancel functionality</li>
                <li>✅ State-based flow (select → crop → preview)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Mobile Optimizations</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>✅ Touch-optimized controls</li>
                <li>✅ Mobile-responsive layout</li>
                <li>✅ Natural gesture handling</li>
                <li>✅ Large touch targets (44px min)</li>
                <li>✅ Smooth transitions</li>
                <li>✅ Dark mode support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onCropComplete={handleCropComplete}
        maxFileSize={5}
        aspectRatio={1}
        circular={true}
      />
    </div>
  );
}; 