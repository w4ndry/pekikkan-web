import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Post } from './pages/Post';
import { Profile } from './pages/Profile';
import { SitemapGenerator } from './components/SEO/SitemapGenerator';
import { BoltBadge } from './components/Layout/BoltBadge';
import { analytics } from './utils/analytics';

function App() {
  useEffect(() => {
    // Initialize analytics with your measurement ID
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-LYC8GQ1NZK';
    analytics.init(measurementId);

    // Track performance metrics
    analytics.trackPerformance();

    // Track initial page load
    analytics.trackPageView(window.location.pathname, 'Pekikkan - Inspire the world through words');

    // Track user journey start
    analytics.trackUserJourney('app_start', {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`
    });

    // Track session start
    analytics.trackEvent({
      action: 'session_start',
      category: 'User Engagement',
      label: 'App Launch'
    });

  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route
                path="/post"
                element={
                  <ProtectedRoute>
                    <Post />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            <SitemapGenerator />
            <BoltBadge />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;