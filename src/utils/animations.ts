// Animation utility functions and constants

export const ANIMATION_DURATIONS = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const;

export const EASING_CURVES = {
  // Natural easing curves for smooth animations
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  
  // Spring-like easing
  bounceOut: [0.68, -0.55, 0.265, 1.55],
  backOut: [0.175, 0.885, 0.32, 1.275],
  
  // Smooth curves for swipe gestures
  swipeEase: [0.25, 0.46, 0.45, 0.94],
  momentumEase: [0.23, 1, 0.32, 1],
} as const;

export const SPRING_CONFIGS = {
  // Smooth and responsive
  smooth: {
    type: "spring" as const,
    stiffness: 400,
    damping: 40,
    mass: 0.6,
  },
  
  // Bouncy and playful
  bouncy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    mass: 0.8,
  },
  
  // Gentle and subtle
  gentle: {
    type: "spring" as const,
    stiffness: 200,
    damping: 50,
    mass: 1,
  },
  
  // Quick and snappy
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
    mass: 0.4,
  },
} as const;

export const GESTURE_THRESHOLDS = {
  swipe: 100,
  velocity: 500,
  tap: 10,
} as const;

// Hardware acceleration utilities
export const enableHardwareAcceleration = (element: HTMLElement) => {
  element.style.willChange = 'transform';
  element.style.backfaceVisibility = 'hidden';
  element.style.perspective = '1000px';
  element.style.transform = 'translateZ(0)';
};

export const disableHardwareAcceleration = (element: HTMLElement) => {
  element.style.willChange = 'auto';
  element.style.backfaceVisibility = 'visible';
  element.style.perspective = 'none';
  element.style.transform = 'none';
};

// Performance monitoring for 60fps
export const createPerformanceMonitor = () => {
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
      
      // Log performance warnings
      if (fps < 50) {
        console.warn(`Low FPS detected: ${fps}fps`);
      }
    }
    
    requestAnimationFrame(monitor);
  };

  return {
    start: () => requestAnimationFrame(monitor),
    getFPS: () => fps,
  };
};

// Smooth transition variants for common animations
export const fadeInOut = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: ANIMATION_DURATIONS.normal,
    ease: EASING_CURVES.easeInOut,
  },
};

export const slideInOut = (direction: 'left' | 'right' | 'up' | 'down' = 'right') => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left': return { x: -100 };
      case 'right': return { x: 100 };
      case 'up': return { y: -100 };
      case 'down': return { y: 100 };
    }
  };

  const getExitPosition = () => {
    switch (direction) {
      case 'left': return { x: 100 };
      case 'right': return { x: -100 };
      case 'up': return { y: 100 };
      case 'down': return { y: -100 };
    }
  };

  return {
    initial: { ...getInitialPosition(), opacity: 0 },
    animate: { x: 0, y: 0, opacity: 1 },
    exit: { ...getExitPosition(), opacity: 0 },
    transition: SPRING_CONFIGS.smooth,
  };
};

export const scaleInOut = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: SPRING_CONFIGS.smooth,
};

// Swipe animation variants
export const swipeVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8,
    rotate: direction > 0 ? 20 : -20,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8,
    rotate: direction < 0 ? 20 : -20,
  }),
};

// Stagger animation for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: SPRING_CONFIGS.smooth,
  },
};