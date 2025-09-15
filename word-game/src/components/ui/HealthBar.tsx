import React from 'react';
import { motion } from 'framer-motion';

interface HealthBarProps {
  current: number;
  max: number;
  label?: string;
  showNumbers?: boolean;
}

export const HealthBar: React.FC<HealthBarProps> = ({
  current,
  max,
  label,
  showNumbers = true,
}) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="pixel-no-select">
      {label && (
        <div className="pixel-font" style={{ color: 'var(--text-white)', marginBottom: '4px' }}>
          {label}
        </div>
      )}
      <div className="pixel-health-bar">
        <motion.div
          className="pixel-health-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      {showNumbers && (
        <div className="pixel-font" style={{ 
          color: 'var(--text-gray)', 
          fontSize: '8px', 
          marginTop: '2px',
          textAlign: 'center'
        }}>
          {current} / {max}
        </div>
      )}
    </div>
  );
};