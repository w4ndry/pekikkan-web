import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Bookmark, Flag, Volume2, User } from 'lucide-react';
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

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={onClose}
            />
            
            {/* Modal Container with responsive sizing */}
            <div className="relative w-full h-full flex items-center justify-center p-4 min-[480px]:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-[90%] min-[480px]:max-w-[400px] max-h-[calc(100vh-32px)] min-[480px]:max-h-[calc(100vh-48px)] bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-full">
                  <div className="p-6 min-[480px]:p-8">
                    {/* Close Button */}
                    <button
                      onClick={onClose}
                      className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>

                    {/* Quote Content */}
                    <div className="text-center space-y-6 mt-4 pr-8">
                      <p className="text-lg min-[480px]:text-xl text-gray-800 font-lato italic leading-relaxed">
                        "{quote.content}"
                      </p>
                      
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <User size={12} className="text-gray-600" />
                        </div>
                        <p className="text-base min-[480px]:text-lg text-gray-600 font-inter font-medium">
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
                      {/* Primary Actions */}
                      <div className="flex justify-center gap-3 min-[480px]:gap-4 mb-6">
                        <motion.button
                          onClick={() => requireAuth('like', () => onLike?.(quote.id))}
                          className={`w-12 h-12 min-[480px]:w-14 min-[480px]:h-14 rounded-full flex items-center justify-center shadow-md transition-colors ${
                            quote.isLiked ? 'bg-red-500 text-white' : 'bg-white text-red-500'
                          }`}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart size={20} fill={quote.isLiked ? 'currentColor' : 'none'} />
                        </motion.button>

                        <motion.button
                          onClick={handlePlay}
                          disabled={isPlaying}
                          className={`w-12 h-12 min-[480px]:w-14 min-[480px]:h-14 rounded-full flex items-center justify-center shadow-md transition-colors ${
                            isPlaying ? 'bg-primary/50' : 'bg-primary text-white'
                          }`}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Volume2 size={20} />
                        </motion.button>
                      </div>

                      {/* Secondary Actions */}
                      <div className="flex flex-col min-[480px]:flex-row justify-center gap-3 min-[480px]:gap-4">
                        <motion.button
                          onClick={() => requireAuth('save', () => onSave?.(quote.id))}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-colors text-sm min-[480px]:text-base ${
                            quote.isSaved ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Bookmark size={14} fill={quote.isSaved ? 'currentColor' : 'none'} />
                          <span className="font-medium">
                            {quote.isSaved ? 'Saved' : 'Save'}
                          </span>
                        </motion.button>

                        <motion.button
                          onClick={() => requireAuth('report', () => onReport?.(quote.id))}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm min-[480px]:text-base"
                          whileTap={{ scale: 0.95 }}
                        >
                          <Flag size={14} />
                          <span className="font-medium">Report</span>
                        </motion.button>
                      </div>

                      {/* Auth Prompt */}
                      {!user && (
                        <div className="mt-6 text-center">
                          <p className="text-sm text-gray-500">
                            Sign in to save quotes and interact with the community
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
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