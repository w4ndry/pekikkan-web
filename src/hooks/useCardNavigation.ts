import { useState, useCallback, useEffect } from 'react';

interface UseCardNavigationProps {
  totalCards: number;
  initialIndex?: number;
  loop?: boolean;
  onIndexChange?: (index: number) => void;
  enableKeyboard?: boolean;
}

export const useCardNavigation = ({
  totalCards,
  initialIndex = 0,
  loop = false,
  onIndexChange,
  enableKeyboard = true,
}: UseCardNavigationProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<'next' | 'previous' | null>(null);
  const [history, setHistory] = useState<number[]>([initialIndex]);

  // Bounds checking
  const canGoNext = loop || currentIndex < totalCards - 1;
  const canGoPrevious = loop || currentIndex > 0;

  const goToNext = useCallback(() => {
    if (!canGoNext) return;
    
    setDirection('next');
    const nextIndex = loop 
      ? (currentIndex + 1) % totalCards 
      : Math.min(currentIndex + 1, totalCards - 1);
    
    setCurrentIndex(nextIndex);
    setHistory(prev => [...prev, nextIndex]);
    onIndexChange?.(nextIndex);
    
    // Clear direction after animation
    setTimeout(() => setDirection(null), 100);
  }, [currentIndex, totalCards, loop, canGoNext, onIndexChange]);

  const goToPrevious = useCallback(() => {
    if (!canGoPrevious) return;
    
    setDirection('previous');
    const prevIndex = loop 
      ? (currentIndex - 1 + totalCards) % totalCards 
      : Math.max(currentIndex - 1, 0);
    
    setCurrentIndex(prevIndex);
    setHistory(prev => [...prev, prevIndex]);
    onIndexChange?.(prevIndex);
    
    // Clear direction after animation
    setTimeout(() => setDirection(null), 100);
  }, [currentIndex, totalCards, loop, canGoPrevious, onIndexChange]);

  const goToIndex = useCallback((index: number) => {
    if (index < 0 || index >= totalCards || index === currentIndex) return;
    
    const newDirection = index > currentIndex ? 'next' : 'previous';
    setDirection(newDirection);
    setCurrentIndex(index);
    setHistory(prev => [...prev, index]);
    onIndexChange?.(index);
    
    // Clear direction after animation
    setTimeout(() => setDirection(null), 100);
  }, [currentIndex, totalCards, onIndexChange]);

  const undo = useCallback(() => {
    if (history.length <= 1) return;
    
    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previousIndex = newHistory[newHistory.length - 1];
    
    setHistory(newHistory);
    setCurrentIndex(previousIndex);
    onIndexChange?.(previousIndex);
  }, [history, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ': // Spacebar
          event.preventDefault();
          goToNext();
          break;
        case 'Home':
          event.preventDefault();
          goToIndex(0);
          break;
        case 'End':
          event.preventDefault();
          goToIndex(totalCards - 1);
          break;
        case 'u':
        case 'U':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            undo();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, goToNext, goToPrevious, goToIndex, undo, totalCards]);

  // Reset when totalCards changes
  useEffect(() => {
    if (currentIndex >= totalCards) {
      const newIndex = Math.max(0, totalCards - 1);
      setCurrentIndex(newIndex);
      setHistory([newIndex]);
      onIndexChange?.(newIndex);
    }
  }, [totalCards, currentIndex, onIndexChange]);

  return {
    currentIndex,
    direction,
    canGoNext,
    canGoPrevious,
    goToNext,
    goToPrevious,
    goToIndex,
    undo,
    canUndo: history.length > 1,
    history,
  };
};