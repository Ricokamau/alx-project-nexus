import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { createPoll, clearError } from '../store/pollSlice';
import { PollCreateData } from '../types';
import PollForm from '../components/poll/PollForm';
import ErrorMessage from '../components/common/ErrorMessage';
import './CreatePollPage.css';

const CreatePollPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { creating, error } = useAppSelector((state) => state.polls);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (pollData: PollCreateData) => {
    try {
      const result = await dispatch(createPoll(pollData)).unwrap();
      
      // Check if result has an id before navigating
      if (result && result.id) {
        navigate(`/poll/${result.id}`, { 
          state: { message: 'Poll created successfully!' }
        });
      } else {
        // If no ID, just go back to home with success message
        navigate('/', { 
          state: { message: 'Poll created successfully! Check the polls list.' }
        });
      }
    } catch (error) {
      // Error is handled by Redux, no need to do anything here
      console.error('Failed to create poll:', error);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="create-poll-page">
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <button 
              className="btn btn-outline-light back-button"
              onClick={handleGoBack}
            >
              ← Back
            </button>
            <div className="header-text">
              <h1>Create New Poll</h1>
              <p>Design your poll and start gathering opinions</p>
            </div>
            <button 
              className="btn btn-outline-light home-button"
              onClick={handleGoHome}
            >
              🏠 Home
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {/* Error Message */}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => dispatch(clearError())}
              onClose={() => dispatch(clearError())}
              type="error"
            />
          )}

          {/* Instructions Section */}
          <div className="instructions-section">
            <div className="instruction-card">
              <h3>📝 How to Create a Great Poll</h3>
              <div className="instructions-grid">
                <div className="instruction-item">
                  <div className="instruction-icon">❓</div>
                  <div className="instruction-content">
                    <h4>Clear Question</h4>
                    <p>Write a clear, concise question that's easy to understand</p>
                  </div>
                </div>
                <div className="instruction-item">
                  <div className="instruction-icon">📋</div>
                  <div className="instruction-content">
                    <h4>Multiple Options</h4>
                    <p>Provide at least 2 options, up to 10 different choices</p>
                  </div>
                </div>
                <div className="instruction-item">
                  <div className="instruction-icon">⏰</div>
                  <div className="instruction-content">
                    <h4>Set Duration</h4>
                    <p>Optionally set an expiry date for time-sensitive polls</p>
                  </div>
                </div>
                <div className="instruction-item">
                  <div className="instruction-icon">🎯</div>
                  <div className="instruction-content">
                    <h4>Be Specific</h4>
                    <p>Add context in the description to help voters understand</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Poll Form */}
          <div className="form-section">
            <PollForm onSubmit={handleSubmit} loading={creating} />
          </div>

          {/* Tips Section */}
          <div className="tips-section">
            <div className="tips-card">
              <h3>💡 Pro Tips</h3>
              <ul className="tips-list">
                <li>
                  <strong>Keep it simple:</strong> Avoid complex jargon or technical terms
                </li>
                <li>
                  <strong>Be neutral:</strong> Don't bias voters with leading questions
                </li>
                <li>
                  <strong>Cover all options:</strong> Include an "Other" option if needed
                </li>
                <li>
                  <strong>Test your poll:</strong> Make sure the question makes sense to others
                </li>
                <li>
                  <strong>Share wisely:</strong> Consider your target audience when sharing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePollPage;