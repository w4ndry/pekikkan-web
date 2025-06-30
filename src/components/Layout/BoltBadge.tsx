import React from 'react';
import { motion } from 'framer-motion';

export const BoltBadge: React.FC = () => {
  return (
    <motion.div
      className="fixed top-5 right-5 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-opacity hover:opacity-80"
        aria-label="Built with Bolt - Open Bolt.new in new tab"
      >
        <img
          src="/black_circle_360x360.png"
          alt="Built with Bolt"
          className="w-[clamp(80px,10vw,150px)] h-auto max-w-[150px] min-w-[80px] drop-shadow-lg"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
          }}
          loading="lazy"
        />
      </a>
    </motion.div>
  );
};