import React, { useCallback, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';

interface SwipeGestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  threshold?: number;
  velocityThreshold?: number;
  disabled?: boolean;
  className?: string;
}

export const SwipeGestureHandler: React.FC<SwipeGestureHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  threshold = 100,
  velocityThreshold = 500,
  disabled = false,
  className = '',
}) => {
  const isDraggingRef = useRef(false);
  const startTimeRef = useRef(0);
  
  // Motion values for smooth animations
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform values for visual feedback
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-150, 0, 150], [0.8, 1, 0.8]);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    startTimeRef.current = Date.now();
  }, []);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    
    // Update motion values for real-time feedback
    x.set(info.offset.x);
    y.set(info.offset.y);
  }, [disabled, x, y]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    isDraggingRef.current = false;
    
    if (disabled) return;

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

    // Reset position with spring animation
    x.set(0);
    y.set(0);
  }, [disabled, threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, x, y]);

  const handleTap = useCallback(() => {
    if (disabled) return;
    
    // Only trigger tap if not dragging and it was a quick tap
    const tapDuration = Date.now() - startTimeRef.current;
    if (!isDraggingRef.current && tapDuration < 200) {
      onTap?.();
    }
  }, [disabled, onTap]);

  return (
    <motion.div
      className={className}
      style={{
        x,
        y,
        rotate,
        opacity,
        cursor: disabled ? 'default' : 'grab',
      }}
      drag={!disabled}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      whileDrag={{ 
        cursor: 'grabbing',
        scale: 1.05,
        zIndex: 10,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }}
    >
      {children}
    </motion.div>
  );
};