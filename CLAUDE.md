# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Key Commands

### Development
```bash
npm start              # Start Expo with tunnel (default command for development)
npm run android        # Start with Android tunnel
npm run ios            # Start with iOS tunnel
```

### Code Quality
```bash
npm run typecheck      # Run TypeScript compiler check
npm test               # Run Jest tests
npm run validate       # Run both typecheck and tests
```

### Build & Deployment (via EAS)
```bash
eas build --platform ios --profile development
eas build --platform android --profile development
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Critical Development Rules

### NEVER ADD DEBUGGING TOOLS TO PRODUCTION APP
- **ABSOLUTELY FORBIDDEN**: Never add debug buttons, diagnostic tools, or developer utilities to the production app interface
- **USER EXPERIENCE**: The app must always look professional and clean for end users
- **DEBUGGING APPROACH**: Debug issues by examining code, logs, and data directly - not by adding UI tools
- **PRODUCTION READY**: Every commit should result in a production-ready app interface

## Architecture Overview

### Tech Stack
- **Frontend**: React Native + Expo (~53.0) with TypeScript (~5.8)
- **Backend**: Firebase (Auth + Firestore) - Migrated from Supabase
- **State Management**: Zustand with feature-based slices
- **Navigation**: React Navigation v6 (bottom tabs + stack)
- **UI**: React Native Elements + custom components with earth-tone theme
- **Charts**: Victory Native for statistics visualization
- **AI Integration**: Google Gemini 1.5 Flash API for habit suggestions

### Data Flow Architecture
1. **Primary Storage**: Firebase Firestore with real-time sync
2. **Offline Fallback**: AsyncStorage for complete offline functionality
3. **Optimistic Updates**: Immediate UI updates with background sync
4. **Date Handling**: Local timezone operations (not UTC) via `dateHelpers.ts`

### Key Architectural Patterns

#### 1. Feature-Based Organization
```
src/
├── components/     # Reusable UI components with barrel exports
├── screens/        # Screen components organized by feature
├── services/       # Business logic layer (Firebase, AI, notifications)
├── store/          # Zustand slices for state management
├── hooks/          # Custom React hooks
├── types/          # TypeScript definitions
└── utils/          # Pure utility functions
```

#### 2. Zustand Store Pattern
```typescript
// Combined store with feature slices
export type AppStore = HabitSlice & SettingsSlice;
export const useStore = create<AppStore>()((...args) => ({
  ...createHabitSlice(...args),
  ...createSettingsSlice(...args),
}));
```

#### 3. Service Layer Pattern
- All external API calls go through service modules
- Services handle both Firebase and offline storage
- Optimistic updates pattern for instant UI feedback

#### 4. Navigation Structure
- Bottom tab navigation with 5 tabs (Home, Habits, Statistics, Tips, Settings)
- Stack navigation for detail screens and modals
- Custom headers with earth-tone theme

## Critical Implementation Details

### Firebase Configuration
- Environment variables prefix: `EXPO_PUBLIC_FIREBASE_*`
- Hybrid architecture: Firebase primary, AsyncStorage fallback
- Authentication: Email/password with offline demo mode
- Biometric auth: Face ID/Touch ID via Expo Local Authentication

### Date/Time Handling
**IMPORTANT**: Always use local timezone, not UTC
```typescript
import { getTodayLocalDate } from '@/utils/dateHelpers';
// Returns YYYY-MM-DD in local timezone
const today = getTodayLocalDate();
```

### Optimistic Updates Pattern
```typescript
// 1. Update UI immediately
set({ todaysEntries: optimisticEntries });
// 2. Sync in background
await FirebaseDatabaseService.toggleHabitCompletion(habitId, date);
// 3. Handle errors gracefully
.catch(() => set({ todaysEntries: originalEntries }));
```

### Performance Optimizations
- Memoization with `React.memo` and `useMemo`
- Analytics calculations cached with `memoizeAsync`
- Lazy loading for heavy components
- Automatic midnight reset via `useDateTracker` hook

## Environment Setup

### Required Environment Variables
```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# AI Integration
EXPO_PUBLIC_GEMINI_API_KEY=

