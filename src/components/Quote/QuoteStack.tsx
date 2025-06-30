import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeableQuoteCard } from './SwipeableQuoteCard';
import { Quote } from '../../types';

interface QuoteStackProps {
  quotes: Quote[];
  currentIndex: number;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onReport: (id: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const STACK_SIZE = 3; // Number of cards to render in stack
const STACK_OFFSET = 8; // Offset between stacked cards
const STACK_SCALE = 0.02; // Scale reduction per card in stack

export const QuoteStack: React.FC<QuoteStackProps> = ({
  quotes,
  currentIndex,
  onLike,
  onSave,
  onReport,
  onNext,
  onPrevious,
}) => {
  const [direction, setDirection] = useState<'next' | 'previous' | null>(null);

  // Get visible cards for the stack
  const visibleCards = useMemo(() => {
    const cards = [];
    for (let i = 0; i < STACK_SIZE; i++) {
      const index = currentIndex + i;
      if (index < quotes.length) {
        cards.push({
          quote: quotes[index],
          index,
          stackPosition: i,
        });
      }
    }
    return cards;
  }, [quotes, currentIndex]);

  const handleNext = useCallback(() => {
    setDirection('next');
    onNext();
  }, [onNext]);

  const handlePrevious = useCallback(() => {
    setDirection('previous');
    onPrevious();
  }, [onPrevious]);

  // Animation variants for smooth card transitions
  const cardVariants = {
    enter: (direction: 'next' | 'previous') => ({
      x: direction === 'next' ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotate: direction === 'next' ? 20 : -20,
    }),
    center: (stackPosition: number) => ({
      x: 0,
      y: stackPosition * STACK_OFFSET,
      opacity: stackPosition === 0 ? 1 : 0.7 - (stackPosition * 0.2),
      scale: 1 - (stackPosition * STACK_SCALE),
      rotate: 0,
      zIndex: STACK_SIZE - stackPosition,
    }),
    exit: (direction: 'next' | 'previous') => ({
      x: direction === 'next' ? -300 : 300,
      opacity: 0,
      scale: 0.8,
      rotate: direction === 'next' ? -20 : 20,
    }),
  };

  const transition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  };

  return (
    <div className="relative h-full w-full">
      <AnimatePresence mode="popLayout" custom={direction}>
        {visibleCards.map(({ quote, index, stackPosition }) => (
          <motion.div
            key={`${quote.id}-${index}`}
            className="absolute inset-0"
            custom={stackPosition === 0 ? direction : stackPosition}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            style={{
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
          >
            <SwipeableQuoteCard
              quote={quote}
              onLike={onLike}
              onSave={onSave}
              onReport={onReport}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isActive={stackPosition === 0}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};