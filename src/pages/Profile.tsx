import React from 'react';
import { motion } from 'framer-motion';
import { MobileLayout } from '../components/Layout/MobileLayout';
import { BottomNavigation } from '../components/Layout/BottomNavigation';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, LogOut, Heart, Bookmark } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Error is handled in the context
    }
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
              onClick={handleSignOut}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm w-full text-left hover:bg-red-50"
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="text-red-500" size={24} />
              <span className="text-red-600 font-medium">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </MobileLayout>
  );
};