import React from 'react';
import { ClipLoader, BeatLoader, RingLoader } from 'react-spinners';

interface LoadingSpinnerProps {
  type?: 'clip' | 'beat' | 'ring' | 'default';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  type = 'default',
  size = 'medium', 
  color = '#3b82f6',
  className = ''
}: LoadingSpinnerProps) {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 48;
      default:
        return 24;
    }
  };

  // Return different spinner types
  switch (type) {
    case 'clip':
      return <ClipLoader size={getSize()} color={color} />;
    case 'beat':
      return <BeatLoader size={getSize() / 2} color={color} />;
    case 'ring':
      return <RingLoader size={getSize() * 2} color={color} />;
    default:
      return (
        <div 
          className={`loading-spinner ${className}`}
          style={{
            width: `${getSize()}px`,
            height: `${getSize()}px`,
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
} 