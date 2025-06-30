import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Volume2, User } from 'lucide-react';
import { Quote } from '../../types';
import { elevenLabsService } from '../../lib/elevenlabs';
import toast from 'react-hot-toast';

interface QuoteCardProps {
  quote: Quote;
  onNext: () => void;
  onPrevious: () => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  onNext,
  onPrevious,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragX, setDragX] = useState(0);

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
              {quote.content}
            </p>
            <p className="text-lg text-gray-600 font-inter font-medium">
              — {quote.author}
            </p>
          </div>

          {/* Swipe indicator */}
          {Math.abs(dragX) > 20 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`text-6xl ${dragX > 0 ? 'text-green-500' : 'text-blue-500'} opacity-50`}>
                {dragX > 0 ? '←' : '→'}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Action Buttons - Only Play/Listen */}
      <div className="p-6">
        <div className="flex justify-center mb-8">
          <motion.button
            onClick={handlePlay}
            disabled={isPlaying}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              isPlaying ? 'bg-primary/50' : 'bg-primary text-white hover:bg-primary/90'
            }`}
            whileTap={{ scale: 0.9 }}
          >
            <Volume2 size={28} />
          </motion.button>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Tap the card or swipe to see more quotes
          </p>
          <p className="text-xs text-gray-400">
            Press the play button to listen
          </p>
        </div>
      </div>
    </div>
  );
};