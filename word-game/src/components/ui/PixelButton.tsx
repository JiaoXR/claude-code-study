import React from 'react';
import { motion } from 'framer-motion';

interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  disabled?: boolean;
  className?: string;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  return (
    <motion.button
      className={`pixel-button ${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      animate={{
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </motion.button>
  );
};