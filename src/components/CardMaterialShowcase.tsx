import React from 'react';

interface CardMaterialShowcaseProps {
  material: {
    id: string;
    name: string;
  };
  isSelected: boolean;
  onClick: () => void;
}

export const CardMaterialShowcase: React.FC<CardMaterialShowcaseProps> = ({
  material,
  isSelected,
  onClick
}) => {
  const getTextureStyle = () => {
    switch (material.id) {
      case 'plastic':
        return {
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          className: 'border-gray-200'
        };

      case 'metal':
        return {
          background: `
            linear-gradient(135deg, #6b7280 0%, #374151 100%),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.1) 2px,
              rgba(255,255,255,0.1) 4px
            )
          `,
          className: 'border-gray-400'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          className: 'border-gray-200'
        };
    }
  };

  const textureStyle = getTextureStyle();

  return (
    <div
      className={`
        relative w-full h-16 rounded-lg cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg' : 'hover:shadow-md'}
        ${textureStyle.className} border-2
      `}
      style={{ background: textureStyle.background }}
      onClick={onClick}
    >
      {/* Material-specific effects */}
      {material.id === 'metal' && (
        <>
          {/* Metal shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 opacity-50 animate-pulse" />
          
          {/* Metal reflection */}
          <div className="absolute top-1 left-2 right-2 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
        </>
      )}
      

      
      {material.id === 'plastic' && (
        <>
          {/* Plastic glossy effect */}
          <div className="absolute top-1 left-2 right-2 h-2 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
        </>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
      )}
    </div>
  );
}; 