# 🎮 Gaokao Vocabulary Warrior - Contra-Style Pixel Word Learning App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000.svg)](https://vercel.com/)

> **Make vocabulary learning as fun as playing games!** 🎮✨

A gamified English vocabulary learning app designed specifically for Chinese Gaokao (college entrance exam) students, featuring classic Contra-style pixel art aesthetics that transforms tedious word memorization into an engaging and rewarding experience.

**🚀 [Live Demo](https://word-game-gaokao.vercel.app)** (Link available after deployment)

## ✨ Key Features

### 📚 Study Mode
- **Flashcard Flip Animation**: Click cards to reveal Chinese meanings
- **Chapter-Based Learning**: Gaokao core vocabulary organized by themes  
- **Favorites System**: Bookmark challenging words for review
- **Shuffle Mode**: Randomize word order to prevent mechanical memorization
- **Voice Pronunciation**: Click speaker icon for audio pronunciation

### 🎯 Challenge Mode
- **4-Choice Quiz**: Select correct Chinese meanings from multiple options
- **Three Difficulty Levels**: Easy/Medium/Hard modes with different scoring
- **Combo System**: Consecutive correct answers trigger COMBO bonuses
- **Health Mechanism**: Wrong answers reduce health, adding tension
- **Pixel Explosion Effects**: Correct answers trigger retro explosion animations
- **Timed Challenges**: 30-second limit per question for added pressure

### 📊 Progress Tracking
- **Level System**: Gain experience points and level up through learning
- **Learning Analytics**: Track studied words, test attempts, and performance
- **Daily Progress**: Display today's study and test progress
- **Local Storage**: All data saved locally in browser for privacy

### 🎨 Visual Design
- **Contra Pixel Art Style**: Authentic 8-bit retro game aesthetics
- **Pixel Typography**: Press Start 2P font for authentic retro feel
- **Smooth Animations**: Card flips, explosions, combos with smooth transitions
- **Responsive Design**: Optimized for both desktop and mobile devices

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm start
```

The app will open at http://localhost:3000

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Deploy to Vercel
```bash
# One-click deployment script (recommended)
./deploy.sh

# Deploy preview version
npm run deploy-preview

# Deploy to production
npm run deploy
```

> 📖 For detailed deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📖 User Guide

### Study Mode Usage
1. Select "📚 Study Mode" from main menu
2. Choose a chapter to study (or select all words)
3. Click word cards to view meanings
4. Use bookmark button to save important words
5. Click speaker button for pronunciation

### Challenge Mode Usage
1. Select "🎯 Challenge Mode" from main menu
2. Choose appropriate difficulty level
3. Select correct Chinese meaning within 30 seconds
4. Consecutive correct answers earn COMBO rewards
5. Wrong answers reduce health - stay focused!

### Data Management
- All learning progress automatically saved locally
- Word bookmark status remembered
- Test scores and statistics persistent storage  
- No account registration required - privacy guaranteed

## 📚 Vocabulary Content

Carefully selected 30 core Gaokao vocabulary words, scientifically categorized:

| Chapter | Content | Count | Difficulty |
|---------|---------|-------|------------|
| **Core Basics** | High-frequency common words | 10 words | ⭐⭐ |
| **Education & Learning** | Education-related vocabulary | 5 words | ⭐⭐ |
| **Technology & Modern Life** | Modern technology vocabulary | 5 words | ⭐⭐⭐ |
| **Environment & Nature** | Environmental and nature vocabulary | 5 words | ⭐⭐⭐ |
| **Society & Culture** | Social and cultural vocabulary | 5 words | ⭐⭐⭐ |

**Complete Word Information**:
- ✅ English words + International phonetic alphabet
- ✅ Accurate Chinese definitions
- ✅ Practical example sentences
- ✅ Scientific difficulty rating (1-5 stars)
- ✅ Thematic tag classification

## 🎮 Gamification Elements

### Level System
- Gain experience points through learning and testing
- Level up every 100 experience points
- Level displayed on main interface

### Scoring Mechanism
- Base score × Word difficulty × Combo bonus
- Different difficulty modes have different score multipliers
- Track highest scores and average performance

### Combo System
- Consecutive correct answers build COMBO
- Every 5 combos earn bonus points
- Wrong answers reset combo counter

## 🛠️ Technical Architecture

### 🎨 Frontend Tech Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | Core framework |
| **TypeScript** | 4.9 | Type safety |
| **Framer Motion** | 12.x | Animation effects |
| **Lucide React** | 0.5.x | Icon components |
| **CSS Variables** | - | Theme management |

### 💾 Data Storage Strategy
- **LocalStorage** - User progress and settings persistence
- **JSON Format** - Lightweight word data structure
- **Auto-save** - Real-time learning progress sync
- **Error Handling** - Graceful storage failure tolerance

### 📱 Responsive Design
- **Mobile-First** - Mobile-first design philosophy
- **Flexbox/Grid** - Modern layout techniques
- **Pixel Art Adaptation** - Maintain retro aesthetics across screen sizes

## 🎯 Core Features

### Learning Experience Optimization
- 3D word card flip effects
- Smooth page transition animations
- Intuitive progress displays
- Instant learning feedback

### Testing Experience Optimization  
- 30-second countdown pressure
- Real-time combo displays
- Answer result effects
- Encouraging feedback messages

### Data Reliability
- Auto-save learning progress
- Error handling and fault tolerance
- Storage usage monitoring

## 📱 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📈 Project Status

- **Development Status**: ✅ MVP features complete
- **Deployment Status**: 🚀 One-click Vercel deployment supported
- **Maintenance Status**: 🛠️ Actively maintained
- **Documentation**: 📚 Complete development and deployment docs

## 🤝 Contributing

We welcome all forms of contributions!

### 🎯 Contribution Areas
- 🐛 **Bug Fixes** - Find and fix functional defects
- ✨ **New Features** - Add interesting learning features
- 📚 **Vocabulary Expansion** - Add more Gaokao vocabulary
- 🎨 **Visual Improvements** - Enhance pixel art interface effects
- 📖 **Documentation** - Improve usage and development docs
- 🔧 **Performance Optimization** - Improve app performance

### 💡 Development Guide
1. Fork this project
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add some amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Submit Pull Request

For detailed development guide, see [CLAUDE.md](./CLAUDE.md)

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- 🎮 **Visual Inspiration** - Classic Contra video game
- 🔤 **Font** - [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) by CodeMan38
- ⚛️ **Framework** - [Create React App](https://github.com/facebook/create-react-app)
- 🎭 **Icons** - [Lucide Icons](https://lucide.dev/)
- ✨ **Animation** - [Framer Motion](https://www.framer.com/motion/)

---

<div align="center">

**🎮 Make vocabulary learning as fun as playing games!** ✨

[⭐ Star Us](https://github.com/your-username/word-game-gaokao) • [🐛 Report Bug](https://github.com/your-username/word-game-gaokao/issues) • [💡 Request Feature](https://github.com/your-username/word-game-gaokao/discussions)

</div>

---

**Languages**: [简体中文](README.md) | **English** | [Deployment Guide](DEPLOYMENT.md)