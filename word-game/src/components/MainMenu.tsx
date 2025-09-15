import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Target, 
  Heart, 
  BarChart3
} from 'lucide-react';
import { PixelButton } from './ui/PixelButton';
import { PixelCard } from './ui/PixelCard';
import { HealthBar } from './ui/HealthBar';
import { storageService } from '../utils/storage';
import { wordsByChapter } from '../data/words';

interface MainMenuProps {
  onStudyMode: (chapter?: string) => void;
  onTestMode: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onFavoritesMode: () => void;
  onStatsMode: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStudyMode,
  onTestMode,
  onFavoritesMode,
  onStatsMode,
}) => {
  const [userStats, setUserStats] = useState(storageService.getUserStats());
  const [todayProgress, setTodayProgress] = useState({ studied: 0, tested: 0 });
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);

  useEffect(() => {
    updateProgress();
  }, []);

  const updateProgress = () => {
    const stats = storageService.getUserStats();
    setUserStats(stats);
    
    // 计算今日进度
    const today = new Date().toDateString();
    const sessions = storageService.getStudySessions();
    const todaySessions = sessions.filter(s => s.startTime.toDateString() === today);
    
    const studyCount = todaySessions.filter(s => s.mode === 'study').length;
    const testCount = todaySessions.filter(s => s.mode === 'test').length;
    
    setTodayProgress({ studied: studyCount, tested: testCount });
  };

  const calculateLevel = (experience: number): number => {
    return Math.floor(experience / 100) + 1;
  };

  const getExperienceForNextLevel = (exp: number): number => {
    const currentLevel = calculateLevel(exp);
    return currentLevel * 100 - exp;
  };

  const handleStudyClick = () => {
    setShowChapterSelect(true);
  };

  const handleTestClick = () => {
    setShowDifficultySelect(true);
  };

  const handleChapterSelect = (chapter?: string) => {
    setShowChapterSelect(false);
    onStudyMode(chapter);
  };

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    setShowDifficultySelect(false);
    onTestMode(difficulty);
  };

  const getFavoriteCount = () => {
    return storageService.getFavorites().length;
  };

  return (
    <div className="min-h-screen pixel-grid-bg">
      {/* 头部标题 */}
      <div className="text-center pt-8 pb-6">
        <motion.h1
          className="pixel-font"
          style={{ 
            fontSize: '24px', 
            color: 'var(--primary-yellow)',
            textShadow: '3px 3px 0 #000',
            marginBottom: '8px'
          }}
          animate={{ 
            textShadow: [
              '3px 3px 0 #000',
              '3px 3px 10px var(--primary-yellow)',
              '3px 3px 0 #000'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          🎮 高考单词战士
        </motion.h1>
        <div className="pixel-font" style={{ 
          fontSize: '10px', 
          color: 'var(--text-gray)' 
        }}>
          像素魂斗罗风格背单词挑战
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：用户进度信息 */}
          <div className="lg:col-span-1">
            <PixelCard className="mb-4">
              <div className="text-center mb-4">
                <div className="pixel-font" style={{ 
                  fontSize: '12px', 
                  color: 'var(--primary-blue)',
                  marginBottom: '8px'
                }}>
                  战士等级 {calculateLevel(userStats.experience)}
                </div>
                <HealthBar
                  current={userStats.experience % 100}
                  max={100}
                  label="经验值"
                />
                <div className="pixel-font" style={{ 
                  fontSize: '8px', 
                  color: 'var(--text-gray)',
                  marginTop: '4px'
                }}>
                  还需 {getExperienceForNextLevel(userStats.experience)} 经验升级
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="pixel-font" style={{ 
                    fontSize: '8px', 
                    color: 'var(--text-gray)' 
                  }}>
                    已学单词
                  </div>
                  <div className="pixel-font" style={{ 
                    fontSize: '16px', 
                    color: 'var(--success-green)' 
                  }}>
                    {userStats.totalWordsLearned}
                  </div>
                </div>
                <div>
                  <div className="pixel-font" style={{ 
                    fontSize: '8px', 
                    color: 'var(--text-gray)' 
                  }}>
                    最高连击
                  </div>
                  <div className="pixel-font" style={{ 
                    fontSize: '16px', 
                    color: 'var(--combo-purple)' 
                  }}>
                    {userStats.maxCombo}X
                  </div>
                </div>
                <div>
                  <div className="pixel-font" style={{ 
                    fontSize: '8px', 
                    color: 'var(--text-gray)' 
                  }}>
                    平均分数
                  </div>
                  <div className="pixel-font" style={{ 
                    fontSize: '16px', 
                    color: 'var(--primary-yellow)' 
                  }}>
                    {userStats.averageScore}
                  </div>
                </div>
                <div>
                  <div className="pixel-font" style={{ 
                    fontSize: '8px', 
                    color: 'var(--text-gray)' 
                  }}>
                    测试次数
                  </div>
                  <div className="pixel-font" style={{ 
                    fontSize: '16px', 
                    color: 'var(--primary-blue)' 
                  }}>
                    {userStats.totalTestsTaken}
                  </div>
                </div>
              </div>
            </PixelCard>

            {/* 今日进度 */}
            <PixelCard>
              <div className="pixel-font" style={{ 
                fontSize: '10px', 
                color: 'var(--primary-yellow)',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                📅 今日战绩
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="pixel-font" style={{ 
                    fontSize: '8px', 
                    color: 'var(--text-gray)' 
                  }}>
                    学习会话
                  </div>
                  <div className="pixel-font" style={{ 
                    fontSize: '14px', 
                    color: 'var(--success-green)' 
                  }}>
                    {todayProgress.studied}
                  </div>
                </div>
                <div>
                  <div className="pixel-font" style={{ 
                    fontSize: '8px', 
                    color: 'var(--text-gray)' 
                  }}>
                    测试挑战
                  </div>
                  <div className="pixel-font" style={{ 
                    fontSize: '14px', 
                    color: 'var(--health-red)' 
                  }}>
                    {todayProgress.tested}
                  </div>
                </div>
              </div>
            </PixelCard>
          </div>

          {/* 中间：主要功能按钮 */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 学习模式 */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <PixelCard hoverable onClick={handleStudyClick} className="h-32 cursor-pointer">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <BookOpen size={32} color="var(--success-green)" className="mx-auto mb-2" />
                      <div className="pixel-font" style={{ 
                        fontSize: '14px', 
                        color: 'var(--success-green)',
                        marginBottom: '4px'
                      }}>
                        📚 学习模式
                      </div>
                      <div className="pixel-font" style={{ 
                        fontSize: '8px', 
                        color: 'var(--text-gray)' 
                      }}>
                        背诵单词，建立词汇基础
                      </div>
                    </div>
                  </div>
                </PixelCard>
              </motion.div>

              {/* 测试模式 */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <PixelCard hoverable onClick={handleTestClick} className="h-32 cursor-pointer">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Target size={32} color="var(--health-red)" className="mx-auto mb-2" />
                      <div className="pixel-font" style={{ 
                        fontSize: '14px', 
                        color: 'var(--health-red)',
                        marginBottom: '4px'
                      }}>
                        🎯 挑战模式
                      </div>
                      <div className="pixel-font" style={{ 
                        fontSize: '8px', 
                        color: 'var(--text-gray)' 
                      }}>
                        选择题测试，获得高分
                      </div>
                    </div>
                  </div>
                </PixelCard>
              </motion.div>

              {/* 收藏复习 */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <PixelCard hoverable onClick={onFavoritesMode} className="h-32 cursor-pointer">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Heart size={32} color="var(--primary-red)" className="mx-auto mb-2" />
                      <div className="pixel-font" style={{ 
                        fontSize: '14px', 
                        color: 'var(--primary-red)',
                        marginBottom: '4px'
                      }}>
                        ❤️ 收藏复习
                      </div>
                      <div className="pixel-font" style={{ 
                        fontSize: '8px', 
                        color: 'var(--text-gray)' 
                      }}>
                        复习收藏的单词 ({getFavoriteCount()})
                      </div>
                    </div>
                  </div>
                </PixelCard>
              </motion.div>

              {/* 学习统计 */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <PixelCard hoverable onClick={onStatsMode} className="h-32 cursor-pointer">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <BarChart3 size={32} color="var(--primary-blue)" className="mx-auto mb-2" />
                      <div className="pixel-font" style={{ 
                        fontSize: '14px', 
                        color: 'var(--primary-blue)',
                        marginBottom: '4px'
                      }}>
                        📊 学习统计
                      </div>
                      <div className="pixel-font" style={{ 
                        fontSize: '8px', 
                        color: 'var(--text-gray)' 
                      }}>
                        查看学习进度和成就
                      </div>
                    </div>
                  </div>
                </PixelCard>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* 章节选择模态框 */}
      {showChapterSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <PixelCard className="max-w-md w-full">
            <div className="pixel-font" style={{ 
              fontSize: '14px', 
              color: 'var(--primary-yellow)',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              选择学习章节
            </div>
            
            <div className="space-y-2 mb-4">
              <PixelButton 
                onClick={() => handleChapterSelect()}
                variant="success"
                className="w-full justify-start"
              >
                📚 全部单词
              </PixelButton>
              
              {Object.keys(wordsByChapter).map(chapter => (
                <PixelButton
                  key={chapter}
                  onClick={() => handleChapterSelect(chapter)}
                  variant="secondary"
                  className="w-full justify-start text-xs"
                >
                  {chapter} ({wordsByChapter[chapter].length} 个单词)
                </PixelButton>
              ))}
            </div>
            
            <PixelButton 
              onClick={() => setShowChapterSelect(false)}
              variant="warning"
              className="w-full"
            >
              取消
            </PixelButton>
          </PixelCard>
        </div>
      )}

      {/* 难度选择模态框 */}
      {showDifficultySelect && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <PixelCard className="max-w-md w-full">
            <div className="pixel-font" style={{ 
              fontSize: '14px', 
              color: 'var(--primary-yellow)',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              选择挑战难度
            </div>
            
            <div className="space-y-2 mb-4">
              <PixelButton 
                onClick={() => handleDifficultySelect('easy')}
                variant="success"
                className="w-full"
              >
                🟢 简单模式
                <div className="pixel-font text-xs text-gray-300 ml-2">
                  (基础分数 × 简单单词)
                </div>
              </PixelButton>
              
              <PixelButton 
                onClick={() => handleDifficultySelect('medium')}
                variant="warning"
                className="w-full"
              >
                🟡 中等模式
                <div className="pixel-font text-xs text-gray-300 ml-2">
                  (标准分数 × 混合难度)
                </div>
              </PixelButton>
              
              <PixelButton 
                onClick={() => handleDifficultySelect('hard')}
                variant="primary"
                className="w-full"
              >
                🔴 困难模式
                <div className="pixel-font text-xs text-gray-300 ml-2">
                  (高分数 × 困难单词)
                </div>
              </PixelButton>
            </div>
            
            <PixelButton 
              onClick={() => setShowDifficultySelect(false)}
              variant="warning"
              className="w-full"
            >
              取消
            </PixelButton>
          </PixelCard>
        </div>
      )}
    </div>
  );
};