import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface NavigationControlsProps {
  currentIndex: number;
  totalCards: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onUndo?: () => void;
  showUndo?: boolean;
  className?: string;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentIndex,
  totalCards,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  onUndo,
  showUndo = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {/* Previous Button */}
      <motion.button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
          canGoPrevious 
            ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-110' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        whileTap={canGoPrevious ? { scale: 0.9 } : {}}
        whileHover={canGoPrevious ? { scale: 1.1 } : {}}
        aria-label="Previous quote"
        tabIndex={0}
      >
        <ChevronLeft size={20} />
      </motion.button>

      {/* Card Indicator */}
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
        <span className="text-sm font-medium text-gray-600">
          {currentIndex + 1} / {totalCards}
        </span>
      </div>

      {/* Next Button */}
      <motion.button
        onClick={onNext}
        disabled={!canGoNext}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
          canGoNext 
            ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-110' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        whileTap={canGoNext ? { scale: 0.9 } : {}}
        whileHover={canGoNext ? { scale: 1.1 } : {}}
        aria-label="Next quote"
        tabIndex={0}
      >
        <ChevronRight size={20} />
      </motion.button>

      {/* Undo Button */}
      {showUndo && onUndo && (
        <motion.button
          onClick={onUndo}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-110 transition-all duration-200"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          aria-label="Undo last action"
          tabIndex={0}
        >
          <RotateCcw size={20} />
        </motion.button>
      )}
    </div>
  );
};