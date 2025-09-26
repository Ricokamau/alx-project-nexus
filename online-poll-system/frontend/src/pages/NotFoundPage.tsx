import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const stopCountdown = () => {
    setCountdown(0);
  };

  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          {/* 404 Animation */}
          <div className="error-animation">
            <div className="error-number">
              <span className="digit">4</span>
              <span className="digit poll-icon">📊</span>
              <span className="digit">4</span>
            </div>
            <div className="error-text">Page Not Found</div>
          </div>

          {/* Error Message */}
          <div className="error-message">
            <h1>Oops! This page doesn't exist</h1>
            <p>
              The page you're looking for might have been moved, deleted, or you entered the wrong URL. 
              Don't worry, it happens to the best of us!
            </p>
          </div>

          {/* Suggestions */}
          <div className="suggestions">
            <h3>Here's what you can do:</h3>
            <div className="suggestion-grid">
              <div className="suggestion-item">
                <div className="suggestion-icon">🏠</div>
                <div className="suggestion-content">
                  <h4>Go Home</h4>
                  <p>Return to our homepage and explore available polls</p>
                </div>
              </div>
              <div className="suggestion-item">
                <div className="suggestion-icon">🔍</div>
                <div className="suggestion-content">
                  <h4>Search Polls</h4>
                  <p>Use our search feature to find specific polls</p>
                </div>
              </div>
              <div className="suggestion-item">
                <div className="suggestion-icon">➕</div>
                <div className="suggestion-content">
                  <h4>Create Poll</h4>
                  <p>Start fresh by creating your own poll</p>
                </div>
              </div>
              <div className="suggestion-item">
                <div className="suggestion-icon">👥</div>
                <div className="suggestion-content">
                  <h4>Browse Community</h4>
                  <p>Check out what others are polling about</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="error-actions">
            <button 
              className="btn btn-primary btn-lg"
              onClick={handleGoHome}
            >
              🏠 Take Me Home
            </button>
            <button 
              className="btn btn-outline-primary btn-lg"
              onClick={handleGoBack}
            >
              ← Go Back
            </button>
            <Link 
              to="/create" 
              className="btn btn-outline-secondary btn-lg"
            >
              ➕ Create Poll
            </Link>
          </div>

          {/* Auto Redirect */}
          {countdown > 0 && (
            <div className="auto-redirect">
              <div className="redirect-message">
                <span className="redirect-icon">⏰</span>
                <span>
                  Automatically redirecting to homepage in <strong>{countdown}</strong> seconds...
                </span>
              </div>
              <button 
                className="btn btn-sm btn-outline-primary stop-countdown"
                onClick={stopCountdown}
              >
                Stay Here
              </button>
            </div>
          )}

          {/* Fun Facts */}
          <div className="fun-facts">
            <h4>📊 Did you know?</h4>
            <div className="facts-carousel">
              <div className="fact-item active">
                <p>The first opinion poll was conducted in 1824 during the US presidential election!</p>
              </div>
            </div>
          </div>

          {/* Popular Polls Preview */}
          <div className="popular-polls-preview">
            <h4>🔥 Popular Polls Right Now</h4>
            <div className="polls-preview-grid">
              <div className="poll-preview-item">
                <div className="poll-preview-icon">🍕</div>
                <div className="poll-preview-content">
                  <h5>Best Pizza Topping</h5>
                  <span className="poll-preview-votes">1,234 votes</span>
                </div>
              </div>
              <div className="poll-preview-item">
                <div className="poll-preview-icon">🎮</div>
                <div className="poll-preview-content">
                  <h5>Favorite Gaming Platform</h5>
                  <span className="poll-preview-votes">987 votes</span>
                </div>
              </div>
              <div className="poll-preview-item">
                <div className="poll-preview-icon">☕</div>
                <div className="poll-preview-content">
                  <h5>Coffee vs Tea</h5>
                  <span className="poll-preview-votes">2,156 votes</span>
                </div>
              </div>
            </div>
            <Link to="/" className="view-all-polls">
              View All Polls →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;