import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, Bookmark, Flag, Volume2, User, UserPlus, ChevronLeft, ChevronRight, VolumeX } from 'lucide-react';
import { Quote } from '../../types';
import { elevenLabsService } from '../../lib/elevenlabs';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../Auth/AuthModal';
import { ReportModal } from '../Report/ReportModal';
import { useCardNavigation } from '../../hooks/useCardNavigation';
import toast from 'react-hot-toast';

interface EnhancedTinderQuoteCardProps {
  quotes: Quote[];
  initialIndex?: number;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onReport: (id: string) => void;
  onIndexChange?: (index: number) => void;
}

export const EnhancedTinderQuoteCard: React.FC<EnhancedTinderQuoteCardProps> = ({
  quotes,
  initialIndex = 0,
  onLike,
  onSave,
  onReport,
  onIndexChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [authAction, setAuthAction] = useState<'like' | 'save' | 'report' | null>(null);
  const [currentQuoteId, setCurrentQuoteId] = useState<string>('');
  
  const { user } = useAuth();

  // Enhanced navigation with keyboard support
  const {
    currentIndex,
    canGoNext,
    canGoPrevious,
    goToNext,
    goToPrevious,
  } = useCardNavigation({
    totalCards: quotes.length,
    initialIndex,
    loop: false,
    onIndexChange,
    enableKeyboard: true,
  });

  // Get visible cards for rendering (show current and next 2 cards)
  const visibleCards = useMemo(() => {
    const cards = [];
    for (let i = currentIndex; i < Math.min(currentIndex + 3, quotes.length); i++) {
      if (quotes[i]) {
        cards.push({
          quote: quotes[i],
          index: i,
        });
      }
    }
    return cards.reverse(); // Reverse for proper stacking (last card on top)
  }, [quotes, currentIndex]);

  const currentQuote = quotes[currentIndex];

  // Check if ElevenLabs is configured
  const elevenLabsStatus = elevenLabsService.getStatus();

  const handlePlay = async () => {
    if (isPlaying || !currentQuote) return;
    
    if (!elevenLabsStatus.configured) {
      toast.error('Text-to-speech is not available. Please configure your ElevenLabs API key.');
      return;
    }
    
    try {
      setIsPlaying(true);
      await elevenLabsService.playQuote(currentQuote.content, currentQuote.author);
      toast.success('Quote played successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play quote';
      toast.error(errorMessage);
      console.error('Error playing quote:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const requireAuth = (action: 'like' | 'save' | 'report', quoteId: string, callback: () => void) => {
    if (!user) {
      setAuthAction(action);
      setCurrentQuoteId(quoteId);
      setShowAuthModal(true);
      return;
    }
    callback();
  };

  const handleAuthSuccess = () => {
    if (authAction && currentQuoteId) {
      switch (authAction) {
        case 'like':
          onLike(currentQuoteId);
          break;
        case 'save':
          onSave(currentQuoteId);
          break;
        case 'report':
          setShowReportModal(true);
          break;
      }
      setAuthAction(null);
      setCurrentQuoteId('');
    }
  };

  const handleReportClick = () => {
    if (!currentQuote) return;
    requireAuth('report', currentQuote.id, () => setShowReportModal(true));
  };

  const handleReportSubmit = () => {
    if (currentQuoteId) {
      onReport(currentQuoteId);
      setShowReportModal(false);
      toast.success('Report submitted successfully');
      setCurrentQuoteId('');
    }
  };

  if (!quotes.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <p className="text-gray-600 text-lg mb-4">No quotes available</p>
          <p className="text-gray-500">Check back later for more inspiration!</p>
        </div>
      </div>
    );
  }

  if (!currentQuote) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <p className="text-gray-600 text-lg mb-4">No more quotes available</p>
          <p className="text-gray-500">Check back later for more inspiration!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white">
        <h1 className="text-2xl font-bold text-gray-800 font-inter">Pekikkan</h1>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {currentQuote.user?.username || 'Anonymous'}
          </span>
          <button 
            onClick={() => requireAuth('like', currentQuote.id, () => toast.success('Follow feature coming soon!'))}
            className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors"
          >
            <UserPlus size={20} />
          </button>
        </div>
      </div>

      {/* Card Container with Side Navigation */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Left Navigation Button */}
        <motion.button
          onClick={goToPrevious}
          disabled={!canGoPrevious}
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
            canGoPrevious 
              ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-110' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          whileTap={canGoPrevious ? { scale: 0.9 } : {}}
          whileHover={canGoPrevious ? { scale: 1.1 } : {}}
          aria-label="Previous quote"
          tabIndex={0}
        >
          <ChevronLeft size={24} />
        </motion.button>

        {/* Quote Cards Stack */}
        <div className="relative w-full max-w-sm h-96">
          {visibleCards.map(({ quote, index }) => {
            const isActive = index === currentIndex;
            const stackPosition = index - currentIndex;
            
            return (
              <motion.div
                key={`${quote.id}-${index}`}
                data-card-index={index}
                className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-lg p-8 select-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                style={{
                  zIndex: visibleCards.length - Math.abs(stackPosition),
                }}
                animate={{
                  scale: 1 - Math.abs(stackPosition) * 0.05,
                  y: stackPosition * 8,
                  opacity: isActive ? 1 : 0.7 - Math.abs(stackPosition) * 0.2,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.3,
                }}
                tabIndex={isActive ? 0 : -1}
                role="article"
                aria-label={`Quote ${index + 1} of ${quotes.length}: ${quote.content} by ${quote.author}`}
              >
                <div className="text-center space-y-6 h-full flex flex-col justify-center">
                  <motion.p 
                    className="text-2xl text-gray-800 font-lato italic leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    "{quote.content}"
                  </motion.p>
                  
                  <motion.p 
                    className="text-lg text-gray-600 font-inter font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    — {quote.author}
                  </motion.p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Navigation Button */}
        <motion.button
          onClick={goToNext}
          disabled={!canGoNext}
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
            canGoNext 
              ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-110' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          whileTap={canGoNext ? { scale: 0.9 } : {}}
          whileHover={canGoNext ? { scale: 1.1 } : {}}
          aria-label="Next quote"
          tabIndex={0}
        >
          <ChevronRight size={24} />
        </motion.button>

        {/* Card Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
            <span className="text-sm font-medium text-gray-600">
              {currentIndex + 1} / {quotes.length}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div 
        className="p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Primary Action Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <motion.button
            onClick={() => requireAuth('like', currentQuote.id, () => onLike(currentQuote.id))}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
              currentQuote.isLiked ? 'bg-red-500 text-white scale-110' : 'bg-white text-red-500 hover:bg-red-50'
            }`}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            aria-label={currentQuote.isLiked ? 'Unlike quote' : 'Like quote'}
          >
            <Heart size={24} fill={currentQuote.isLiked ? 'currentColor' : 'none'} />
          </motion.button>

          <motion.button
            onClick={handlePlay}
            disabled={isPlaying || !elevenLabsStatus.configured}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
              !elevenLabsStatus.configured 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isPlaying 
                  ? 'bg-primary/50' 
                  : 'bg-primary text-white hover:bg-primary/90'
            }`}
            whileTap={elevenLabsStatus.configured && !isPlaying ? { scale: 0.9 } : {}}
            whileHover={elevenLabsStatus.configured && !isPlaying ? { scale: 1.1 } : {}}
            animate={{
              rotate: isPlaying ? 360 : 0,
            }}
            transition={{
              rotate: { duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }
            }}
            aria-label={
              !elevenLabsStatus.configured 
                ? 'Text-to-speech not available' 
                : isPlaying 
                  ? 'Playing quote' 
                  : 'Play quote'
            }
            title={!elevenLabsStatus.configured ? elevenLabsStatus.message : undefined}
          >
            {!elevenLabsStatus.configured ? (
              <VolumeX size={24} />
            ) : (
              <Volume2 size={24} />
            )}
          </motion.button>
        </div>

        {/* Secondary Action Buttons */}
        <div className="flex justify-center gap-6">
          <motion.button
            onClick={() => requireAuth('save', currentQuote.id, () => onSave(currentQuote.id))}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
              currentQuote.isSaved ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            aria-label={currentQuote.isSaved ? 'Unsave quote' : 'Save quote'}
          >
            <Bookmark size={16} fill={currentQuote.isSaved ? 'currentColor' : 'none'} />
            <span className="text-sm font-medium">
              {currentQuote.isSaved ? 'Saved' : 'Save'}
            </span>
          </motion.button>

          <motion.button
            onClick={handleReportClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            aria-label="Report quote"
          >
            <Flag size={16} />
            <span className="text-sm font-medium">Report</span>
          </motion.button>
        </div>

        {/* Auth Prompt */}
        {!user && (
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-gray-500">
              Sign in to save quotes and interact with the community
            </p>
          </motion.div>
        )}

        {/* ElevenLabs Status */}
        {!elevenLabsStatus.configured && (
          <motion.div 
            className="mt-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              💡 Add VITE_ELEVENLABS_API_KEY to enable text-to-speech
            </p>
          </motion.div>
        )}

        {/* Keyboard Instructions */}
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs text-gray-400">
            Use arrow keys for navigation
          </p>
        </motion.div>
      </motion.div>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setAuthAction(null);
          setCurrentQuoteId('');
        }}
        mode="login"
        onSuccess={handleAuthSuccess}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setCurrentQuoteId('');
        }}
        quoteId={currentQuoteId}
        quoteContent={currentQuote.content}
        quoteAuthor={currentQuote.author}
      />
    </div>
  );
};