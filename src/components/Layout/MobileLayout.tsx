import React from 'react';
import { BoltBadge } from './BoltBadge';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <div className={`w-mobile max-w-mobile bg-white min-h-screen relative ${className}`}>
        {children}
        <BoltBadge />
      </div>
    </div>
  );
};