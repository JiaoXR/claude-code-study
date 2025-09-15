import { WordProgress, StudySession, UserStats, GameState } from '../types/word';

const STORAGE_KEYS = {
  WORD_PROGRESS: 'wordGame_wordProgress',
  STUDY_SESSIONS: 'wordGame_studySessions',
  USER_STATS: 'wordGame_userStats',
  GAME_STATE: 'wordGame_gameState',
  FAVORITES: 'wordGame_favorites',
  SETTINGS: 'wordGame_settings'
};

// 通用存储操作
class StorageService {
  private static instance: StorageService;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save to localStorage: ${key}`, error);
    }
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to read from localStorage: ${key}`, error);
      return defaultValue;
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from localStorage: ${key}`, error);
    }
  }

  // 单词进度管理
  getWordProgress(): Map<string, WordProgress> {
    const progressArray = this.getItem<WordProgress[]>(STORAGE_KEYS.WORD_PROGRESS, []);
    const progressMap = new Map<string, WordProgress>();
    
    progressArray.forEach(progress => {
      // 确保日期对象正确转换
      if (typeof progress.lastStudied === 'string') {
        progress.lastStudied = new Date(progress.lastStudied);
      }
      progressMap.set(progress.wordId, progress);
    });
    
    return progressMap;
  }

  saveWordProgress(progressMap: Map<string, WordProgress>): void {
    const progressArray = Array.from(progressMap.values());
    this.setItem(STORAGE_KEYS.WORD_PROGRESS, progressArray);
  }

  updateWordProgress(wordId: string, updates: Partial<WordProgress>): void {
    const progressMap = this.getWordProgress();
    const current = progressMap.get(wordId) || {
      wordId,
      learned: false,
      favorited: false,
      correctCount: 0,
      incorrectCount: 0,
      lastStudied: new Date(),
      streak: 0
    };

    const updated = { ...current, ...updates, lastStudied: new Date() };
    progressMap.set(wordId, updated);
    this.saveWordProgress(progressMap);
  }

  // 学习会话管理
  getStudySessions(): StudySession[] {
    const sessions = this.getItem<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS, []);
    return sessions.map(session => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime)
    }));
  }

  saveStudySession(session: StudySession): void {
    const sessions = this.getStudySessions();
    sessions.push(session);
    // 只保留最近50次会话
    if (sessions.length > 50) {
      sessions.splice(0, sessions.length - 50);
    }
    this.setItem(STORAGE_KEYS.STUDY_SESSIONS, sessions);
  }

  // 用户统计管理
  getUserStats(): UserStats {
    const defaultStats: UserStats = {
      totalWordsLearned: 0,
      totalTestsTaken: 0,
      averageScore: 0,
      maxCombo: 0,
      totalStudyTime: 0,
      achievements: [],
      level: 1,
      experience: 0
    };

    const stats = this.getItem<UserStats>(STORAGE_KEYS.USER_STATS, defaultStats);
    
    // 确保成就对象的日期正确转换
    stats.achievements = stats.achievements.map(achievement => ({
      ...achievement,
      unlockedAt: new Date(achievement.unlockedAt)
    }));

    return stats;
  }

  saveUserStats(stats: UserStats): void {
    this.setItem(STORAGE_KEYS.USER_STATS, stats);
  }

  updateUserStats(updates: Partial<UserStats>): void {
    const current = this.getUserStats();
    const updated = { ...current, ...updates };
    this.saveUserStats(updated);
  }

  // 游戏状态管理
  getGameState(): GameState {
    const defaultState: GameState = {
      currentMode: 'menu',
      currentWordIndex: 0,
      score: 0,
      combo: 0,
      health: 100,
      maxHealth: 100,
      questionsAnswered: 0,
      totalQuestions: 10
    };

    return this.getItem<GameState>(STORAGE_KEYS.GAME_STATE, defaultState);
  }

  saveGameState(state: GameState): void {
    this.setItem(STORAGE_KEYS.GAME_STATE, state);
  }

  // 收藏单词管理
  getFavorites(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.FAVORITES, []);
  }

  addToFavorites(wordId: string): void {
    const favorites = this.getFavorites();
    if (!favorites.includes(wordId)) {
      favorites.push(wordId);
      this.setItem(STORAGE_KEYS.FAVORITES, favorites);
    }
  }

  removeFromFavorites(wordId: string): void {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(id => id !== wordId);
    this.setItem(STORAGE_KEYS.FAVORITES, filtered);
  }

  isFavorited(wordId: string): boolean {
    return this.getFavorites().includes(wordId);
  }

  // 设置管理
  getSettings(): any {
    return this.getItem(STORAGE_KEYS.SETTINGS, {
      soundEnabled: true,
      animationsEnabled: true,
      difficulty: 'medium',
      autoPlay: true,
      theme: 'pixel'
    });
  }

  saveSettings(settings: any): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // 数据导入导出
  exportData(): string {
    const data = {
      wordProgress: Array.from(this.getWordProgress().values()),
      studySessions: this.getStudySessions(),
      userStats: this.getUserStats(),
      favorites: this.getFavorites(),
      settings: this.getSettings(),
      exportDate: new Date()
    };

    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.wordProgress) {
        this.setItem(STORAGE_KEYS.WORD_PROGRESS, data.wordProgress);
      }
      
      if (data.studySessions) {
        this.setItem(STORAGE_KEYS.STUDY_SESSIONS, data.studySessions);
      }
      
      if (data.userStats) {
        this.setItem(STORAGE_KEYS.USER_STATS, data.userStats);
      }
      
      if (data.favorites) {
        this.setItem(STORAGE_KEYS.FAVORITES, data.favorites);
      }
      
      if (data.settings) {
        this.setItem(STORAGE_KEYS.SETTINGS, data.settings);
      }

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // 清除所有数据
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeItem(key);
    });
  }

  // 获取存储使用情况
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          used += item.length;
        }
      });

      // 估算可用空间（大多数浏览器为5MB）
      const available = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

// 导出单例实例
export const storageService = StorageService.getInstance();

// 导出一些便捷函数
export const saveWordProgress = (wordId: string, updates: Partial<WordProgress>) => {
  storageService.updateWordProgress(wordId, updates);
};

export const toggleFavorite = (wordId: string) => {
  if (storageService.isFavorited(wordId)) {
    storageService.removeFromFavorites(wordId);
  } else {
    storageService.addToFavorites(wordId);
  }
};

export const getWordStats = (wordId: string): WordProgress | null => {
  const progressMap = storageService.getWordProgress();
  return progressMap.get(wordId) || null;
};

export const calculateLevel = (experience: number): number => {
  return Math.floor(experience / 100) + 1;
};

export const getExperienceForNextLevel = (currentExp: number): number => {
  const currentLevel = calculateLevel(currentExp);
  return currentLevel * 100 - currentExp;
};