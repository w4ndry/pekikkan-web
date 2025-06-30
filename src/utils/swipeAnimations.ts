// Swipe animation utilities and configurations

export const SWIPE_ANIMATIONS = {
  // Smooth easing curves for natural movement
  EASING: {
    easeOut: [0.0, 0.0, 0.2, 1],
    easeIn: [0.4, 0.0, 1, 1],
    easeInOut: [0.4, 0.0, 0.2, 1],
    bounceOut: [0.68, -0.55, 0.265, 1.55],
    swipeEase: [0.25, 0.46, 0.45, 0.94],
  },

  // Animation durations (300-500ms recommended)
  DURATION: {
    fast: 0.3,
    normal: 0.4,
    slow: 0.5,
  },

  // Spring configurations for smooth interactions
  SPRING: {
    smooth: {
      type: "spring" as const,
      stiffness: 400,
      damping: 40,
      mass: 0.6,
    },
    bouncy: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
      mass: 0.8,
    },
    gentle: {
      type: "spring" as const,
      stiffness: 200,
      damping: 50,
      mass: 1,
    },
  },

  // Gesture thresholds
  THRESHOLDS: {
    swipe: 100,
    velocity: 500,
    tap: 10,
  },
} as const;

// Card stack animation variants
export const cardStackVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8,
    rotate: direction > 0 ? 20 : -20,
  }),
  center: (stackPosition: number) => ({
    x: 0,
    y: stackPosition * 8,
    opacity: stackPosition === 0 ? 1 : 0.7 - (stackPosition * 0.2),
    scale: 1 - (stackPosition * 0.05),
    rotate: 0,
    zIndex: 10 - stackPosition,
  }),
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8,
    rotate: direction < 0 ? 20 : -20,
  }),
};

// Swipe feedback animations
export const swipeFeedbackVariants = {
  idle: {
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
  swipeRight: {
    scale: 1.05,
    rotate: 5,
    opacity: 0.9,
  },
  swipeLeft: {
    scale: 1.05,
    rotate: -5,
    opacity: 0.9,
  },
};

// Bounce-back effect for list boundaries
export const bounceBackVariants = {
  initial: { x: 0 },
  bounceLeft: {
    x: [-20, 0],
    transition: {
      duration: 0.4,
      ease: SWIPE_ANIMATIONS.EASING.bounceOut,
    },
  },
  bounceRight: {
    x: [20, 0],
    transition: {
      duration: 0.4,
      ease: SWIPE_ANIMATIONS.EASING.bounceOut,
    },
  },
};

// Hardware acceleration helper
export const enableHardwareAcceleration = {
  style: {
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    perspective: 1000,
  },
};

// Performance optimized transition
export const performanceTransition = {
  ...SWIPE_ANIMATIONS.SPRING.smooth,
  layout: true,
};

// Momentum scrolling configuration
export const momentumConfig = {
  dragMomentum: true,
  dragElastic: 0.2,
  dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
  ...enableHardwareAcceleration,
};

// Stagger animation for multiple cards
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { y: 20, opacity: 0, scale: 0.9 },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: SWIPE_ANIMATIONS.SPRING.smooth,
  },
};

// Error handling for swipe actions
export const handleSwipeError = (error: Error, action: string) => {
  console.error(`Swipe ${action} failed:`, error);
  
  // Provide user feedback
  return {
    success: false,
    message: `Failed to ${action}. Please try again.`,
    error: error.message,
  };
};

// Performance monitoring for 60fps
export const createSwipePerformanceMonitor = () => {
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 60;

  const monitor = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime >= lastTime + 1000) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;
      
      // Log performance warnings for swipe animations
      if (fps < 50) {
        console.warn(`Swipe animation performance warning: ${fps}fps`);
      }
    }
    
    requestAnimationFrame(monitor);
  };

  return {
    start: () => requestAnimationFrame(monitor),
    getFPS: () => fps,
  };
};