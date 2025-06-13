import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  className, 
  size = 'md', 
  text 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-8',
    md: 'w-24 h-12',
    lg: 'w-32 h-16'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 300 150" 
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <path 
            fill="none" 
            stroke="url(#loadingGradient)" 
            strokeWidth="15" 
            strokeLinecap="round" 
            strokeDasharray="300 385" 
            strokeDashoffset="0" 
            d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"
          >
            <animate 
              attributeName="stroke-dashoffset" 
              calcMode="spline" 
              dur="2" 
              values="685;-685" 
              keySplines="0 0 1 1" 
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading; 