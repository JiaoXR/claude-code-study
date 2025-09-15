import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const PixelModal: React.FC<PixelModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="pixel-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="pixel-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {title && (
              <div className="pixel-font" style={{ 
                color: 'var(--primary-yellow)', 
                marginBottom: '16px',
                textAlign: 'center',
                fontSize: '12px'
              }}>
                {title}
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};