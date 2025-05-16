
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Card3DProps {
  className?: string;
}

const Card3D: React.FC<Card3DProps> = ({ className = "" }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      ref={cardRef}
      className={`relative w-64 h-40 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="w-full h-full rounded-xl bg-gradient-to-br from-scan-blue via-scan-indigo to-scan-purple shadow-lg overflow-hidden"
        animate={{ 
          rotateX: rotate.x, 
          rotateY: rotate.y,
          boxShadow: isHovered 
            ? '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 20px rgba(30, 174, 219, 0.4)' 
            : '0 10px 20px rgba(0, 0, 0, 0.1), 0 0 10px rgba(30, 174, 219, 0.2)'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(farthest-corner_at_top_right,rgba(255,255,255,0.4),transparent_70%)]" />
        
        {/* Card Content */}
        <div className="relative p-6 flex flex-col h-full">
          {/* QR Code */}
          <div className="w-16 h-16 bg-white rounded-lg mb-3 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-12 h-12 text-scan-blue">
              <rect x="10" y="10" width="30" height="30" fill="currentColor" />
              <rect x="60" y="10" width="30" height="30" fill="currentColor" />
              <rect x="10" y="60" width="30" height="30" fill="currentColor" />
              <rect x="60" y="60" width="10" height="10" fill="currentColor" />
              <rect x="80" y="60" width="10" height="10" fill="currentColor" />
              <rect x="60" y="80" width="10" height="10" fill="currentColor" />
              <rect x="80" y="80" width="10" height="10" fill="currentColor" />
            </svg>
          </div>
          
          <div className="text-white mt-auto">
            <p className="text-sm font-medium opacity-80">Jane Smith</p>
            <h3 className="text-base font-bold">Marketing Director</h3>
          </div>
          
          {/* Dots */}
          <div className="absolute bottom-5 right-5 flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-blue-300"></div>
            <div className="w-2 h-2 rounded-full bg-indigo-300"></div>
            <div className="w-2 h-2 rounded-full bg-purple-300"></div>
          </div>
        </div>
      </motion.div>
      
      {/* Reflection effect */}
      <div 
        className="absolute w-full h-20 bottom-[-20px] left-0"
        style={{ 
          backgroundImage: 'linear-gradient(to bottom, rgba(30, 174, 219, 0.2), transparent)',
          transform: 'rotateX(180deg) translateY(20px)',
          opacity: 0.4,
          filter: 'blur(4px)',
        }}
      ></div>
    </div>
  );
};

export default Card3D;
