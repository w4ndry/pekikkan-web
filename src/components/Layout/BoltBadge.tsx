import React from 'react';
import { motion } from 'framer-motion';

export const BoltBadge: React.FC = () => {
  return (
    <motion.div
      className="absolute top-4 right-4 z-40"
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
        className="block transition-opacity hover:opacity-80 active:opacity-60"
        aria-label="Built with Bolt - Open Bolt.new in new tab"
      >
        <img
          src="/black_circle_360x360.png"
          alt="Built with Bolt"
          className="w-12 h-12 min-[480px]:w-14 min-[480px]:h-14 drop-shadow-md"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
          }}
          loading="lazy"
        />
      </a>
    </motion.div>
  );
};