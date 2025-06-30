import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode: initialMode, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const { signIn, signUp } = useAuth();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus password field after transition to login
  useEffect(() => {
    if (mode === 'login' && registeredEmail && !isTransitioning && passwordInputRef.current) {
      const timer = setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mode, registeredEmail, isTransitioning]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setFullName('');
    setShowPassword(false);
    setError('');
    setShowSuccessMessage(false);
    setRegisteredEmail('');
    setIsTransitioning(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSuccessfulSignup = async (userEmail: string) => {
    try {
      // Show success message
      setShowSuccessMessage(true);
      setRegisteredEmail(userEmail);
      
      // Wait for success message to be visible
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Start transition
      setIsTransitioning(true);
      setShowSuccessMessage(false);
      
      // Clear form fields
      setPassword('');
      setUsername('');
      setFullName('');
      setShowPassword(false);
      setError('');
      
      // Wait for transition animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Switch to login mode
      setMode('login');
      setEmail(userEmail); // Pre-populate email
      
      // End transition
      setIsTransitioning(false);
      
    } catch (error) {
      console.error('Transition error:', error);
      setIsTransitioning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isTransitioning) return;

    setError('');

    // Basic validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (mode === 'signup') {
      if (!username.trim()) {
        setError('Username is required');
        return;
      }
      if (!fullName.trim()) {
        setError('Full name is required');
        return;
      }
    }

    try {
      setLoading(true);
      
      if (mode === 'login') {
        await signIn(email.trim(), password);
        handleClose();
        onSuccess?.();
      } else {
        await signUp(email.trim(), password, {
          username: username.trim(),
          full_name: fullName.trim(),
        });
        
        // Handle successful signup with transition
        await handleSuccessfulSignup(email.trim());
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    if (isTransitioning || loading) return;
    
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setShowSuccessMessage(false);
    
    // Clear form when manually switching
    if (!registeredEmail) {
      setEmail('');
      setPassword('');
      setUsername('');
      setFullName('');
    }
  };

  const getFormTitle = () => {
    if (showSuccessMessage) return 'Account Created!';
    if (isTransitioning) return 'Preparing Sign In...';
    if (mode === 'login' && registeredEmail) return 'Welcome! Please Sign In';
    return mode === 'login' ? 'Welcome Back' : 'Join Pekikkan';
  };

  const getFormSubtitle = () => {
    if (showSuccessMessage) return 'Your account has been created successfully';
    if (isTransitioning) return 'Setting up your sign in...';
    if (mode === 'login' && registeredEmail) return 'Enter your password to continue';
    return mode === 'login' 
      ? 'Sign in to save and interact with quotes' 
      : 'Create your account to get started';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={!isTransitioning && !loading ? handleClose : undefined}
          />
          
          {/* Modal Container with responsive sizing */}
          <div className="relative w-full h-full flex items-center justify-center p-4 min-[480px]:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[90%] min-[480px]:max-w-[400px] max-h-[calc(100vh-32px)] min-[480px]:max-h-[calc(100vh-48px)] bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-full">
                <div className="p-6 min-[480px]:p-8">
                  {/* Close Button */}
                  <button
                    onClick={handleClose}
                    disabled={isTransitioning || loading}
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>

                  {/* Header */}
                  <div className="text-center mb-6 pr-8">
                    <motion.h2 
                      key={`${mode}-${showSuccessMessage}-${isTransitioning}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-bold text-gray-800 font-inter mb-2"
                    >
                      {getFormTitle()}
                    </motion.h2>
                    <motion.p 
                      key={`subtitle-${mode}-${showSuccessMessage}-${isTransitioning}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-600 text-sm min-[480px]:text-base"
                    >
                      {getFormSubtitle()}
                    </motion.p>
                  </div>

                  {/* Success Message */}
                  <AnimatePresence>
                    {showSuccessMessage && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
                      >
                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-green-700 font-medium text-sm">Registration Successful!</p>
                          <p className="text-green-600 text-xs mt-1">
                            Redirecting you to sign in...
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Transition Loading */}
                  <AnimatePresence>
                    {isTransitioning && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3"
                      >
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <p className="text-blue-700 text-sm">Preparing your sign in form...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && !showSuccessMessage && !isTransitioning && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                      >
                        <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-red-700 text-sm leading-relaxed">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form */}
                  <AnimatePresence mode="wait">
                    {!showSuccessMessage && (
                      <motion.form
                        key={mode}
                        initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                      >
                        {mode === 'signup' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                              </label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                  type="text"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm min-[480px]:text-base"
                                  placeholder="Enter your full name"
                                  required
                                  disabled={loading || isTransitioning}
                                  aria-describedby="fullname-help"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                              </label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                  type="text"
                                  value={username}
                                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm min-[480px]:text-base"
                                  placeholder="Enter your username"
                                  required
                                  disabled={loading || isTransitioning}
                                  aria-describedby="username-help"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm min-[480px]:text-base"
                              placeholder="Enter your email"
                              required
                              disabled={loading || isTransitioning || (mode === 'login' && !!registeredEmail)}
                              aria-describedby="email-help"
                            />
                          </div>
                          {mode === 'login' && registeredEmail && (
                            <p className="text-xs text-gray-500 mt-1">
                              Using your registered email address
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              ref={passwordInputRef}
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm min-[480px]:text-base"
                              placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
                              required
                              disabled={loading || isTransitioning}
                              minLength={6}
                              aria-describedby="password-help"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded"
                              disabled={loading || isTransitioning}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        <motion.button
                          type="submit"
                          disabled={loading || isTransitioning}
                          className="w-full bg-primary text-white py-2.5 min-[480px]:py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm min-[480px]:text-base"
                          whileTap={{ scale: 0.98 }}
                        >
                          {loading 
                            ? (mode === 'login' ? 'Signing In...' : 'Creating Account...') 
                            : (mode === 'login' ? 'Sign In' : 'Create Account')
                          }
                        </motion.button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Switch Mode */}
                  {!showSuccessMessage && !isTransitioning && !registeredEmail && (
                    <div className="mt-6 text-center">
                      <p className="text-gray-600 text-sm">
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                          onClick={switchMode}
                          className="text-primary font-medium hover:underline"
                          disabled={loading}
                        >
                          {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                      </p>
                    </div>
                  )}

                  {/* Back to Sign Up Option */}
                  {mode === 'login' && registeredEmail && !isTransitioning && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => {
                          setMode('signup');
                          setRegisteredEmail('');
                          setEmail('');
                          setPassword('');
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                        disabled={loading}
                      >
                        Back to sign up
                      </button>
                    </div>
                  )}

                  {/* Signup Note */}
                  {mode === 'signup' && !showSuccessMessage && !isTransitioning && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-700 text-xs min-[480px]:text-sm">
                        <strong>Note:</strong> You'll receive a confirmation email after signing up. Please check your email and click the confirmation link.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};