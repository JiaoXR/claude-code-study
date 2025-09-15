# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based vocabulary learning web application with a retro pixel art (Contra-style) theme designed for high school students preparing for Chinese college entrance exams (Gaokao). The app gamifies English vocabulary learning through study modes and quiz challenges.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (opens at http://localhost:3000)
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode (default for npm test)
npm test -- --watchAll

# Run a specific test file
npm test WordCard.test.tsx

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Deploy to Vercel (production)
npm run deploy

# Deploy to Vercel (preview)
npm run deploy-preview

# One-click deployment using script
./deploy.sh
```

## Architecture Overview

### Core Application Flow
The app uses a simple state-based navigation system in `App.tsx` with modes: `menu | study | test | favorites | stats`. State management is handled through React hooks without external state libraries.

### Key Architectural Patterns

**Data Layer:**
- `src/types/word.ts` - Core TypeScript interfaces for Word, WordProgress, StudySession, UserStats, GameState
- `src/data/words.ts` - Static vocabulary data organized by chapters/themes with helper functions
- `src/utils/storage.ts` - Singleton LocalStorage service managing all persistent data

**UI Layer:**
- `src/components/ui/` - Reusable pixel-art styled UI components (PixelButton, PixelCard, HealthBar, etc.)
- `src/styles/pixelart.css` - Global pixel art theme with CSS variables for colors and animations
- Component structure: MainMenu → StudyMode/TestMode → WordCard/QuizQuestion

**State Management:**
- LocalStorage-based persistence via StorageService singleton
- Progress tracking for individual words (learned, favorited, correct/incorrect counts)
- Session-based learning analytics and user statistics
- No external state management library - uses React built-in state

### Data Storage Strategy

All user data persists in browser LocalStorage with these key patterns:
- `wordGame_*` prefixed keys for data isolation
- JSON serialization with error handling for storage failures
- Automatic migration of Date objects when loading from storage
- Singleton service pattern ensuring consistent data access

### Visual Theme Implementation

The pixel art aesthetic is achieved through:
- CSS custom properties in `pixelart.css` defining the color palette
- Press Start 2P Google Font for authentic retro typography
- Framer Motion for smooth animations while maintaining pixel-perfect styling
- Component-level style isolation using CSS classes with `pixel-` prefix

### Testing Strategy

Built on Create React App's testing setup:
- Uses React Testing Library for component testing
- Jest for test running and assertions
- Components should be tested for user interactions rather than implementation details
- Focus on testing the learning workflow and data persistence

## Key Technical Considerations

**Word Data Structure:**
Words are organized by chapters with difficulty ratings (1-5). Each word contains English/Chinese pairs, pronunciation, examples, and metadata for progress tracking.

**Progress Tracking:**
The StorageService tracks learning patterns including correct/incorrect counts, study streaks, favorited words, and session analytics to provide meaningful progress feedback.

**Responsive Design:**
Uses CSS Grid/Flexbox with mobile-first approach while maintaining the pixel art aesthetic across screen sizes.

**Performance:**
- Static word data is imported at build time
- LocalStorage operations are wrapped in try/catch for reliability
- Framer Motion animations are optimized for 60fps performance

## Component Dependencies

Major external dependencies:
- `framer-motion` - Animations and transitions
- `lucide-react` - Icon components
- TypeScript - Type safety throughout the application

The UI component library in `src/components/ui/` provides the foundation for all visual elements and should be used consistently for new features.

## Deployment Configuration

**Vercel Setup:**
- `vercel.json` configures static build deployment with `@vercel/static-build`
- Routes configured for SPA with fallback to `index.html`
- Build output directory set to `build`
- Project name: `word-game-gaokao`

**Build Analysis:**
- Main bundle: ~110kB (gzipped)
- CSS bundle: ~2kB (gzipped)
- Optimized for production with code splitting

**Deployment Scripts:**
- `deploy.sh` provides interactive deployment with build verification
- Supports both preview and production deployments
- Includes error handling and user prompts