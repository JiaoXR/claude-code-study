import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Shuffle, Heart } from 'lucide-react';
import { Word } from '../types/word';
import { wordsByChapter, highSchoolWords } from '../data/words';
import { WordCard } from './WordCard';
import { PixelButton } from './ui/PixelButton';
import { PixelCard } from './ui/PixelCard';
import { HealthBar } from './ui/HealthBar';
import { storageService } from '../utils/storage';

interface StudyModeProps {
  onBack: () => void;
  selectedChapter?: string;
}

export const StudyMode: React.FC<StudyModeProps> = ({ onBack, selectedChapter }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [studiedCount, setStudiedCount] = useState(0);

  useEffect(() => {
    loadWords();
  }, [selectedChapter, isRandomMode, showOnlyFavorites]);

  const loadWords = () => {
    let wordsToLoad: Word[] = [];

    if (showOnlyFavorites) {
      const favorites = storageService.getFavorites();
      wordsToLoad = highSchoolWords.filter(word => favorites.includes(word.id));
    } else if (selectedChapter) {
      wordsToLoad = wordsByChapter[selectedChapter] || [];
    } else {
      wordsToLoad = highSchoolWords;
    }

    if (isRandomMode) {
      wordsToLoad = [...wordsToLoad].sort(() => Math.random() - 0.5);
    }

    setWords(wordsToLoad);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      markAsStudied();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const markAsStudied = () => {
    const currentWord = words[currentIndex];
    if (currentWord) {
      storageService.updateWordProgress(currentWord.id, {
        learned: true,
        lastStudied: new Date()
      });
      setStudiedCount(prev => prev + 1);
    }
  };

  const toggleRandomMode = () => {
    setIsRandomMode(!isRandomMode);
  };

  const toggleFavoritesMode = () => {
    setShowOnlyFavorites(!showOnlyFavorites);
  };

  const handleChapterSelect = (chapter: string) => {
    setWords(wordsByChapter[chapter] || []);
    setCurrentIndex(0);
  };

  const currentWord = words[currentIndex];

  if (!currentWord && words.length === 0) {
    return (
      <div className="min-h-screen pixel-grid-bg flex items-center justify-center p-4">
        <PixelCard className="text-center max-w-md">
          <div className="pixel-font" style={{ 
            fontSize: '14px', 
            color: 'var(--text-white)',
            marginBottom: '16px'
          }}>
            {showOnlyFavorites ? '暂无收藏的单词' : '暂无可学习的单词'}
          </div>
          <div className="flex gap-2 justify-center">
            <PixelButton onClick={onBack} variant="primary">
              返回主菜单
            </PixelButton>
            {showOnlyFavorites && (
              <PixelButton onClick={toggleFavoritesMode} variant="secondary">
                查看所有单词
              </PixelButton>
            )}
          </div>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pixel-grid-bg">
      {/* 顶部导航栏 */}
      <div className="p-4 border-b-2" style={{ borderColor: 'var(--pixel-border)' }}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <PixelButton onClick={onBack} variant="warning">
            <ArrowLeft size={16} className="mr-2" />
            返回
          </PixelButton>

          <div className="flex items-center gap-4">
            <div className="pixel-font" style={{ 
              color: 'var(--primary-yellow)', 
              fontSize: '12px' 
            }}>
              学习模式
            </div>
            {selectedChapter && (
              <div className="pixel-font" style={{ 
                color: 'var(--text-white)', 
                fontSize: '8px' 
              }}>
                {selectedChapter}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <PixelButton 
              onClick={toggleRandomMode} 
              variant={isRandomMode ? 'success' : 'secondary'}
            >
              <Shuffle size={16} />
            </PixelButton>
            <PixelButton 
              onClick={toggleFavoritesMode} 
              variant={showOnlyFavorites ? 'primary' : 'secondary'}
            >
              <Heart size={16} />
            </PixelButton>
          </div>
        </div>
      </div>

      {/* 进度信息 */}
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <PixelCard>
              <HealthBar
                current={currentIndex + 1}
                max={words.length}
                label="学习进度"
              />
            </PixelCard>

            <PixelCard>
              <div className="text-center">
                <div className="pixel-font" style={{ 
                  color: 'var(--text-white)', 
                  fontSize: '8px',
                  marginBottom: '4px'
                }}>
                  今日已学
                </div>
                <div className="pixel-font" style={{ 
                  color: 'var(--success-green)', 
                  fontSize: '16px'
                }}>
                  {studiedCount}
                </div>
              </div>
            </PixelCard>

            <PixelCard>
              <div className="text-center">
                <div className="pixel-font" style={{ 
                  color: 'var(--text-white)', 
                  fontSize: '8px',
                  marginBottom: '4px'
                }}>
                  剩余单词
                </div>
                <div className="pixel-font" style={{ 
                  color: 'var(--primary-yellow)', 
                  fontSize: '16px'
                }}>
                  {words.length - currentIndex - 1}
                </div>
              </div>
            </PixelCard>
          </div>

          {/* 章节快速选择 */}
          {!showOnlyFavorites && (
            <div className="mb-6">
              <div className="pixel-font" style={{ 
                color: 'var(--text-white)', 
                fontSize: '10px',
                marginBottom: '8px'
              }}>
                快速选择章节：
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(wordsByChapter).map(chapter => (
                  <PixelButton
                    key={chapter}
                    onClick={() => handleChapterSelect(chapter)}
                    variant={selectedChapter === chapter ? 'primary' : 'secondary'}
                    className="text-xs"
                  >
                    {chapter}
                  </PixelButton>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 主要单词卡片区域 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          key={currentWord?.id}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <WordCard
            word={currentWord}
            onNext={currentIndex < words.length - 1 ? handleNext : undefined}
            onPrevious={currentIndex > 0 ? handlePrevious : undefined}
            onFlip={markAsStudied}
          />
        </motion.div>
      </div>

      {/* 底部控制栏 */}
      <div className="p-4 border-t-2" style={{ borderColor: 'var(--pixel-border)' }}>
        <div className="max-w-6xl mx-auto flex justify-center gap-4">
          <PixelButton 
            onClick={handlePrevious} 
            disabled={currentIndex === 0}
            variant="warning"
          >
            上一个 ({currentIndex + 1}/{words.length})
          </PixelButton>
          
          <PixelButton onClick={markAsStudied} variant="success">
            <BookOpen size={16} className="mr-2" />
            标记已学
          </PixelButton>
          
          <PixelButton 
            onClick={handleNext} 
            disabled={currentIndex === words.length - 1}
            variant="success"
          >
            下一个 ({currentIndex + 1}/{words.length})
          </PixelButton>
        </div>
      </div>
    </div>
  );
};