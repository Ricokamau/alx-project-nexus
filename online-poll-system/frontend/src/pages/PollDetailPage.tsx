import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPollById, votePoll, refreshPollResults, clearError } from '../store/pollSlice';
import VoteForm from '../components/poll/VoteForm';
import PollResults from '../components/poll/PollResults';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './PollDetailPage.css';

const PollDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { currentPoll, loading, error, voting } = useAppSelector((state) => state.polls);
  const [showResults, setShowResults] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (id) {
      dispatch(fetchPollById(id));
    }
    
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing it
      navigate(location.pathname, { replace: true });
    }
  }, [id, dispatch, location.state, navigate]);

  useEffect(() => {
    // Auto-hide success message after 3 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    // Check if user has already voted (simple check based on localStorage)
    if (currentPoll) {
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
      setHasVoted(votedPolls.includes(currentPoll.id));
    }
  }, [currentPoll]);

  const handleVote = async (optionId: string) => {
    if (!currentPoll) return;
    
    try {
      await dispatch(votePoll({ pollId: currentPoll.id, optionId })).unwrap();
      
      // Mark as voted in localStorage
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
      votedPolls.push(currentPoll.id);
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
      
      setHasVoted(true);
      setShowResults(true);
      setSuccessMessage('Vote submitted successfully!');
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleRefreshResults = () => {
    if (currentPoll) {
      dispatch(refreshPollResults(currentPoll.id));
    }
  };

  const handleRetry = () => {
    dispatch(clearError());
    if (id) {
      dispatch(fetchPollById(id));
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSharePoll = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: currentPoll?.question,
        text: `Vote on this poll: ${currentPoll?.question}`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setSuccessMessage('Poll link copied to clipboard!');
    }
  };

  if (loading && !currentPoll) {
    return (
      <div className="poll-detail-page">
        <div className="loading-container">
          <LoadingSpinner size="large" text="Loading poll details..." />
        </div>
      </div>
    );
  }

  if (error && !currentPoll) {
    return (
      <div className="poll-detail-page">
        <div className="container">
          <div className="error-container">
            <ErrorMessage
              message={error}
              onRetry={handleRetry}
              onClose={() => dispatch(clearError())}
            />
            <div className="error-actions">
              <button className="btn btn-primary" onClick={handleGoBack}>
                ← Go Back
              </button>
              <button className="btn btn-outline-primary" onClick={() => navigate('/')}>
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPoll) {
    return (
      <div className="poll-detail-page">
        <div className="container">
          <div className="not-found">
            <h2>Poll Not Found</h2>
            <p>The poll you're looking for doesn't exist or has been removed.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = currentPoll.expires_at && new Date(currentPoll.expires_at) < new Date();
  
  // Safe date formatting with error handling
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

  const getExpiryText = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      return formatDistanceToNow(date, { addSuffix: !isExpired });
    } catch (error) {
      return null;
    }
  };

  const timeAgo = getTimeAgo(currentPoll.created_at);
  const expiryText = currentPoll.expires_at ? getExpiryText(currentPoll.expires_at) : null;
  const canVote = currentPoll.is_active && !isExpired && !hasVoted;

  return (
    <div className="poll-detail-page">
      {/* Success Message */}
      {successMessage && (
        <div className="success-banner">
          <div className="container">
            <div className="success-content">
              <span className="success-icon">✅</span>
              <span className="success-text">{successMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <button className="btn btn-outline-primary back-btn" onClick={handleGoBack}>
              ← Back
            </button>
            
            <div className="poll-meta">
              <div className="poll-status">
                {!currentPoll.is_active ? (
                  <span className="status-badge inactive">Inactive</span>
                ) : isExpired ? (
                  <span className="status-badge expired">Expired</span>
                ) : (
                  <span className="status-badge active">Active</span>
                )}
              </div>
              
              <div className="poll-date">
                Created {timeAgo}
              </div>
              
              {currentPoll.expires_at && expiryText && (
                <div className="poll-expiry">
                  {isExpired ? 'Expired' : 'Expires'} {expiryText}
                </div>
              )}
            </div>

            <button className="btn btn-outline-primary share-btn" onClick={handleSharePoll}>
              🔗 Share
            </button>
          </div>
        </div>
      </div>

      {/* Poll Content */}
      <div className="poll-content">
        <div className="container">
          <div className="poll-header-section">
            <h1 className="poll-question">{currentPoll.question}</h1>
            {currentPoll.description && (
              <p className="poll-description">{currentPoll.description}</p>
            )}
          </div>

          <div className="content-grid">
            {/* Voting Section */}
            <div className="voting-section">
              {!showResults && canVote ? (
                <VoteForm
                  poll={currentPoll}
                  onVote={handleVote}
                  loading={voting}
                  hasVoted={hasVoted}
                />
              ) : (
                <div className="results-section">
                  <PollResults
                    poll={currentPoll}
                    showTitle={false}
                    refreshResults={handleRefreshResults}
                    isRefreshing={loading}
                  />
                  
                  {canVote && !hasVoted && (
                    <div className="vote-option">
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={() => setShowResults(false)}
                      >
                        Vote on This Poll
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Poll Info Sidebar */}
            <div className="poll-info-sidebar">
              <div className="info-card">
                <h3>Poll Information</h3>
                
                <div className="info-item">
                  <span className="info-label">Total Votes</span>
                  <span className="info-value">{currentPoll.total_votes}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Options</span>
                  <span className="info-value">{currentPoll.options.length}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className="info-value">
                    {!currentPoll.is_active ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Created</span>
                  <span className="info-value">{timeAgo}</span>
                </div>
                
                {currentPoll.expires_at && expiryText && (
                  <div className="info-item">
                    <span className="info-label">
                      {isExpired ? 'Expired' : 'Expires'}
                    </span>
                    <span className="info-value">
                      {expiryText}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="actions-card">
                <h3>Quick Actions</h3>
                
                <button className="action-btn" onClick={handleSharePoll}>
                  <span className="action-icon">🔗</span>
                  <span className="action-text">Share Poll</span>
                </button>
                
                <button className="action-btn" onClick={handleRefreshResults}>
                  <span className="action-icon">🔄</span>
                  <span className="action-text">Refresh Results</span>
                </button>
                
                <button className="action-btn" onClick={() => navigate('/create')}>
                  <span className="action-icon">➕</span>
                  <span className="action-text">Create New Poll</span>
                </button>
                
                <button className="action-btn" onClick={() => navigate('/')}>
                  <span className="action-icon">🏠</span>
                  <span className="action-text">Browse Polls</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollDetailPage;