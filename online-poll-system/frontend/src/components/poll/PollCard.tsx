import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Poll } from '../../types';
import './PollCard.css';

interface PollCardProps {
  poll: Poll;
  onClick: () => void;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onClick }) => {
  // Add safety check for poll object
  if (!poll) {
    return (
      <div className="poll-card">
        <div className="card-body">
          <p>Error loading poll data</p>
        </div>
      </div>
    );
  }

  // Safely parse the date with error handling
  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  const getExpiryTime = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      return formatDistanceToNow(date, { addSuffix: false });
    } catch (error) {
      return null;
    }
  };

  const timeAgo = getTimeAgo(poll.created_at || '');
  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();
  const expiryTime = poll.expires_at ? getExpiryTime(poll.expires_at) : null;
  
  // Ensure options is always an array
  const options = Array.isArray(poll.options) ? poll.options : [];
  const totalVotes = poll.total_votes || 0;

  return (
    <div 
      className={`poll-card card ${!poll.is_active || isExpired ? 'poll-inactive' : ''}`}
      onClick={onClick}
    >
      <div className="card-body">
        <div className="poll-header">
          <h3 className="card-title">{poll.question}</h3>
          <div className="poll-status">
            {!poll.is_active ? (
              <span className="status-badge status-inactive">Inactive</span>
            ) : isExpired ? (
              <span className="status-badge status-expired">Expired</span>
            ) : (
              <span className="status-badge status-active">Active</span>
            )}
          </div>
        </div>

        {poll.description && (
          <p className="card-text poll-description">{poll.description}</p>
        )}

        <div className="poll-options-preview">
          <span className="options-count">
            {options.length} option{options.length !== 1 ? 's' : ''}
          </span>
          <div className="options-list">
            {options.slice(0, 3).map((option, index) => (
              <span key={option.id || index} className="option-preview">
                {option.text || 'Option'}
                {index < Math.min(options.length - 1, 2) && ', '}
              </span>
            ))}
            {options.length > 3 && (
              <span className="more-options">
                ... +{options.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="poll-stats">
          <div className="stat-item">
            <span className="stat-value">{totalVotes}</span>
            <span className="stat-label">
              vote{totalVotes !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{timeAgo}</span>
            <span className="stat-label">created</span>
          </div>
          {poll.expires_at && expiryTime && (
            <div className="stat-item">
              <span className="stat-value">
                {isExpired ? 'Expired' : 'Expires'}
              </span>
              <span className="stat-label">
                {expiryTime}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="poll-card-footer">
        <button className="btn btn-primary btn-sm">
          {totalVotes > 0 ? 'View Results' : 'Vote Now'}
        </button>
      </div>
    </div>
  );
};

export default PollCard;