# Development
NODE_ENV=development
EXPO_DEBUG=true
```

### Testing on Device
1. Install Expo Go app on mobile device
2. Run `npm start` (uses tunnel by default)
3. Scan QR code with Expo Go (Android) or Camera (iOS)

## Common Development Tasks

### Adding a New Screen
1. Create screen component in `src/screens/[Feature]/`
2. Add to navigation types in `src/types/navigation.ts`
3. Register in `src/navigation/AppNavigator.tsx`
4. Export from feature's `index.ts`

### Adding a New Habit Feature
1. Update types in `src/types/habit.ts`
2. Modify Firebase service in `src/services/firebase/databaseService.ts`
3. Update Zustand slice in `src/store/slices/habitSlice.ts`
4. Add offline storage support if needed
5. Update UI components

### Working with Settings
Settings are persisted in AsyncStorage and managed via `settingsSlice.ts`. Changes apply immediately with automatic persistence.

## Key Features to Understand

### Habit Management
- Categories with earth-tone colors
- Daily/weekly/custom frequency options
- Habit stacking and implementation intentions
- Real-time streak calculations
- Monthly progress tracking

### Statistics System
- Month navigation with historical data
- Category performance analysis
- Heatmap calendars and trend charts
- Export functionality for data

### Educational Content
- 12 comprehensive habit tips
- Rotating daily tips on Home screen
- Searchable tips library in Settings
- Science-based habit formation guidance

### Security Features
- Firebase Auth with RLS policies
- Biometric authentication (Face ID/Touch ID)
- Secure credential storage with Expo SecureStore
- Offline demo mode for privacy

## Recent Development Session (August 1, 2025)

### Production Cleanup and Bug Fixes
Complete app cleanup for production readiness with all debugging tools removed and core functionality working perfectly.

#### ✅ Major Issues Resolved:

1. **Production-Ready Interface**
   - Removed all debugging tools and diagnostic buttons from app
   - Clean, professional sign-in screen without offline mode or network diagnostics
   - Professional user experience throughout the app

2. **Completion Percentages Fixed**
   - Fixed monthly progress calculation: now uses days passed vs total days in month
   - Reduced analytics cache from 10s to 1s for immediate updates after habit completion
   - Clear analytics cache after completion to ensure fresh calculations
   - Update all habit stats (not just single habit) after completion for UI consistency

3. **Authentication Improvements**
   - Fixed Firebase AsyncStorage warning with proper `initializeAuth` configuration
   - Simplified auto sign-in logic by removing complex biometric auto-login
   - Clean auth state management without debugging popups

4. **Auto-Fix Color Issue**
   - Productivity category automatically fixes to earth yellow (#D4B85A) on app load
   - No user intervention required - seamless color correction

#### 🔧 Technical Implementation:
- **Analytics Caching**: 1-second cache for near-instant stat updates
- **Monthly Progress**: `completions / daysPassedInMonth` for intuitive percentages
- **Complete Stats Refresh**: All habit stats update after any completion
- **Firebase Auth**: Proper AsyncStorage persistence configuration
- **Production Code**: Removed all console logs and debugging elements

#### ✅ Current Status:
- **Sign-in Screen**: Clean, professional, no warning popups
- **Completion Tracking**: Immediate percentage updates when habits marked complete
- **Color System**: Productivity category displays correct earth yellow
- **User Experience**: Production-ready with no debugging tools visible

## Recent Migration Notes

### Firebase Migration (July 2025)
- Migrated from Supabase to Firebase due to network restrictions
- Complete data migration system available in Settings > Advanced Tools
- Firebase-only mode flag prevents duplicate data loading
- All historical completion data preserved during migration

### Known Considerations
- iOS Simulator: Face ID falls back to passcode (hardware limitation)
- Timezone: All dates use local timezone to prevent day confusion
- Offline Mode: Full functionality without internet connection
- Performance: Optimistic updates provide instant UI feedback