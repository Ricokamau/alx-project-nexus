import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onClose?: () => void;
  type?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onClose,
  type = 'error'
}) => {
  return (
    <div className={`error-message alert alert-${type}`}>
      <div className="error-content">
        <div className="error-icon">
          {type === 'error' && '⚠️'}
          {type === 'warning' && '⚠️'}
          {type === 'info' && 'ℹ️'}
        </div>
        <div className="error-text">
          <p>{message}</p>
        </div>
      </div>
      
      <div className="error-actions">
        {onRetry && (
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
        {onClose && (
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;