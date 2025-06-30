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
import { analytics } from './utils/analytics';

function App() {
  useEffect(() => {
    // Initialize analytics
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
      analytics.init(import.meta.env.VITE_GA_MEASUREMENT_ID);
    }

    // Track performance metrics
    analytics.trackPerformance();

    // Track initial page load
    analytics.trackPageView(window.location.pathname);
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
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;