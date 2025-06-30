import { useState, useCallback, useRef } from 'react';

interface SwipeNavigationConfig {
  totalItems: number;
  initialIndex?: number;
  loop?: boolean;
  onIndexChange?: (index: number) => void;
}

export const useSwipeNavigation = ({
  totalItems,
  initialIndex = 0,
  loop = false,
  onIndexChange,
}: SwipeNavigationConfig) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<'next' | 'previous' | null>(null);
  const isAnimatingRef = useRef(false);

  const goToNext = useCallback(() => {
    if (isAnimatingRef.current) return;
    
    isAnimatingRef.current = true;
    setDirection('next');
    
    setTimeout(() => {
      setCurrentIndex(prev => {
        const nextIndex = loop 
          ? (prev + 1) % totalItems 
          : Math.min(prev + 1, totalItems - 1);
        
        onIndexChange?.(nextIndex);
        return nextIndex;
      });
      
      isAnimatingRef.current = false;
      setDirection(null);
    }, 100);
  }, [totalItems, loop, onIndexChange]);

  const goToPrevious = useCallback(() => {
    if (isAnimatingRef.current) return;
    
    isAnimatingRef.current = true;
    setDirection('previous');
    
    setTimeout(() => {
      setCurrentIndex(prev => {
        const prevIndex = loop 
          ? (prev - 1 + totalItems) % totalItems 
          : Math.max(prev - 1, 0);
        
        onIndexChange?.(prevIndex);
        return prevIndex;
      });
      
      isAnimatingRef.current = false;
      setDirection(null);
    }, 100);
  }, [totalItems, loop, onIndexChange]);

  const goToIndex = useCallback((index: number) => {
    if (isAnimatingRef.current || index < 0 || index >= totalItems) return;
    
    isAnimatingRef.current = true;
    const newDirection = index > currentIndex ? 'next' : 'previous';
    setDirection(newDirection);
    
    setTimeout(() => {
      setCurrentIndex(index);
      onIndexChange?.(index);
      isAnimatingRef.current = false;
      setDirection(null);
    }, 100);
  }, [currentIndex, totalItems, onIndexChange]);

  const canGoNext = loop || currentIndex < totalItems - 1;
  const canGoPrevious = loop || currentIndex > 0;

  return {
    currentIndex,
    direction,
    canGoNext,
    canGoPrevious,
    goToNext,
    goToPrevious,
    goToIndex,
    isAnimating: isAnimatingRef.current,
  };
};