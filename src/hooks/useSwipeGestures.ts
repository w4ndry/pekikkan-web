import { useCallback, useRef } from 'react';
import { PanInfo } from 'framer-motion';

interface SwipeGestureConfig {
  threshold?: number;
  velocityThreshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export const useSwipeGestures = ({
  threshold = 100,
  velocityThreshold = 500,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
}: SwipeGestureConfig) => {
  const isDraggingRef = useRef(false);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      isDraggingRef.current = false;
      
      const { offset, velocity } = info;
      const absOffsetX = Math.abs(offset.x);
      const absOffsetY = Math.abs(offset.y);
      const absVelocityX = Math.abs(velocity.x);
      const absVelocityY = Math.abs(velocity.y);

      // Determine if it's a horizontal or vertical swipe
      const isHorizontalSwipe = absOffsetX > absOffsetY;
      const isVerticalSwipe = absOffsetY > absOffsetX;

      // Check if swipe meets threshold requirements
      const meetsDistanceThreshold = absOffsetX > threshold || absOffsetY > threshold;
      const meetsVelocityThreshold = absVelocityX > velocityThreshold || absVelocityY > velocityThreshold;

      if (meetsDistanceThreshold || meetsVelocityThreshold) {
        if (isHorizontalSwipe) {
          if (offset.x > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else if (isVerticalSwipe) {
          if (offset.y > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }
    },
    [threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]
  );

  const handleTap = useCallback(() => {
    // Only trigger tap if not dragging
    return !isDraggingRef.current;
  }, []);

  return {
    handleDragStart,
    handleDragEnd,
    handleTap,
    isDragging: isDraggingRef.current,
  };
};