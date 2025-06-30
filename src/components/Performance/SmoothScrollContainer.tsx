import React, { useRef, useEffect, ReactNode } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

interface SmoothScrollContainerProps {
  children: ReactNode;
  className?: string;
  enableMomentum?: boolean;
  dampening?: number;
  stiffness?: number;
}

export const SmoothScrollContainer: React.FC<SmoothScrollContainerProps> = ({
  children,
  className = '',
  enableMomentum = true,
  dampening = 40,
  stiffness = 400,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll({
    container: containerRef,
  });

  // Smooth spring animation for scroll
  const smoothScrollY = useSpring(scrollY, {
    stiffness,
    damping: dampening,
    mass: 0.1,
  });

  // Transform for smooth momentum scrolling
  const y = useTransform(smoothScrollY, (value) => -value);

  useEffect(() => {
    if (!enableMomentum || !containerRef.current) return;

    const container = containerRef.current;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (!isScrolling) {
        // Add momentum class when scrolling starts
        container.style.scrollBehavior = 'auto';
        isScrolling = true;
      }

      // Clear existing timeout
      clearTimeout(scrollTimeout);

      // Set timeout to detect scroll end
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        container.style.scrollBehavior = 'smooth';
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [enableMomentum]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
        willChange: 'scroll-position',
      }}
    >
      <motion.div
        ref={contentRef}
        style={{
          y: enableMomentum ? y : 0,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
        transition={{
          type: "spring",
          stiffness,
          damping: dampening,
          mass: 0.1,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};