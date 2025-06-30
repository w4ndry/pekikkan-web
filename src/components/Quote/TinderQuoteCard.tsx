import React, { useState, useRef, useMemo, useCallback } from 'react';
import TinderCard from 'react-tinder-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, Flag, Volume2, User, UserPlus, RotateCcw } from 'lucide-react';
import { Quote } from '../../types';
import { elevenLabsService } from '../../lib/elevenlabs';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../Auth/AuthModal';
import { ReportModal } from '../Report/ReportModal';
import toast from 'react-hot-toast';

interface TinderQuoteCardProps {
  quotes: Quote[];
  currentIndex: number;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onReport: (id: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Animation constants for smooth interactions
const SWIPE_THRESHOLD = 100;
const ANIMATION_DURATION = 300;

export const TinderQuoteCard: React.FC<TinderQuoteCardProps> = ({
  quotes,
  currentIndex,
  onLike,
  onSave,
  onReport,
  onNext,
  onPrevious,
}) => {
  const [lastDirection, setLastDirection] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [authAction, setAuthAction] = useState<'like' | 'save' | 'report' | null>(null);
  const [currentQuoteId, setCurrentQuoteId] = useState<string>('');
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  const { user } = useAuth();
  const currentIndexRef = useRef(currentIndex);
  const childRefs = useRef<any[]>([]);

  // Update ref when currentIndex changes
  React.useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

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

  const handleSwipe = useCallback((direction: string, index: number) => {
    console.log(`Swiped ${direction} on card ${index}`);
    setLastDirection(direction);
    setSwipeDirection(direction as 'left' | 'right');
    
    // Only handle swipe if it's the current active card
    if (index === currentIndex) {
      // Add smooth transition delay
      setTimeout(() => {
        if (direction === 'left') {
          // Left swipe = previous quote
          onPrevious();
        } else if (direction === 'right') {
          // Right swipe = next quote
          onNext();
        }
        setSwipeDirection(null);
      }, 100);
    }
  }, [currentIndex, onNext, onPrevious]);

  const handleCardLeftScreen = useCallback((direction: string, index: number) => {
    console.log(`Card ${index} left screen in direction: ${direction}`);
  }, []);

  const handleTap = useCallback(() => {
    // Tap = go to next quote
    onNext();
  }, [onNext]);

  const handlePlay = async () => {
    if (isPlaying || !currentQuote) return;
    
    try {
      setIsPlaying(true);
      await elevenLabsService.playQuote(currentQuote.content, currentQuote.author);
    } catch (error) {
      toast.error('Failed to play quote. Please check your API key.');
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

  const handleUndo = () => {
    if (lastDirection === 'right' && currentIndex > 0) {
      onPrevious();
    } else if (lastDirection === 'left' && currentIndex < quotes.length - 1) {
      onNext();
    }
    setLastDirection('');
  };

  // Programmatic swipe functions
  const swipeLeft = () => {
    if (childRefs.current[currentIndex]) {
      childRefs.current[currentIndex].swipe('left');
    }
  };

  const swipeRight = () => {
    if (childRefs.current[currentIndex]) {
      childRefs.current[currentIndex].swipe('right');
    }
  };

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

      {/* Card Stack Container */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="relative w-full max-w-sm h-96">
          {visibleCards.map(({ quote, index }) => {
            const isActive = index === currentIndex;
            const stackPosition = index - currentIndex;
            
            return (
              <TinderCard
                key={`${quote.id}-${index}`}
                ref={(el) => (childRefs.current[index] = el)}
                onSwipe={(dir) => handleSwipe(dir, index)}
                onCardLeftScreen={(dir) => handleCardLeftScreen(dir, index)}
                preventSwipe={!isActive ? ['up', 'down', 'left', 'right'] : ['up', 'down']}
                swipeThreshold={SWIPE_THRESHOLD}
                className="absolute inset-0"
                swipeRequirementType="position"
                flickOnSwipe={true}
              >
                <motion.div
                  className="w-full h-full bg-white rounded-3xl shadow-lg p-8 cursor-pointer select-none"
                  style={{
                    zIndex: visibleCards.length - Math.abs(stackPosition),
                    transform: `scale(${1 - Math.abs(stackPosition) * 0.05}) translateY(${stackPosition * 8}px)`,
                    opacity: isActive ? 1 : 0.7 - Math.abs(stackPosition) * 0.2,
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
                    duration: ANIMATION_DURATION / 1000,
                  }}
                  whileHover={isActive ? { scale: 1.02 } : {}}
                  whileTap={isActive ? { scale: 0.98 } : {}}
                  onClick={isActive ? handleTap : undefined}
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

                  {/* Swipe Indicators */}
                  <div className={`absolute top-4 left-4 text-green-500 opacity-0 transform rotate-12 text-4xl font-bold pointer-events-none transition-all duration-200 ${swipeDirection === 'right' ? 'opacity-100 scale-110' : ''}`}>
                    NEXT
                  </div>
                  <div className={`absolute top-4 right-4 text-blue-500 opacity-0 transform -rotate-12 text-4xl font-bold pointer-events-none transition-all duration-200 ${swipeDirection === 'left' ? 'opacity-100 scale-110' : ''}`}>
                    PREV
                  </div>
                </motion.div>
              </TinderCard>
            );
          })}
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
            onClick={swipeLeft}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-sm font-bold">←</span>
          </motion.button>

          <motion.button
            onClick={() => requireAuth('like', currentQuote.id, () => onLike(currentQuote.id))}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
              currentQuote.isLiked ? 'bg-red-500 text-white scale-110' : 'bg-white text-red-500 hover:bg-red-50'
            }`}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <Heart size={24} fill={currentQuote.isLiked ? 'currentColor' : 'none'} />
          </motion.button>

          <motion.button
            onClick={handlePlay}
            disabled={isPlaying}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
              isPlaying ? 'bg-primary/50' : 'bg-primary text-white hover:bg-primary/90'
            }`}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            animate={{
              rotate: isPlaying ? 360 : 0,
            }}
            transition={{
              rotate: { duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }
            }}
          >
            <Volume2 size={24} />
          </motion.button>

          <motion.button
            onClick={swipeRight}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-green-500 text-white hover:bg-green-600 transition-all duration-200"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-sm font-bold">→</span>
          </motion.button>

          {lastDirection && (
            <motion.button
              onClick={handleUndo}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <RotateCcw size={24} />
            </motion.button>
          )}
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

        {/* Swipe Instructions */}
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs text-gray-400">
            Swipe left for previous • Swipe right for next • Tap to go next
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