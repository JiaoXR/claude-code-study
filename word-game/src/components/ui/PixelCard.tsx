import React from 'react';
import { motion } from 'framer-motion';

interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const PixelCard: React.FC<PixelCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <motion.div
      className={`pixel-card ${className}`}
      onClick={onClick}
      whileHover={hoverable ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </motion.div>
  );
};