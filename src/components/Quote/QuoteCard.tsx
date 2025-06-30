import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Heart, Bookmark, Flag, Volume2, User, UserPlus } from 'lucide-react';
import { Quote } from '../../types';
import { elevenLabsService } from '../../lib/elevenlabs';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../Auth/AuthModal';
import { ReportModal } from '../Report/ReportModal';
import toast from 'react-hot-toast';

interface QuoteCardProps {
  quote: Quote;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onReport: (id: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  onLike,
  onSave,
  onReport,
  onNext,
  onPrevious,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [authAction, setAuthAction] = useState<'like' | 'save' | 'report' | null>(null);
  const { user } = useAuth();

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      onPrevious();
    } else if (info.offset.x < -threshold) {
      onNext();
    }
    
    setDragX(0);
  };

  const handleTap = () => {
    onNext();
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
    <div className="relative h-full flex flex-col">
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

      {/* Quote Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 cursor-pointer select-none"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDrag={(event, info) => setDragX(info.offset.x)}
          onDragEnd={handleDragEnd}
          onTap={handleTap}
          animate={{ x: dragX * 0.1 }}
          whileTap={{ scale: 0.98 }}
          style={{
            rotate: dragX * 0.05,
          }}
        >
          <div className="text-center space-y-6">
            <p className="text-2xl text-gray-800 font-lato italic leading-relaxed">
              "{quote.content}"
            </p>
            <p className="text-lg text-gray-600 font-inter font-medium">
              — {quote.author}
            </p>
          </div>

          {/* Swipe indicator */}
          {Math.abs(dragX) > 20 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`text-6xl ${dragX > 0 ? 'text-green-500' : 'text-red-500'} opacity-50`}>
                {dragX > 0 ? '←' : '→'}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="p-6">
        <div className="flex justify-center gap-4 mb-8">
          <motion.button
            onClick={() => requireAuth('like', () => onLike(quote.id))}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-colors ${
              quote.isLiked ? 'bg-red-500 text-white' : 'bg-white text-red-500'
            }`}
            whileTap={{ scale: 0.9 }}
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
          >
            <Bookmark size={16} fill={quote.isSaved ? 'currentColor' : 'none'} />
            <span className="text-sm font-medium">Save</span>
          </motion.button>

          <motion.button
            onClick={handleReportClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <Flag size={16} />
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