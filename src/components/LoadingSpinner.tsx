import React from 'react';
import { ClipLoader, BeatLoader, RingLoader } from 'react-spinners';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = '#3b82f6',
  className = ''
}: LoadingSpinnerProps) {
  const getSize = () => {
    switch (size) {
      case 'small':
        return '16px';
      case 'large':
        return '48px';
      default:
        return '24px';
    }
  };

  return (
    <div 
      className={`loading-spinner ${className}`}
      style={{
        width: getSize(),
        height: getSize(),
        borderColor: color,
        borderRightColor: 'transparent'
      }}
    >
      <style jsx>{`
        .loading-spinner {
          border: 2px solid;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 