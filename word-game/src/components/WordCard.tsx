import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Volume2 } from 'lucide-react';
import { Word } from '../types/word';
import { PixelCard } from './ui/PixelCard';
import { PixelButton } from './ui/PixelButton';
import { storageService } from '../utils/storage';

interface WordCardProps {
  word: Word;
  showAnswer?: boolean;
  onFlip?: () => void;
  onFavorite?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isFlipped?: boolean;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  showAnswer = false,
  onFlip,
  onFavorite,
  onNext,
  onPrevious,
  isFlipped = false,
}) => {
  const [isFavorited, setIsFavorited] = useState(
    () => storageService.isFavorited(word.id)
  );
  const [cardFlipped, setCardFlipped] = useState(isFlipped);

  const handleFlip = () => {
    setCardFlipped(!cardFlipped);
    onFlip?.();
  };

  const handleFavorite = () => {
    if (isFavorited) {
      storageService.removeFromFavorites(word.id);
    } else {
      storageService.addToFavorites(word.id);
    }
    setIsFavorited(!isFavorited);
    onFavorite?.();
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.english);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
      case 2:
        return 'var(--success-green)';
      case 3:
        return 'var(--primary-yellow)';
      case 4:
      case 5:
        return 'var(--health-red)';
      default:
        return 'var(--text-gray)';
    }
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 2) return '简单';
    if (difficulty === 3) return '中等';
    return '困难';
  };

  return (
    <div className="pixel-no-select" style={{ 
      perspective: '1000px',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <motion.div
        className="relative w-full h-80"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: cardFlipped || showAnswer ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* 正面 - 英文单词 */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)'
          }}
        >
          <PixelCard className="h-full flex flex-col justify-between p-6">
            {/* 顶部信息 */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span 
                  className="pixel-font"
                  style={{ 
                    fontSize: '8px', 
                    color: getDifficultyColor(word.difficulty) 
                  }}
                >
                  {getDifficultyText(word.difficulty)}
                </span>
                {word.chapter && (
                  <span className="pixel-font" style={{ 
                    fontSize: '6px', 
                    color: 'var(--text-gray)',
                    marginTop: '2px'
                  }}>
                    {word.chapter}
                  </span>
                )}
              </div>
              
              <motion.button
                className="pixel-font"
                onClick={handleFavorite}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <Heart 
                  size={16} 
                  fill={isFavorited ? 'var(--health-red)' : 'none'}
                  color={isFavorited ? 'var(--health-red)' : 'var(--text-gray)'}
                />
              </motion.button>
            </div>

            {/* 中间 - 主要单词 */}
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <motion.h2
                className="pixel-font"
                style={{ 
                  fontSize: '20px', 
                  color: 'var(--primary-yellow)',
                  textShadow: '2px 2px 0 #000',
                  marginBottom: '8px'
                }}
                whileHover={{ scale: 1.05 }}
              >
                {word.english}
              </motion.h2>
              
              {word.pronunciation && (
                <div className="flex items-center gap-2">
                  <span className="pixel-font" style={{ 
                    fontSize: '10px', 
                    color: 'var(--text-gray)' 
                  }}>
                    {word.pronunciation}
                  </span>
                  <motion.button
                    onClick={handleSpeak}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--primary-blue)'
                    }}
                  >
                    <Volume2 size={12} />
                  </motion.button>
                </div>
              )}
            </div>

            {/* 底部 - 翻转提示 */}
            <div className="text-center">
              <motion.div
                className="pixel-font"
                style={{ fontSize: '8px', color: 'var(--text-gray)' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                点击卡片查看释义
              </motion.div>
            </div>
          </PixelCard>
        </div>

        {/* 背面 - 中文释义 */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <PixelCard className="h-full flex flex-col justify-between p-6">
            {/* 顶部 - 英文单词（小字） */}
            <div className="text-center">
              <span className="pixel-font" style={{ 
                fontSize: '12px', 
                color: 'var(--text-gray)' 
              }}>
                {word.english}
              </span>
            </div>

            {/* 中间 - 中文释义 */}
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <motion.h2
                className="pixel-font"
                style={{ 
                  fontSize: '18px', 
                  color: 'var(--primary-blue)',
                  textShadow: '2px 2px 0 #000',
                  marginBottom: '16px'
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {word.chinese}
              </motion.h2>

              {/* 例句 */}
              {word.examples && word.examples.length > 0 && (
                <motion.div
                  className="pixel-font"
                  style={{ 
                    fontSize: '8px', 
                    color: 'var(--text-white)',
                    textAlign: 'center',
                    lineHeight: '1.4'
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  例句：{word.examples[0]}
                </motion.div>
              )}

              {/* 标签 */}
              {word.tags && word.tags.length > 0 && (
                <motion.div
                  className="flex flex-wrap justify-center gap-1 mt-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {word.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="pixel-font"
                      style={{
                        fontSize: '6px',
                        color: 'var(--primary-yellow)',
                        background: 'rgba(255, 204, 0, 0.2)',
                        padding: '2px 4px',
                        border: '1px solid var(--primary-yellow)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </motion.div>
              )}
            </div>

            {/* 底部 - 再次翻转提示 */}
            <div className="text-center">
              <motion.div
                className="pixel-font"
                style={{ fontSize: '8px', color: 'var(--text-gray)' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                点击卡片返回正面
              </motion.div>
            </div>
          </PixelCard>
        </div>
      </motion.div>

      {/* 翻转按钮 */}
      <div className="flex justify-center mt-4">
        <PixelButton onClick={handleFlip} variant="secondary">
          {cardFlipped || showAnswer ? '查看单词' : '查看释义'}
        </PixelButton>
      </div>

      {/* 导航按钮 */}
      {(onNext || onPrevious) && (
        <div className="flex justify-center gap-4 mt-4">
          {onPrevious && (
            <PixelButton onClick={onPrevious} variant="warning">
              上一个
            </PixelButton>
          )}
          {onNext && (
            <PixelButton onClick={onNext} variant="success">
              下一个
            </PixelButton>
          )}
        </div>
      )}
    </div>
  );
};