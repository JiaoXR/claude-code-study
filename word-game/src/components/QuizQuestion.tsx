import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Volume2 } from 'lucide-react';
import { Word } from '../types/word';
import { getWrongOptions } from '../data/words';
import { PixelCard } from './ui/PixelCard';

interface QuizQuestionProps {
  word: Word;
  onAnswer: (isCorrect: boolean, selectedAnswer: string) => void;
  questionNumber: number;
  totalQuestions: number;
  timeLimit?: number; // 秒数，可选
}

interface Option {
  text: string;
  isCorrect: boolean;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  word,
  onAnswer,
  questionNumber,
  totalQuestions,
  timeLimit = 30,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    generateOptions();
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(timeLimit);
    setShowResult(false);
  }, [word, timeLimit]);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      // 时间到，自动答错
      handleAnswer('', false);
    }
  }, [timeLeft, isAnswered]);

  const generateOptions = () => {
    const wrongOptions = getWrongOptions(word, 3);
    const allOptions = [
      { text: word.chinese, isCorrect: true },
      ...wrongOptions.map(option => ({ text: option, isCorrect: false }))
    ];
    
    // 随机打乱选项顺序
    const shuffled = allOptions.sort(() => Math.random() - 0.5);
    setOptions(shuffled);
  };

  const handleAnswer = (selectedAnswer: string, isCorrect: boolean) => {
    setSelectedOption(selectedAnswer);
    setIsAnswered(true);
    setShowResult(true);

    // 延迟调用回调，让用户看到结果
    setTimeout(() => {
      onAnswer(isCorrect, selectedAnswer);
    }, 1500);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.english);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const getTimeColor = () => {
    if (timeLeft > 20) return 'var(--success-green)';
    if (timeLeft > 10) return 'var(--primary-yellow)';
    return 'var(--health-red)';
  };

  const getOptionStyle = (option: Option) => {
    if (!isAnswered) {
      return {
        backgroundColor: 'var(--darker-bg)',
        borderColor: 'var(--pixel-border)',
        color: 'var(--text-white)'
      };
    }

    if (option.text === selectedOption) {
      return {
        backgroundColor: option.isCorrect ? 'var(--success-green)' : 'var(--health-red)',
        borderColor: option.isCorrect ? 'var(--success-green)' : 'var(--health-red)',
        color: 'white'
      };
    }

    if (option.isCorrect) {
      return {
        backgroundColor: 'var(--success-green)',
        borderColor: 'var(--success-green)',
        color: 'white'
      };
    }

    return {
      backgroundColor: 'var(--darker-bg)',
      borderColor: 'var(--pixel-border)',
      color: 'var(--text-gray)',
      opacity: 0.6
    };
  };

  return (
    <div className="w-full max-w-2xl mx-auto pixel-no-select">
      {/* 问题头部信息 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="pixel-font" style={{ 
            fontSize: '10px', 
            color: 'var(--text-gray)' 
          }}>
            第 {questionNumber} 题 / 共 {totalQuestions} 题
          </div>
          
          <motion.div
            className="pixel-font"
            style={{ 
              fontSize: '12px', 
              color: getTimeColor(),
              textShadow: '1px 1px 0 #000'
            }}
            animate={{ 
              scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 
            }}
            transition={{ 
              duration: 0.5, 
              repeat: timeLeft <= 5 ? Infinity : 0 
            }}
          >
            ⏰ {timeLeft}s
          </motion.div>
        </div>

        {/* 时间进度条 */}
        <div className="w-full h-2 bg-gray-800 border border-gray-600">
          <motion.div
            className="h-full"
            style={{ backgroundColor: getTimeColor() }}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / timeLimit) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* 问题卡片 */}
      <PixelCard className="mb-6 text-center">
        <div className="pixel-font" style={{ 
          fontSize: '12px', 
          color: 'var(--text-gray)',
          marginBottom: '8px'
        }}>
          请选择单词的正确中文释义：
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.h2
            className="pixel-font"
            style={{ 
              fontSize: '24px', 
              color: 'var(--primary-yellow)',
              textShadow: '2px 2px 0 #000'
            }}
            whileHover={{ scale: 1.05 }}
          >
            {word.english}
          </motion.h2>
          
          <motion.button
            onClick={handleSpeak}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={isAnswered}
            style={{
              background: 'none',
              border: 'none',
              cursor: isAnswered ? 'not-allowed' : 'pointer',
              color: 'var(--primary-blue)',
              opacity: isAnswered ? 0.5 : 1
            }}
          >
            <Volume2 size={20} />
          </motion.button>
        </div>

        {word.pronunciation && (
          <div className="pixel-font" style={{ 
            fontSize: '10px', 
            color: 'var(--text-gray)' 
          }}>
            {word.pronunciation}
          </div>
        )}
      </PixelCard>

      {/* 选项 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option, index) => (
          <motion.div
            key={option.text}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.button
              className="w-full p-4 pixel-font text-left border-2 transition-all duration-200"
              style={{
                ...getOptionStyle(option),
                fontSize: '14px',
                cursor: isAnswered ? 'not-allowed' : 'pointer'
              }}
              onClick={() => !isAnswered && handleAnswer(option.text, option.isCorrect)}
              disabled={isAnswered}
              whileHover={!isAnswered ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center justify-between">
                <span>{String.fromCharCode(65 + index)}. {option.text}</span>
                
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      {option.isCorrect ? (
                        <CheckCircle size={20} color="white" />
                      ) : option.text === selectedOption ? (
                        <XCircle size={20} color="white" />
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* 结果反馈 */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PixelCard>
              {selectedOption === word.chinese ? (
                <div>
                  <motion.div
                    className="pixel-font"
                    style={{ 
                      fontSize: '16px', 
                      color: 'var(--success-green)',
                      marginBottom: '8px'
                    }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    ✅ 回答正确！
                  </motion.div>
                  <div className="pixel-font" style={{ 
                    fontSize: '10px', 
                    color: 'var(--text-white)' 
                  }}>
                    太棒了，战士！继续保持！
                  </div>
                </div>
              ) : (
                <div>
                  <motion.div
                    className="pixel-font"
                    style={{ 
                      fontSize: '16px', 
                      color: 'var(--health-red)',
                      marginBottom: '8px'
                    }}
                    animate={{ x: [-5, 5, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    ❌ 回答错误
                  </motion.div>
                  <div className="pixel-font" style={{ 
                    fontSize: '12px', 
                    color: 'var(--success-green)',
                    marginBottom: '4px'
                  }}>
                    正确答案：{word.chinese}
                  </div>
                  <div className="pixel-font" style={{ 
                    fontSize: '10px', 
                    color: 'var(--text-white)' 
                  }}>
                    不要放弃，战士！下次一定能答对！
                  </div>
                </div>
              )}
            </PixelCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};