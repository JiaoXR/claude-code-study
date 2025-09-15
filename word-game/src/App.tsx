import React, { useState } from 'react';
import './styles/pixelart.css';
import { MainMenu } from './components/MainMenu';
import { StudyMode } from './components/StudyMode';
import { TestMode } from './components/TestMode';

type AppMode = 'menu' | 'study' | 'test' | 'favorites' | 'stats';

function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('menu');
  const [selectedChapter, setSelectedChapter] = useState<string | undefined>();
  const [testDifficulty, setTestDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleStudyMode = (chapter?: string) => {
    setSelectedChapter(chapter);
    setCurrentMode('study');
  };

  const handleTestMode = (difficulty: 'easy' | 'medium' | 'hard') => {
    setTestDifficulty(difficulty);
    setCurrentMode('test');
  };

  const handleFavoritesMode = () => {
    setSelectedChapter(undefined); // 收藏模式会在StudyMode组件内部处理
    setCurrentMode('study');
  };

  const handleStatsMode = () => {
    setCurrentMode('stats');
  };

  const handleBackToMenu = () => {
    setCurrentMode('menu');
    setSelectedChapter(undefined);
  };

  return (
    <div className="App pixel-font">
      {currentMode === 'menu' && (
        <MainMenu
          onStudyMode={handleStudyMode}
          onTestMode={handleTestMode}
          onFavoritesMode={handleFavoritesMode}
          onStatsMode={handleStatsMode}
        />
      )}
      
      {currentMode === 'study' && (
        <StudyMode
          onBack={handleBackToMenu}
          selectedChapter={selectedChapter}
        />
      )}
      
      {currentMode === 'test' && (
        <TestMode
          onBack={handleBackToMenu}
          difficulty={testDifficulty}
        />
      )}
      
      {currentMode === 'stats' && (
        <div className="min-h-screen pixel-grid-bg flex items-center justify-center">
          <div className="pixel-card text-center">
            <div className="pixel-font" style={{ color: 'var(--text-white)', marginBottom: '16px' }}>
              📊 学习统计功能开发中...
            </div>
            <button 
              className="pixel-button primary"
              onClick={handleBackToMenu}
            >
              返回主菜单
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
