import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'currentColor',
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  };

  return (
    <div className={`spinner ${getSizeClasses()} ${className}`}>
      <div 
        className="spinner-inner"
        style={{ 
          borderColor: `${color}33`,
          borderTopColor: color 
        }}
      />
    </div>
  );
};

export default LoadingSpinner;