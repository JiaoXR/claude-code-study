import React from 'react';
import { motion } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  label?: string;
  combo?: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  label = '得分',
  combo,
}) => {
  return (
    <div className="pixel-no-select" style={{ textAlign: 'center' }}>
      {label && (
        <div className="pixel-font" style={{ 
          color: 'var(--text-white)', 
          marginBottom: '4px',
          fontSize: '8px'
        }}>
          {label}
        </div>
      )}
      <motion.div
        className="pixel-score"
        key={score}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3 }}
      >
        {score.toLocaleString()}
      </motion.div>
      {combo && combo > 1 && (
        <motion.div
          className="pixel-combo"
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {combo}X COMBO!
        </motion.div>
      )}
    </div>
  );
};