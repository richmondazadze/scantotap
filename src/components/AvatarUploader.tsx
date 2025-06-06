import React, { useRef, useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function AvatarUploader({ onUpload, triggerRef }: { onUpload: (url: string) => void, triggerRef?: React.RefObject<HTMLElement> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // If triggerRef is provided, clicking it will trigger the file input
  useEffect(() => {
    if (!triggerRef?.current) return;
    const handleClick = () => {
      if (fileInputRef.current) fileInputRef.current.click();
    };
    const el = triggerRef.current;
    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, [triggerRef]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      toast.success('Avatar uploaded successfully!');

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      
      // Handle specific error cases
      if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        toast.error('Storage bucket not configured. Please contact support.');
      } else if (error.message?.includes('size')) {
        toast.error('File too large. Maximum size is 5MB.');
      } else if (error.message?.includes('type')) {
        toast.error('Invalid file type. Please select an image file.');
      } else {
        toast.error('Failed to upload avatar. Please try again.');
      }
    } finally {
      setUploading(false);
      // Reset the input so the same file can be selected again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handleFileUpload}
      disabled={uploading}
      style={{ display: 'none' }}
    />
  );
} 