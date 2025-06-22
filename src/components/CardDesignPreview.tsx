import React from 'react';
import { QrCode, Phone, Mail, Globe, MapPin } from 'lucide-react';

interface CardDesignPreviewProps {
  design: {
    id: string;
    name: string;
  };
  profile?: {
    name: string;
    title?: string;
    phone?: string;
  };
  colorScheme: {
    primary: string;
    secondary: string;
  };
  material?: {
    id: string;
    name: string;
  };
  className?: string;
}

export const CardDesignPreview: React.FC<CardDesignPreviewProps> = ({ 
  design, 
  profile, 
  colorScheme, 
  material,
  className = '' 
}) => {
  const defaultProfile = {
    name: profile?.name || 'John Doe',
    title: profile?.title || 'Digital Entrepreneur',
    phone: profile?.phone || '+1 (555) 123-4567'
  };



  // Get card design name (handle both string names and UUIDs)
  const designName = design.name?.toLowerCase() || '';

  // Classic Design
  if (designName === 'classic') {
    return (
      <div className={`w-full h-0 pb-[57%] relative rounded-lg overflow-hidden shadow-lg ${className}`}>
        <img 
          src="/classic-card.png" 
          alt="Classic Card Design"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  // Premium Design
  if (designName === 'premium') {
    return (
      <div className={`w-full h-0 pb-[57%] relative rounded-lg overflow-hidden shadow-xl ${className}`}>
        <img 
          src="/prem_card.png" 
          alt="Premium Card Design"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  // Metal Design
  if (designName === 'metal') {
    return (
      <div className={`w-full h-0 pb-[57%] relative rounded-lg overflow-hidden shadow-2xl ${className}`}>
        <img 
          src="/metal_card.png" 
          alt="Metal Card Design"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  // Fallback for unknown design
  return (
    <div className={`w-full h-0 pb-[57%] relative overflow-hidden shadow-lg bg-gray-200 ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <QrCode className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Design Preview</p>
          <p className="text-xs">({design.id})</p>
        </div>
      </div>
    </div>
  );
}; 