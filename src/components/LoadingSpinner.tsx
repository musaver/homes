import React from 'react';
import { ClipLoader, BeatLoader, RingLoader } from 'react-spinners';

interface LoadingSpinnerProps {
  size?: number | 'small' | 'medium' | 'large';
  color?: string;
  type?: 'clip' | 'beat' | 'ring';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#2563eb', 
  type = 'clip',
  className = '' 
}) => {
  // Convert size names to pixel values
  let spinnerSize: number;
  if (typeof size === 'string') {
    switch (size) {
      case 'small': spinnerSize = 20; break;
      case 'medium': spinnerSize = 35; break;
      case 'large': spinnerSize = 50; break;
      default: spinnerSize = 35;
    }
  } else {
    spinnerSize = size;
  }

  const renderSpinner = () => {
    switch (type) {
      case 'beat':
        return <BeatLoader color={color} size={spinnerSize * 0.6} />;
      case 'ring':
        return <RingLoader color={color} size={spinnerSize} />;
      case 'clip':
      default:
        return <ClipLoader color={color} size={spinnerSize} />;
    }
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {renderSpinner()}
    </div>
  );
};

export default LoadingSpinner; 