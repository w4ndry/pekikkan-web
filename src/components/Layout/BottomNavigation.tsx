import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../Auth/AuthModal';

export const BottomNavigation: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = (to: string, requiresAuth: boolean = false) => {
    if (requiresAuth && !user) {
      setPendingRoute(to);
      setShowAuthModal(true);
      return;
    }
    navigate(to);
  };

  const handleAuthSuccess = () => {
    if (pendingRoute) {
      navigate(pendingRoute);
      setPendingRoute(null);
    }
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Home', requiresAuth: false },
    { to: '/explore', icon: Search, label: 'Explore', requiresAuth: false },
    { to: '/post', icon: Plus, label: 'Post', requiresAuth: true },
    { to: '/profile', icon: User, label: 'Profile', requiresAuth: true },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-mobile bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex justify-around items-center">
          {navItems.map(({ to, icon: Icon, label, requiresAuth }) => (
            <button
              key={to}
              onClick={() => handleNavClick(to, requiresAuth)}
              className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors text-gray-500 hover:text-primary hover:bg-primary/5"
            >
              <Icon size={24} />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingRoute(null);
        }}
        mode="login"
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};