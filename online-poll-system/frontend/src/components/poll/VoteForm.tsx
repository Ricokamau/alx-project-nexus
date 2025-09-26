import React, { useState } from 'react';
import { Poll } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import './VoteForm.css';

interface VoteFormProps {
  poll: Poll;
  onVote: (optionId: string) => void;
  loading: boolean;
  hasVoted?: boolean;
}

const VoteForm: React.FC<VoteFormProps> = ({ 
  poll, 
  onVote, 
  loading, 
  hasVoted = false 
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showResults, setShowResults] = useState(hasVoted);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption && !loading) {
      onVote(selectedOption);
      setShowResults(true);
    }
  };

  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();
  const canVote = poll.is_active && !isExpired && !hasVoted && !loading;

  if (showResults || hasVoted || isExpired || !poll.is_active) {
    return (
      <div className="vote-results">
        <div className="results-header">
          <h4>Poll Results</h4>
          {!showResults && !hasVoted && (
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => setShowResults(false)}
            >
              Vote Now
            </button>
          )}
        </div>
        
        <div className="results-list">
          {poll.options.map((option) => {
            const percentage = poll.total_votes > 0 
              ? ((option.vote_count / poll.total_votes) * 100).toFixed(1)
              : '0';
            
            return (
              <div key={option.id} className="result-item">
                <div className="result-header">
                  <span className="option-text">{option.text}</span>
                  <span className="vote-stats">
                    {option.vote_count} votes ({percentage}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="total-votes">
          Total votes: <strong>{poll.total_votes}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="vote-form">
      <div className="vote-header">
        <h4>Cast Your Vote</h4>
        <p className="vote-instruction">
          Choose one option below to cast your vote:
        </p>
      </div>

      {loading ? (
        <div className="voting-loader">
          <LoadingSpinner size="medium" text="Submitting your vote..." />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="vote-options-form">
          <div className="options-list">
            {poll.options.map((option) => (
              <label key={option.id} className="option-item">
                <input
                  type="radio"
                  name="pollOption"
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  disabled={!canVote}
                />
                <span className="option-radio"></span>
                <span className="option-label">{option.text}</span>
              </label>
            ))}
          </div>

          <div className="vote-actions">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={!selectedOption || !canVote}
            >
              {!canVote ? 'Voting Disabled' : 'Submit Vote'}
            </button>
            
            {poll.total_votes > 0 && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowResults(true)}
              >
                View Results
              </button>
            )}
          </div>
        </form>
      )}

      {!poll.is_active && (
        <div className="vote-status-message inactive">
          This poll is currently inactive
        </div>
      )}

      {isExpired && (
        <div className="vote-status-message expired">
          This poll has expired
        </div>
      )}
    </div>
  );
};

export default VoteForm;