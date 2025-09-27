import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { wakeUpBackend, checkBackendHealth } from './services/api';

// Import your page components (adjust paths as needed)
import HomePage from './pages/HomePage';
import CreatePollPage from './pages/CreatePollPage';
import PollDetailPage from './pages/PollDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Import common components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

import './App.css';

function App() {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(true);

  useEffect(() => {
    const initializeBackend = async () => {
      try {
        console.log('🔄 Initializing connection to backend...');
        
        // First, try to wake up the backend
        await wakeUpBackend();
        
        // Wait a moment for the backend to fully start
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if backend is responding
        const isHealthy = await checkBackendHealth();
        
        if (isHealthy) {
          console.log('✅ Backend is ready');
          setIsBackendReady(true);
        } else {
          console.log('⏳ Backend still starting, will retry...');
          // Retry after a longer delay
          setTimeout(async () => {
            const retryCheck = await checkBackendHealth();
            setIsBackendReady(retryCheck);
            setIsWakingUp(false);
          }, 5000);
        }
      } catch (error) {
        console.error('❌ Error initializing backend:', error);
        setIsBackendReady(false);
      } finally {
        setIsWakingUp(false);
      }
    };

    // Only run wake-up in production (when API URL is not localhost)
    const apiUrl = process.env.REACT_APP_API_URL || '';
    if (apiUrl.includes('onrender.com') || apiUrl.includes('railway.app')) {
      initializeBackend();
    } else {
      // For local development, skip wake-up
      setIsBackendReady(true);
      setIsWakingUp(false);
    }
  }, []);

  // Show loading screen while backend is waking up
  if (isWakingUp) {
    return (
      <div className="app-loading">
        <div className="loading-container">
          <LoadingSpinner />
          <h2>Starting Poll System...</h2>
          <p>Please wait while we connect to the server.</p>
          <p className="loading-note">
            This may take up to 30 seconds on first load.
          </p>
        </div>
      </div>
    );
  }

  // Show error if backend is not ready
  if (!isBackendReady) {
    return (
      <div className="app-error">
        <div className="error-container">
          <h2>Connection Error</h2>
          <p>Unable to connect to the poll system server.</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreatePollPage />} />
              <Route path="/poll/:id" element={<PollDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;