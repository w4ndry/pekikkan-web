import React, { useState, useRef, useCallback } from 'react';
import { motion, PanInfo, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, Flag, Volume2, User, UserPlus } from 'lucide-react';
import { Quote } from '../../types';
import { elevenLabsService } from '../../lib/elevenlabs';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../Auth/AuthModal';
import { ReportModal } from '../Report/ReportModal';
import toast from 'react-hot-toast';

interface SwipeableQuoteCardProps {
  quote: Quote;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onReport: (id: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  isActive?: boolean;
}

// Animation constants for smooth interactions
const SWIPE_THRESHOLD = 100;
const ROTATION_FACTOR = 0.1;
const SCALE_FACTOR = 0.95;
const ANIMATION_DURATION = 0.4;
const SPRING_CONFIG = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

const SMOOTH_TRANSITION = {
  type: "spring" as const,
  stiffness: 400,
  damping: 40,
  mass: 0.6,
};

export const SwipeableQuoteCard: React.FC<SwipeableQuoteCardProps> = ({
  quote,
  onLike,
  onSave,
  onReport,
  onNext,
  onPrevious,
  isActive = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [authAction, setAuthAction] = useState<'like' | 'save' | 'report' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  const { user } = useAuth();
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Motion values for smooth animations
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth spring animations
  const smoothX = useSpring(x, SPRING_CONFIG);
  const smoothY = useSpring(y, SPRING_CONFIG);
  
  // Transform values with easing
  const rotate = useTransform(smoothX, [-300, 0, 300], [-30, 0, 30]);
  const scale = useTransform(smoothX, [-150, 0, 150], [0.9, 1, 0.9]);
  const opacity = useTransform(smoothX, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);
  
  // Background overlay transforms
  const likeOpacity = useTransform(smoothX, [0, 100], [0, 1]);
  const dislikeOpacity = useTransform(smoothX, [-100, 0], [1, 0]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Update motion values for real-time feedback
    x.set(info.offset.x);
    y.set(info.offset.y * 0.3); // Reduce vertical movement
    
    // Update swipe direction indicator
    if (Math.abs(info.offset.x) > 20) {
      setSwipeDirection(info.offset.x > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  }, [x, y]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    setSwipeDirection(null);
    
    const swipeVelocity = Math.abs(info.velocity.x);
    const swipeDistance = Math.abs(info.offset.x);
    
    // Determine if swipe threshold is met
    const shouldSwipe = swipeDistance > SWIPE_THRESHOLD || swipeVelocity > 500;
    
    if (shouldSwipe) {
      // Animate card off screen with momentum
      const direction = info.offset.x > 0 ? 1 : -1;
      const exitX = direction * (window.innerWidth + 100);
      
      x.set(exitX);
      
      // Trigger appropriate action after animation
      setTimeout(() => {
        if (direction > 0) {
          onNext();
        } else {
          onPrevious();
        }
        
        // Reset position for next card
        x.set(0);
        y.set(0);
      }, ANIMATION_DURATION * 1000);
    } else {
      // Bounce back to center with spring animation
      x.set(0);
      y.set(0);
    }
  }, [x, y, onNext, onPrevious]);

  const handleTap = useCallback(() => {
    if (!isDragging) {
      onNext();
    }
  }, [isDragging, onNext]);

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

  const requireAuth = (action: 'like' | 'save' | 'report', callback: () => void) => {
    if (!user) {
      setAuthAction(action);
      setShowAuthModal(true);
      return;
    }
    callback();
  };

  const handleAuthSuccess = () => {
    if (authAction) {
      switch (authAction) {
        case 'like':
          onLike(quote.id);
          break;
        case 'save':
          onSave(quote.id);
          break;
        case 'report':
          setShowReportModal(true);
          break;
      }
      setAuthAction(null);
    }
  };

  const handleReportClick = () => {
    requireAuth('report', () => setShowReportModal(true));
  };

  const handleReportSubmit = () => {
    onReport(quote.id);
    setShowReportModal(false);
    toast.success('Report submitted successfully');
  };

  return (
    <div className="relative h-full flex flex-col" ref={constraintsRef}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white">
        <h1 className="text-2xl font-bold text-gray-800 font-inter">Pekikkan</h1>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {quote.user?.username || 'Anonymous'}
          </span>
          <button 
            onClick={() => requireAuth('like', () => toast.success('Follow feature coming soon!'))}
            className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors"
          >
            <UserPlus size={20} />
          </button>
        </div>
      </div>

      {/* Quote Card Container */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Overlays */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center"
          style={{ opacity: likeOpacity }}
        >
          <div className="text-white text-6xl font-bold">👍</div>
        </motion.div>
        
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center"
          style={{ opacity: dislikeOpacity }}
        >
          <div className="text-white text-6xl font-bold">👎</div>
        </motion.div>

        {/* Main Quote Card */}
        <motion.div
          className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 cursor-pointer select-none relative z-10"
          style={{
            x: smoothX,
            y: smoothY,
            rotate,
            scale,
            opacity,
          }}
          drag={isActive}
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          dragMomentum={true}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onTap={handleTap}
          whileTap={{ scale: 0.98 }}
          animate={{
            scale: isActive ? 1 : 0.95,
            opacity: isActive ? 1 : 0.7,
          }}
          transition={SMOOTH_TRANSITION}
          // Enable hardware acceleration
          style={{
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            perspective: 1000,
          }}
        >
          <div className="text-center space-y-6">
            <motion.p 
              className="text-2xl text-gray-800 font-lato italic leading-relaxed"
              animate={{
                scale: isDragging ? 0.95 : 1,
              }}
              transition={SMOOTH_TRANSITION}
            >
              "{quote.content}"
            </motion.p>
            
            <motion.p 
              className="text-lg text-gray-600 font-inter font-medium"
              animate={{
                scale: isDragging ? 0.95 : 1,
              }}
              transition={SMOOTH_TRANSITION}
            >
              — {quote.author}
            </motion.p>
          </div>

          {/* Swipe Indicators */}
          <AnimatePresence>
            {swipeDirection && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`text-6xl ${swipeDirection === 'right' ? 'text-green-500' : 'text-red-500'} opacity-70`}>
                  {swipeDirection === 'right' ? '→' : '←'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div 
        className="p-6"
        animate={{
          y: isDragging ? 10 : 0,
          opacity: isDragging ? 0.7 : 1,
        }}
        transition={SMOOTH_TRANSITION}
      >
        <div className="flex justify-center gap-4 mb-8">
          <motion.button
            onClick={() => requireAuth('like', () => onLike(quote.id))}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-colors ${
              quote.isLiked ? 'bg-red-500 text-white' : 'bg-white text-red-500'
            }`}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            transition={SMOOTH_TRANSITION}
          >
            <Heart size={24} fill={quote.isLiked ? 'currentColor' : 'none'} />
          </motion.button>

          <motion.button
            onClick={handlePlay}
            disabled={isPlaying}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-colors ${
              isPlaying ? 'bg-primary/50' : 'bg-primary text-white'
            }`}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            animate={{
              rotate: isPlaying ? 360 : 0,
            }}
            transition={{
              ...SMOOTH_TRANSITION,
              rotate: { duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }
            }}
          >
            <Volume2 size={24} />
          </motion.button>
        </div>

        <div className="flex justify-center gap-6">
          <motion.button
            onClick={() => requireAuth('save', () => onSave(quote.id))}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              quote.isSaved ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
            }`}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            transition={SMOOTH_TRANSITION}
          >
            <Bookmark size={16} fill={quote.isSaved ? 'currentColor' : 'none'} />
            <span className="text-sm font-medium">Save</span>
          </motion.button>

          <motion.button
            onClick={handleReportClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            transition={SMOOTH_TRANSITION}
          >
            <Flag size={16} />
            <span className="text-sm font-medium">Report</span>
          </motion.button>
        </div>

        {!user && (
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ...SMOOTH_TRANSITION }}
          >
            <p className="text-sm text-gray-500">
              Sign in to save quotes and interact with the community
            </p>
          </motion.div>
        )}
      </motion.div>

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
        quoteId={quote.id}
        quoteContent={quote.content}
        quoteAuthor={quote.author}
      />
    </div>
  );
};