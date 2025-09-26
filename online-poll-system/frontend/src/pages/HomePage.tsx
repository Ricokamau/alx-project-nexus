import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPolls, clearError } from '../store/pollSlice';
import PollCard from '../components/poll/PollCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { polls, loading, error } = useAppSelector((state) => state.polls);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    dispatch(fetchPolls());
    
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing it
      navigate(location.pathname, { replace: true });
    }
  }, [dispatch, location.state, navigate, location.pathname]);

  useEffect(() => {
    // Auto-hide success message after 3 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(fetchPolls());
  };

  const handlePollClick = (pollId: string) => {
    navigate(`/poll/${pollId}`);
  };

  const handleCreatePoll = () => {
    navigate('/create');
  };

  // Filter polls based on search term and status
  const filteredPolls = Array.isArray(polls) ? polls.filter(poll => {
    const matchesSearch = poll.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poll.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const now = new Date();
    const isExpired = poll.expires_at && new Date(poll.expires_at) < now;
    
    switch (filterStatus) {
      case 'active':
        return poll.is_active && !isExpired;
      case 'expired':
        return !poll.is_active || isExpired;
      default:
        return true;
    }
  }) : [];

  const activePollsCount = Array.isArray(polls) ? polls.filter(poll => {
    const now = new Date();
    const isExpired = poll.expires_at && new Date(poll.expires_at) < now;
    return poll.is_active && !isExpired;
  }).length : 0;

  const totalVotes = Array.isArray(polls) ? polls.reduce((sum, poll) => sum + poll.total_votes, 0) : 0;

  return (
    <div className="home-page">
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

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to PollSupaa</h1>
          <p>Create, share, and participate in polls to gather opinions and make decisions together.</p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{Array.isArray(polls) ? polls.length : 0}</span>
              <span className="stat-label">Total Polls</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{activePollsCount}</span>
              <span className="stat-label">Active Polls</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{totalVotes}</span>
              <span className="stat-label">Total Votes</span>
            </div>
          </div>
          <button 
            className="btn btn-primary btn-lg cta-button"
            onClick={handleCreatePoll}
          >
            Create Your First Poll
          </button>
        </div>
      </div>

      {/* Polls Section */}
      <div className="polls-section">
        <div className="container">
          <div className="section-header">
            <h2>All Polls</h2>
            <p>Explore and participate in community polls</p>
          </div>

          {/* Search and Filter Controls */}
          <div className="controls-section">
            <div className="search-bar">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search polls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="search-icon">🔍</div>
            </div>

            <div className="filter-tabs">
              <button
                className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All ({Array.isArray(polls) ? polls.length : 0})
              </button>
              <button
                className={`filter-tab ${filterStatus === 'active' ? 'active' : ''}`}
                onClick={() => setFilterStatus('active')}
              >
                Active ({activePollsCount})
              </button>
              <button
                className={`filter-tab ${filterStatus === 'expired' ? 'active' : ''}`}
                onClick={() => setFilterStatus('expired')}
              >
                Expired ({Array.isArray(polls) ? polls.length - activePollsCount : 0})
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={handleRetry}
              onClose={() => dispatch(clearError())}
            />
          )}

          {/* Loading State */}
          {loading && (!Array.isArray(polls) || polls.length === 0) && (
            <div className="loading-container">
              <LoadingSpinner size="large" text="Loading polls..." />
            </div>
          )}

          {/* Empty State */}
          {!loading && (!Array.isArray(polls) || polls.length === 0) && !error && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No polls yet</h3>
              <p>Be the first to create a poll and start gathering opinions!</p>
              <button 
                className="btn btn-primary"
                onClick={handleCreatePoll}
              >
                Create First Poll
              </button>
            </div>
          )}

          {/* No Search Results */}
          {!loading && Array.isArray(polls) && polls.length > 0 && filteredPolls.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No polls found</h3>
              <p>Try adjusting your search terms or filters.</p>
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Polls Grid */}
          {!loading && filteredPolls.length > 0 && (
            <>
              <div className="polls-grid">
                {filteredPolls.map((poll) => (
                  <PollCard
                    key={poll.id}
                    poll={poll}
                    onClick={() => handlePollClick(poll.id)}
                  />
                ))}
              </div>

              {/* Load More Button (for future pagination) */}
              {filteredPolls.length >= 20 && (
                <div className="load-more-section">
                  <button className="btn btn-outline-primary">
                    Load More Polls
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        className="fab"
        onClick={handleCreatePoll}
        title="Create New Poll"
      >
        +
      </button>
    </div>
  );
};

export default HomePage;