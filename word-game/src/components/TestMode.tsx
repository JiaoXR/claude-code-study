import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Word, StudySession } from '../types/word';
import { getRandomWords } from '../data/words';
import { QuizQuestion } from './QuizQuestion';
import { PixelButton } from './ui/PixelButton';
import { PixelCard } from './ui/PixelCard';
import { HealthBar } from './ui/HealthBar';
import { ScoreDisplay } from './ui/ScoreDisplay';
import { storageService } from '../utils/storage';

interface TestModeProps {
  onBack: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionsPerRound?: number;
}

interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  health: number;
  maxHealth: number;
  correctAnswers: number;
  totalQuestions: number;
  currentQuestion: number;
}

export const TestMode: React.FC<TestModeProps> = ({
  onBack,
  difficulty = 'medium',
  questionsPerRound = 10,
}) => {
  const [gameState, setGameState] = useState<'starting' | 'playing' | 'finished'>('starting');
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    health: 100,
    maxHealth: 100,
    correctAnswers: 0,
    totalQuestions: questionsPerRound,
    currentQuestion: 1,
  });
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [explosions, setExplosions] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (gameState === 'starting') {
      initializeGame();
    }
  }, [gameState, difficulty, questionsPerRound]);

  const initializeGame = () => {
    const selectedWords = getRandomWords(questionsPerRound);
    setWords(selectedWords);
    setCurrentWordIndex(0);
    setStats({
      score: 0,
      combo: 0,
      maxCombo: 0,
      health: 100,
      maxHealth: 100,
      correctAnswers: 0,
      totalQuestions: questionsPerRound,
      currentQuestion: 1,
    });
    setSessionStartTime(new Date());
  };

  const startGame = () => {
    setGameState('playing');
  };

  const handleAnswer = (isCorrect: boolean, selectedAnswer: string) => {
    const currentWord = words[currentWordIndex];
    
    // 更新单词学习进度
    storageService.updateWordProgress(currentWord.id, {
      correctCount: isCorrect ? 1 : 0,
      incorrectCount: isCorrect ? 0 : 1,
    });

    setStats(prevStats => {
      const newStats = { ...prevStats };
      
      if (isCorrect) {
        // 答对了
        const comboBonus = Math.floor(prevStats.combo / 5) * 10;
        const baseScore = getDifficultyScore(currentWord.difficulty);
        const totalScore = baseScore + comboBonus;
        
        newStats.score += totalScore;
        newStats.combo += 1;
        newStats.maxCombo = Math.max(newStats.maxCombo, newStats.combo);
        newStats.correctAnswers += 1;

        // 创建爆炸效果
        createExplosion();
      } else {
        // 答错了
        newStats.combo = 0;
        newStats.health = Math.max(0, newStats.health - 20);
      }

      newStats.currentQuestion += 1;
      return newStats;
    });

    // 移动到下一题或结束游戏
    setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        finishGame();
      }
    }, 2000);
  };

  const getDifficultyScore = (wordDifficulty: number): number => {
    const baseScores = { easy: 10, medium: 15, hard: 25 };
    const difficultyMultiplier = wordDifficulty;
    
    switch (difficulty) {
      case 'easy':
        return baseScores.easy * difficultyMultiplier;
      case 'medium':
        return baseScores.medium * difficultyMultiplier;
      case 'hard':
        return baseScores.hard * difficultyMultiplier;
      default:
        return baseScores.medium * difficultyMultiplier;
    }
  };

  const createExplosion = () => {
    const newExplosion = {
      id: Date.now(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    };
    
    setExplosions(prev => [...prev, newExplosion]);
    
    // 移除爆炸效果
    setTimeout(() => {
      setExplosions(prev => prev.filter(exp => exp.id !== newExplosion.id));
    }, 1000);
  };

  const finishGame = () => {
    const endTime = new Date();
    const duration = endTime.getTime() - sessionStartTime.getTime();
    
    // 保存学习会话
    const session: StudySession = {
      id: Date.now().toString(),
      mode: 'test',
      wordsStudied: words.map(w => w.id),
      correctAnswers: stats.correctAnswers,
      totalQuestions: stats.totalQuestions,
      score: stats.score,
      maxCombo: stats.maxCombo,
      startTime: sessionStartTime,
      endTime,
      duration,
    };
    
    storageService.saveStudySession(session);
    
    // 更新用户统计
    const userStats = storageService.getUserStats();
    const newStats = {
      ...userStats,
      totalTestsTaken: userStats.totalTestsTaken + 1,
      averageScore: Math.round(
        (userStats.averageScore * userStats.totalTestsTaken + stats.score) / 
        (userStats.totalTestsTaken + 1)
      ),
      maxCombo: Math.max(userStats.maxCombo, stats.maxCombo),
      totalStudyTime: userStats.totalStudyTime + duration,
      experience: userStats.experience + Math.floor(stats.score / 10),
    };
    
    storageService.saveUserStats(newStats);
    
    setGameState('finished');
  };

  const restartGame = () => {
    setGameState('starting');
    initializeGame();
    setTimeout(() => setGameState('playing'), 100);
  };

  const getAccuracyRate = () => {
    return stats.currentQuestion > 1 
      ? Math.round((stats.correctAnswers / (stats.currentQuestion - 1)) * 100)
      : 0;
  };

  const getPerformanceMessage = () => {
    const accuracy = getAccuracyRate();
    if (accuracy >= 90) return '完美表现！你是真正的词汇王者！';
    if (accuracy >= 80) return '优秀表现！继续保持这个水平！';
    if (accuracy >= 70) return '良好表现！还有提升空间！';
    if (accuracy >= 60) return '不错的尝试！多练习会更好！';
    return '不要放弃，战士！失败是成功之母！';
  };

  const currentWord = words[currentWordIndex];

  // 游戏开始界面
  if (gameState === 'starting') {
    return (
      <div className="min-h-screen pixel-grid-bg flex items-center justify-center p-4">
        <PixelCard className="text-center max-w-md">
          <div className="pixel-font" style={{ 
            fontSize: '16px', 
            color: 'var(--primary-yellow)',
            marginBottom: '16px'
          }}>
            🎯 准备开始挑战！
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="pixel-font" style={{ 
              fontSize: '10px', 
              color: 'var(--text-white)' 
            }}>
              • 挑战模式：{difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}
            </div>
            <div className="pixel-font" style={{ 
              fontSize: '10px', 
              color: 'var(--text-white)' 
            }}>
              • 题目数量：{questionsPerRound} 题
            </div>
            <div className="pixel-font" style={{ 
              fontSize: '10px', 
              color: 'var(--text-white)' 
            }}>
              • 每题时间：30 秒
            </div>
            <div className="pixel-font" style={{ 
              fontSize: '10px', 
              color: 'var(--text-gray)' 
            }}>
              答对获得分数，连击有额外奖励！答错扣血量！
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            <PixelButton onClick={onBack} variant="warning">
              返回
            </PixelButton>
            <PixelButton onClick={startGame} variant="success">
              开始挑战
            </PixelButton>
          </div>
        </PixelCard>
      </div>
    );
  }

  // 游戏进行中界面
  if (gameState === 'playing' && currentWord) {
    return (
      <div className="min-h-screen pixel-grid-bg">
        {/* 爆炸效果 */}
        <AnimatePresence>
          {explosions.map(explosion => (
            <motion.div
              key={explosion.id}
              className="pixel-explosion fixed pointer-events-none z-50"
              style={{ left: explosion.x, top: explosion.y }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 1.5, 0], opacity: [1, 0.8, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          ))}
        </AnimatePresence>

        {/* 顶部状态栏 */}
        <div className="p-4 border-b-2" style={{ borderColor: 'var(--pixel-border)' }}>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <PixelButton onClick={onBack} variant="warning" className="text-xs">
              <ArrowLeft size={12} />
              退出
            </PixelButton>

            <div className="flex items-center gap-6">
              <ScoreDisplay score={stats.score} combo={stats.combo} />
              
              <div className="w-32">
                <HealthBar
                  current={stats.health}
                  max={stats.maxHealth}
                  label="血量"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 游戏主区域 */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentWordIndex}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <QuizQuestion
                  word={currentWord}
                  onAnswer={handleAnswer}
                  questionNumber={stats.currentQuestion}
                  totalQuestions={stats.totalQuestions}
                  timeLimit={30}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // 游戏结束界面
  if (gameState === 'finished') {
    return (
      <div className="min-h-screen pixel-grid-bg flex items-center justify-center p-4">
        <PixelCard className="text-center max-w-lg">
          <div className="pixel-font" style={{ 
            fontSize: '18px', 
            color: 'var(--primary-yellow)',
            marginBottom: '16px'
          }}>
            🏆 挑战完成！
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="pixel-font" style={{ 
                color: 'var(--text-gray)', 
                fontSize: '8px',
                marginBottom: '4px'
              }}>
                最终得分
              </div>
              <div className="pixel-font" style={{ 
                color: 'var(--primary-yellow)', 
                fontSize: '20px'
              }}>
                {stats.score.toLocaleString()}
              </div>
            </div>
            
            <div className="text-center">
              <div className="pixel-font" style={{ 
                color: 'var(--text-gray)', 
                fontSize: '8px',
                marginBottom: '4px'
              }}>
                最高连击
              </div>
              <div className="pixel-font" style={{ 
                color: 'var(--combo-purple)', 
                fontSize: '20px'
              }}>
                {stats.maxCombo}X
              </div>
            </div>
            
            <div className="text-center">
              <div className="pixel-font" style={{ 
                color: 'var(--text-gray)', 
                fontSize: '8px',
                marginBottom: '4px'
              }}>
                正确率
              </div>
              <div className="pixel-font" style={{ 
                color: 'var(--success-green)', 
                fontSize: '20px'
              }}>
                {getAccuracyRate()}%
              </div>
            </div>
            
            <div className="text-center">
              <div className="pixel-font" style={{ 
                color: 'var(--text-gray)', 
                fontSize: '8px',
                marginBottom: '4px'
              }}>
                答对题数
              </div>
              <div className="pixel-font" style={{ 
                color: 'var(--primary-blue)', 
                fontSize: '20px'
              }}>
                {stats.correctAnswers}/{stats.totalQuestions}
              </div>
            </div>
          </div>

          <div className="pixel-font" style={{ 
            fontSize: '10px', 
            color: 'var(--text-white)',
            marginBottom: '20px',
            lineHeight: '1.4'
          }}>
            {getPerformanceMessage()}
          </div>

          <div className="flex gap-2 justify-center">
            <PixelButton onClick={onBack} variant="warning">
              <ArrowLeft size={16} className="mr-2" />
              返回主菜单
            </PixelButton>
            <PixelButton onClick={restartGame} variant="success">
              <RotateCcw size={16} className="mr-2" />
              再来一局
            </PixelButton>
          </div>
        </PixelCard>
      </div>
    );
  }

  return null;
};