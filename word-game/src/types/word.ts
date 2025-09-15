export interface Word {
  id: string;
  english: string;
  chinese: string;
  pronunciation?: string;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1-简单 5-困难
  chapter?: string;
  examples?: string[];
  tags?: string[];
}

export interface WordProgress {
  wordId: string;
  learned: boolean;
  favorited: boolean;
  correctCount: number;
  incorrectCount: number;
  lastStudied: Date;
  streak: number; // 连续答对次数
}

export interface StudySession {
  id: string;
  mode: 'study' | 'test';
  wordsStudied: string[];
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  maxCombo: number;
  startTime: Date;
  endTime: Date;
  duration: number; // 毫秒
}

export interface UserStats {
  totalWordsLearned: number;
  totalTestsTaken: number;
  averageScore: number;
  maxCombo: number;
  totalStudyTime: number; // 毫秒
  achievements: Achievement[];
  level: number;
  experience: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface GameState {
  currentMode: 'menu' | 'study' | 'test' | 'review';
  selectedChapter?: string;
  currentWordIndex: number;
  score: number;
  combo: number;
  health: number;
  maxHealth: number;
  questionsAnswered: number;
  totalQuestions: number;
}