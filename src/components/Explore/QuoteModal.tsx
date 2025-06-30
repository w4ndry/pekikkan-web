import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Bookmark, Share2, Flag, Volume2, User } from 'lucide-react';
import { Quote } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../Auth/AuthModal';
import { elevenLabsService } from '../../lib/elevenlabs';
import toast from 'react-hot-toast';

interface QuoteModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
  onReport?: (id: string) => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  quote,
  isOpen,
  onClose,
  onLike,
  onSave,
  onReport,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<'like' | 'save' | 'report' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();

  if (!quote) return null;

  const requireAuth = (action: 'like' | 'save' | 'report', callback: () => void) => {
    if (!user) {
      setAuthAction(action);
      setShowAuthModal(true);
      return;
    }
    callback();
  };

  const handleAuthSuccess = () => {
    if (authAction && quote) {
      switch (authAction) {
        case 'like':
          onLike?.(quote.id);
          break;
        case 'save':
          onSave?.(quote.id);
          break;
        case 'report':
          onReport?.(quote.id);
          break;
      }
      setAuthAction(null);
    }
  };

  const handlePlay = async () => {
    if (isPlaying) return;
    
    try {
      setIsPlaying(true);
      await elevenLabsService.playQuote(quote.content, quote.author);
    } catch (error) {
      toast.error('Failed to play quote. Please check your API key.');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleShare = async () => {
    const text = `"${quote.content}" - ${quote.author}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inspirational Quote',
          text,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(text);
        toast.success('Quote copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy quote');
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center space-y-6 mt-4">
                <p className="text-xl text-gray-800 font-lato italic leading-relaxed">
                  "{quote.content}"
                </p>
                
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={12} className="text-gray-600" />
                  </div>
                  <p className="text-lg text-gray-600 font-inter font-medium">
                    — {quote.author}
                  </p>
                </div>

                {quote.user && (
                  <p className="text-sm text-gray-500">
                    Shared by @{quote.user.username}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8">
                <div className="flex justify-center gap-4 mb-6">
                  <motion.button
                    onClick={() => requireAuth('like', () => onLike?.(quote.id))}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors ${
                      quote.isLiked ? 'bg-red-500 text-white' : 'bg-white text-red-500'
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart size={20} fill={quote.isLiked ? 'currentColor' : 'none'} />
                  </motion.button>

                  <motion.button
                    onClick={handlePlay}
                    disabled={isPlaying}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors ${
                      isPlaying ? 'bg-primary/50' : 'bg-primary text-white'
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Volume2 size={20} />
                  </motion.button>

                  <motion.button
                    onClick={handleShare}
                    className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center shadow-md"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Share2 size={20} />
                  </motion.button>
                </div>

                <div className="flex justify-center gap-4">
                  <motion.button
                    onClick={() => requireAuth('save', () => onSave?.(quote.id))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      quote.isSaved ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bookmark size={14} fill={quote.isSaved ? 'currentColor' : 'none'} />
                    <span className="text-sm font-medium">
                      {quote.isSaved ? 'Saved' : 'Save'}
                    </span>
                  </motion.button>

                  <motion.button
                    onClick={() => requireAuth('report', () => onReport?.(quote.id))}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Flag size={14} />
                    <span className="text-sm font-medium">Report</span>
                  </motion.button>
                </div>

                {!user && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Sign in to save quotes and interact with the community
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="login"
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};