import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Bookmark, Flag, Volume2, User } from 'lucide-react';
import { Quote } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../Auth/AuthModal';
import { ReportModal } from '../Report/ReportModal';
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
  const [showReportModal, setShowReportModal] = useState(false);
  const [authAction, setAuthAction] = useState<'like' | 'save' | 'report' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localQuote, setLocalQuote] = useState<Quote | null>(null);
  const { user } = useAuth();

  // Update local quote state when quote prop changes and preserve interaction states
  useEffect(() => {
    if (quote) {
      setLocalQuote({
        ...quote,
        // Ensure interaction states are properly preserved
        isLiked: quote.isLiked || false,
        isSaved: quote.isSaved || false,
      });
    } else {
      setLocalQuote(null);
    }
  }, [quote]);

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

  if (!localQuote) return null;

  const requireAuth = (action: 'like' | 'save' | 'report', callback: () => void) => {
    if (!user) {
      setAuthAction(action);
      setShowAuthModal(true);
      return;
    }
    callback();
  };

  const handleAuthSuccess = () => {
    if (authAction && localQuote) {
      switch (authAction) {
        case 'like':
          handleLike();
          break;
        case 'save':
          handleSave();
          break;
        case 'report':
          setShowReportModal(true);
          break;
      }
      setAuthAction(null);
    }
  };

  const handleLike = () => {
    if (!localQuote) return;
    
    // Update local state immediately for responsive UI
    setLocalQuote(prev => prev ? {
      ...prev,
      isLiked: !prev.isLiked,
      like_count: prev.isLiked ? prev.like_count - 1 : prev.like_count + 1
    } : null);
    
    // Call the parent handler
    onLike?.(localQuote.id);
  };

  const handleSave = () => {
    if (!localQuote) return;
    
    // Update local state immediately for responsive UI
    setLocalQuote(prev => prev ? {
      ...prev,
      isSaved: !prev.isSaved,
      save_count: prev.isSaved ? prev.save_count - 1 : prev.save_count + 1
    } : null);
    
    // Call the parent handler
    onSave?.(localQuote.id);
  };

  const handleReportClick = () => {
    requireAuth('report', () => setShowReportModal(true));
  };

  const handleReportSubmit = () => {
    onReport?.(localQuote.id);
    setShowReportModal(false);
    toast.success('Report submitted successfully');
  };

  const handlePlay = async () => {
    if (isPlaying) return;
    
    try {
      setIsPlaying(true);
      await elevenLabsService.playQuote(localQuote.content, localQuote.author);
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
                        "{localQuote.content}"
                      </p>
                      
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <User size={12} className="text-gray-600" />
                        </div>
                        <p className="text-base min-[480px]:text-lg text-gray-600 font-inter font-medium">
                          — {localQuote.author}
                        </p>
                      </div>

                      {localQuote.user && (
                        <p className="text-sm text-gray-500">
                          Shared by @{localQuote.user.username}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8">
                      {/* Primary Actions */}
                      <div className="flex justify-center gap-3 min-[480px]:gap-4 mb-6">
                        <motion.button
                          onClick={() => requireAuth('like', handleLike)}
                          className={`w-12 h-12 min-[480px]:w-14 min-[480px]:h-14 rounded-full flex items-center justify-center shadow-md transition-colors ${
                            localQuote.isLiked ? 'bg-red-500 text-white' : 'bg-white text-red-500'
                          }`}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart size={20} fill={localQuote.isLiked ? 'currentColor' : 'none'} />
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
                          onClick={() => requireAuth('save', handleSave)}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-colors text-sm min-[480px]:text-base ${
                            localQuote.isSaved ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Bookmark size={14} fill={localQuote.isSaved ? 'currentColor' : 'none'} />
                          <span className="font-medium">
                            {localQuote.isSaved ? 'Saved' : 'Save'}
                          </span>
                        </motion.button>

                        <motion.button
                          onClick={handleReportClick}
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
        onClose={() => {
          setShowAuthModal(false);
          setAuthAction(null);
        }}
        mode="login"
        onSuccess={handleAuthSuccess}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        quoteId={localQuote.id}
        quoteContent={localQuote.content}
        quoteAuthor={localQuote.author}
      />
    </>
  );
};