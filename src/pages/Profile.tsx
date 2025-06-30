import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileLayout } from '../components/Layout/MobileLayout';
import { BottomNavigation } from '../components/Layout/BottomNavigation';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, LogOut, Heart, Bookmark, AlertTriangle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (error) {
      // Error is handled in the context
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleCancelSignOut = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <MobileLayout>
      <div className="h-screen pb-20">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 font-inter mb-6">Profile</h1>
          
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User size={32} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {user?.user_metadata?.full_name || 'User'}
                </h2>
                <p className="text-gray-600">@{user?.user_metadata?.username || 'username'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-800">12</div>
                <div className="text-sm text-gray-600">Quotes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">156</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">89</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            <motion.div
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm"
              whileTap={{ scale: 0.98 }}
            >
              <Heart className="text-red-500" size={24} />
              <span className="text-gray-800 font-medium">Liked Quotes</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm"
              whileTap={{ scale: 0.98 }}
            >
              <Bookmark className="text-primary" size={24} />
              <span className="text-gray-800 font-medium">Saved Quotes</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm"
              whileTap={{ scale: 0.98 }}
            >
              <Settings className="text-gray-500" size={24} />
              <span className="text-gray-800 font-medium">Settings</span>
            </motion.div>

            <motion.button
              onClick={handleSignOutClick}
              disabled={isLoggingOut}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm w-full text-left hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="text-red-500" size={24} />
              <span className="text-red-600 font-medium">
                {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={!isLoggingOut ? handleCancelSignOut : undefined}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Sign Out Confirmation
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Are you sure you want to sign out? You'll need to sign in again to access your saved quotes and interactions.
                </p>
                
                <div className="flex gap-3">
                  <motion.button
                    onClick={handleCancelSignOut}
                    disabled={isLoggingOut}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    onClick={handleConfirmSignOut}
                    disabled={isLoggingOut}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Signing Out...
                      </>
                    ) : (
                      'Sign Out'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNavigation />
    </MobileLayout>
  );
};