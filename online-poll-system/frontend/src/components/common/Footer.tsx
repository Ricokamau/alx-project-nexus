import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          {/* Footer Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">📊</span>
              <span className="logo-text">PollSupaa</span>
            </div>
            <p className="footer-description">
              Create, share, and participate in polls to gather opinions and make decisions together.
            </p>
            <div className="footer-stats">
              <div className="stat-item">
                <span className="stat-icon">🗳️</span>
                <span className="stat-text">Real-time Voting</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📈</span>
                <span className="stat-text">Live Results</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🎯</span>
                <span className="stat-text">Easy to Use</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">
                  <span className="link-icon">🏠</span>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/create" className="footer-link">
                  <span className="link-icon">➕</span>
                  <span>Create Poll</span>
                </Link>
              </li>
              <li>
                <a href="#features" className="footer-link">
                  <span className="link-icon">✨</span>
                  <span>Features</span>
                </a>
              </li>
              <li>
                <a href="#about" className="footer-link">
                  <span className="link-icon">ℹ️</span>
                  <span>About</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-section">
            <h4 className="footer-title">Resources</h4>
            <ul className="footer-links">
              <li>
                <a href="#help" className="footer-link">
                  <span className="link-icon">❓</span>
                  <span>Help Center</span>
                </a>
              </li>
              <li>
                <a href="#api" className="footer-link">
                  <span className="link-icon">🔌</span>
                  <span>API Docs</span>
                </a>
              </li>
              <li>
                <a href="#privacy" className="footer-link">
                  <span className="link-icon">🔒</span>
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="#terms" className="footer-link">
                  <span className="link-icon">📜</span>
                  <span>Terms of Service</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="footer-section">
            <h4 className="footer-title">Connect</h4>
            <div className="social-links">
              <a href="#github" className="social-link" title="GitHub">
                <span className="social-icon">🐙</span>
              </a>
              <a href="#twitter" className="social-link" title="Twitter">
                <span className="social-icon">🐦</span>
              </a>
              <a href="#linkedin" className="social-link" title="LinkedIn">
                <span className="social-icon">💼</span>
              </a>
              <a href="#email" className="social-link" title="Email">
                <span className="social-icon">📧</span>
              </a>
            </div>
            <div className="contact-info">
              <p>
                <span className="contact-icon">📍</span>
                <span>Nairobi, Kenya</span>
              </p>
              <p>
                <span className="contact-icon">📧</span>
                <span>hello@pollsupaa.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} PollSupaa.
            </p>
            <div className="footer-badges">
              <span className="badge">Open Source</span>
              <span className="badge">Privacy First</span>
              <span className="badge">Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;