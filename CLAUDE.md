# Habitos - React Native Habit Tracking App

## 🎯 Project Overview

**Goal**: Professional habit tracking mobile app with educational guidance and progress visualization
**Platform**: Cross-platform (iOS/Android) using React Native + Expo
**Development Environment**: Windows with Ubuntu WSL
**Current Status**: ✅ Phases 1-6 Complete, Ready for Phase 7: Advanced Features

### Core Mission
Create a calming, educational habit tracking app that helps users build sustainable habits through:
- Science-based guidance (habit stacking, implementation intentions)
- Visual progress tracking with monthly insights
- Peaceful earth-tone design that reduces stress
- Professional code structure for maintainability

## 🏗️ Tech Stack

### Framework & Tools
- **React Native + Expo**: Cross-platform development with TypeScript
- **Navigation**: React Navigation v6 (bottom tabs + stack navigation)
- **State Management**: Zustand with feature-based slices
- **Backend**: Supabase (PostgreSQL + real-time APIs)
- **Storage**: Hybrid (AsyncStorage + Supabase cloud sync)
- **Authentication**: Supabase Auth with social logins
- **UI Components**: React Native Elements + custom components
- **Charts**: Victory Native for data visualization
- **Notifications**: Expo Notifications for local reminders
- **Typography**: Inter font for modern, highly legible text

### Development Tools
- **Testing**: Expo Go app on physical device
- **Build**: Expo cloud build for iOS, local APK for Android
- **Code Style**: TypeScript strict mode, barrel exports, path aliases

## 🎨 Design System

### Color Palette (Pastel/Earth Tones)
```typescript
const colors = {
  // Base Colors
  background: '#F8F6F3',      // Warm off-white
  surface: '#FFFFFF',         // Pure white for cards
  textPrimary: '#2D2A26',     // Warm dark brown
  textSecondary: '#6B6560',   // Muted brown-gray
  border: '#E8E4E0',          // Soft beige

  // Accent Colors
  primary: '#8B7355',         // Warm taupe (main buttons)
  secondary: '#A4956B',       // Sage olive (secondary actions)
  success: '#7A8471',         // Muted sage green (completed habits)
  warning: '#B8956A',         // Dusty gold (reminders)
  error: '#A67C7C',           // Dusty rose (validation errors)

  // Category Colors
  health: '#9CAF88',          // Soft sage
  productivity: '#A4956B',    // Warm olive
  personalCare: '#C4A484',    // Dusty peach
  learning: '#8FA4B2',        // Dusty blue
  fitness: '#A67C7C',         // Dusty rose
  mindfulness: '#9B8BA4',     // Soft lavender-gray
  social: '#B8956A',          // Warm sand
  creative: '#A49B8B'         // Mushroom
}
```

### Typography System
```typescript
const typography = {
  // Font: Inter (modern, screen-optimized)
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '500', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  button: { fontSize: 16, fontWeight: '500', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 }
}
```

### UI Design Patterns
- **Card-Based Design**: Rounded corners (12px), subtle shadows, proper spacing
- **Bottom Sheet Modals**: For add/edit actions, non-intrusive overlays
- **Progress Visualization**: Circular rings, linear bars, earth-tone color coding
- **Modern Tab Bar**: Clean icons, smooth transitions
- **Micro-Interactions**: Satisfying animations, haptic feedback
- **8pt Grid System**: Consistent spacing (4, 8, 16, 24, 32, 48)

## 📱 App Structure & Features

### 🏠 Home Tab - "Today's Focus"
**Purpose**: Quick daily habit tracking and motivation

**Components**:
- **Header**: Personalized greeting, current date
- **Daily Tips Section**: Rotating habit formation guidance
  - Habit stacking templates
  - Implementation intention examples
  - Science-based insights (66-day formation, not 21)
- **Today's Habits List**: 
  - Quick completion checkboxes
  - Streak indicators with fire icons
  - Category color coding
- **Monthly Progress Bar**: 
  - Overall completion percentage
  - Category breakdown with mini bars
- **Motivational Elements**: Encouraging messages, streak highlights

### 📝 Habits Tab - "Manage Everything"
**Purpose**: Full habit CRUD operations and organization

**Components**:
- **Habits List View**:
  - Search and filter functionality
  - Category filter pills
  - Sort options (name, streak, category, date)
  - Monthly progress mini-bars on each card
- **Smart Add/Edit Habit**:
  - Contextual habit stacking suggestions
  - Implementation intention templates
  - Category selection with color coding
  - Frequency settings (daily, weekly, custom)
  - Reminder time configuration
- **Habit Detail View**:
  - Calendar view of completion history
  - Detailed statistics and trends
  - Notes and reflection space
  - Edit/delete options
- **Categories Management**: Create, edit, color-code categories

### 📊 Statistics Tab - "Insights & Progress"
**Purpose**: Data visualization and habit analytics

**Components**:
- **Monthly Progress Dashboard**:
  - Large circular progress rings
  - Current month completion percentage
  - Category performance breakdown
- **Historical Comparison Views**:
  - Line charts showing monthly trends over time
  - Heatmap calendar with daily completion data
  - Month-to-month and year-over-year comparisons
  - Personal records and achievements
- **Detailed Analytics**:
  - Individual habit performance charts
  - Pattern recognition and insights
  - Best/worst performing periods
  - Streak analysis and milestone tracking
- **Export Functionality**: CSV data export with date ranges

### ⚙️ Settings Tab - "Customize & Learn"
**Purpose**: App configuration and comprehensive education

**Components**:
- **App Preferences**:
  - Notification settings and customization
  - Theme selection (light/dark/auto)
  - Color scheme customization
- **Tips & Guidance Library**:
  - **Habit Formation Science**: 66-day timeline, compound effects
  - **Habit Stacking Guide**: Templates and examples
  - **Implementation Intentions**: When-then planning strategies
  - **Common Challenges**: Troubleshooting and solutions
  - **Success Stories**: Real user examples and inspiration
- **Data Management**: 
  - Local storage information
  - Data export options
  - Privacy settings

## 💡 Educational Content System

### Daily Tips Integration
**Locations**:
- **Home Tab**: Rotating daily tips between habit list and progress
- **Add Habit**: Smart suggestions for stacking and implementation
- **Settings**: Comprehensive tips library for deep learning

**Content Categories**:
1. **Habit Formation Science**:
   - "It takes 18-254 days to form a habit (average 66 days), not 21"
   - Habit loop: Cue → Routine → Reward
   - Compound effect: 1% better daily = 37x better yearly

2. **Habit Stacking Techniques**:
   - Formula: "After I [existing habit], I will [new habit]"
   - Examples: "After I pour coffee, I will write 3 gratitudes"
   - Tips: Use specific existing habits, keep new habits under 2 minutes

3. **Implementation Intentions**:
   - Formula: "When [situation], then I will [habit]"
   - Location-based: "When I enter kitchen, I will drink water"
   - Time-based: "When my 7 AM alarm rings, I will meditate"

### Smart Tip Delivery
- **Contextual**: Based on user patterns and struggles
- **Personalized**: Adapted to user's existing habits
- **Progressive**: Basic → advanced techniques over time
- **Interactive**: Implementation tools and templates

## 📈 Progress Tracking System

### Monthly Progress Bars
**Implementation Locations**:
- **Home Tab**: Overall monthly completion with category breakdown
- **Statistics Tab**: Historical comparison charts and heatmaps
- **Habit Cards**: Individual habit monthly progress
- **Habit Detail**: Monthly timeline with scrollable history

**Visual Design**:
- **Linear Bars**: Earth-tone gradients from empty to complete
- **Circular Rings**: Apple Watch-style progress indicators
- **Segmented Bars**: Each segment represents one day
- **Color Coding**: Performance-based (green 80%+, yellow 60-79%, etc.)

**Calculation Logic**:
```typescript
const monthlyProgress = {
  daily: completedDays / totalDaysInMonth,
  weekly: completedWeeks / totalWeeksInMonth,
  custom: completedTargetDays / totalTargetDaysInMonth
}
```

### Historical Comparison Views
- **Monthly Trend Charts**: Line graphs with earth-tone color coding
- **Heatmap Calendars**: Daily completion visualization
- **Year-over-Year Analysis**: Performance comparison across years
- **Personal Records**: Best streaks, perfect months, milestones
- **Pattern Recognition**: Insights and recommendations

## 📁 Professional Project Structure

```
habitos/
├── CLAUDE.md                   # This documentation file
├── App.tsx                     # Main app entry point
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── common/            # Generic components (Button, Modal, etc.)
│   │   ├── habit/             # Habit-specific (HabitCard, ProgressRing, etc.)
│   │   ├── charts/            # Chart components for statistics
│   │   └── index.ts           # Barrel exports
│   ├── screens/               # Screen components organized by feature
│   │   ├── Home/              # Today's habits, quick actions
│   │   ├── Habits/            # CRUD operations, management
│   │   ├── Statistics/        # Charts, analytics, insights
│   │   ├── Settings/          # Preferences, tips library
│   │   └── index.ts
│   ├── navigation/            # Navigation configuration
│   │   ├── AppNavigator.tsx   # Main navigator setup
│   │   ├── TabNavigator.tsx   # Bottom tab navigation
│   │   ├── types.ts           # Navigation type definitions
│   │   └── index.ts
│   ├── store/                 # Zustand state management
│   │   ├── slices/            # Feature-based state slices
│   │   │   ├── habitSlice.ts
│   │   │   ├── settingsSlice.ts
│   │   │   └── index.ts
│   │   ├── store.ts           # Main store configuration
│   │   └── index.ts
│   ├── services/              # Business logic & external services
│   │   ├── storage/           # AsyncStorage wrapper
│   │   ├── notifications/     # Local notification service
│   │   ├── analytics/         # Habit calculation logic
│   │   └── index.ts
│   ├── hooks/                 # Custom React hooks
│   │   ├── useHabits.ts
│   │   ├── useStorage.ts
│   │   ├── useNotifications.ts
│   │   └── index.ts
│   ├── types/                 # TypeScript definitions
│   │   ├── habit.ts
│   │   ├── category.ts
│   │   ├── analytics.ts
│   │   └── index.ts
│   ├── utils/                 # Pure utility functions
│   │   ├── dateHelpers.ts
│   │   ├── validation.ts
│   │   ├── formatters.ts
│   │   └── index.ts
│   ├── styles/                # Global themes and styles
│   │   ├── theme.ts           # Color schemes, typography
│   │   ├── globalStyles.ts    # Common styles
│   │   └── index.ts
│   └── __tests__/             # Test files mirroring structure
├── assets/                    # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
└── docs/                     # Additional documentation
```

## 🚀 Implementation Phases - COMPLETED STATUS

### ✅ Phase 1: Infrastructure Setup 
- ✅ Create CLAUDE.md documentation
- ✅ Set up professional directory structure with barrel exports
- ✅ Install core dependencies (navigation, Zustand, UI components)
- ✅ Configure TypeScript path aliases and type definitions
- ✅ Implement earth-tone theme system

### ✅ Phase 2: Navigation & Basic Screens 
- ✅ Implement 5-tab navigation (Home, Habits, Stats, Tips, Settings)
- ✅ Create screen components with proper TypeScript
- ✅ Set up navigation types for type-safe routing
- ✅ Test navigation flow on device with beautiful earth-tone UI

### ✅ Phase 3: Authentication & Backend Integration
- ✅ Supabase backend setup with PostgreSQL database
- ✅ Complete database schema (users, habits, categories, entries)
- ✅ Authentication system with email/password and offline demo mode
- ✅ Zustand store with Supabase integration
- ✅ Real-time cloud data sync

### ✅ Phase 4: Interactive Habit Management
- ✅ Add Habit screen with smart suggestions and habit stacking
- ✅ Category selection with earth-tone color coding
- ✅ Habit creation with implementation intentions
- ✅ Form validation and cloud storage

### ✅ Phase 5: Real Data Integration
- ✅ Habits screen loads real user data from Supabase
- ✅ Dynamic category filtering
- ✅ Real habit cards with progress bars and streaks
- ✅ Loading states and error handling

### ✅ Phase 6: Notification System - COMPLETED
- ✅ Create notification service with Expo Notifications
- ✅ Add permission request flow to app initialization  
- ✅ Integrate notification scheduling into habit creation
- ✅ Create notification settings UI in Settings tab
- ✅ Implement habit reminder notifications with scheduling

### ✅ Phase 7: Advanced Features - COMPLETED
- ✅ Make Home tab checkboxes functional with real completion tracking
- ✅ Implement real streak calculations and progress tracking with memoization
- ✅ Add visual feedback and animations for habit completion with haptics
- ✅ Create habit detail view with interactive calendar history
- ✅ Add comprehensive habit editing functionality with deletion
- ✅ Implement real-time analytics and insights with data export

### ✅ Phase 8: Polish & Launch - COMPLETED
- ✅ Performance optimization with React.memo, useMemo, and caching
- ✅ Comprehensive error handling with ErrorBoundary and graceful failures
- ✅ Complete app store metadata, privacy policy, and legal documentation
- ✅ Final testing checklist and edge case handling
- ✅ Production deployment configuration with EAS Build
- ✅ Post-launch monitoring and maintenance documentation

## 📝 Key Decisions Made

### Technical Decisions
- **React Native + Expo**: Chosen for cross-platform development on Windows/WSL
- **Zustand over Redux**: Simpler state management for this app size
- **AsyncStorage**: Local storage for privacy, no cloud sync initially
- **Victory Native**: Charts library that works well with Expo
- **TypeScript**: Strict typing for better code quality

### Design Decisions
- **Earth-tone palette**: Calming colors to reduce habit-tracking stress
- **Inter font**: Modern, highly legible typography
- **Card-based design**: Familiar, organized information presentation
- **Monthly progress focus**: Clear, motivating progress visualization

### Feature Decisions
- **Educational integration**: Tips and guidance built into the experience
- **Habit stacking emphasis**: Core feature based on Atomic Habits principles
- **Cloud Backend**: Supabase for scalability, social features, and App Store readiness
- **Progress celebration**: Milestone animations and achievements

## 🎯 Success Metrics
- **User Engagement**: Daily active usage, habit completion rates
- **Educational Impact**: Tips interaction, habit stacking adoption
- **Progress Motivation**: Monthly milestone celebrations, streak achievements
- **Visual Appeal**: Earth-tone palette creating calming experience

---

## 🏗️ Backend Infrastructure (Supabase)

### Database Setup ✅
- **Project URL**: `https://ynucnsbytysmsjugozzt.supabase.co`
- **Database**: PostgreSQL with complete schema implemented
- **Tables**: users, categories, habits, habit_entries, friendships, shared_progress, user_preferences
- **Security**: Row Level Security (RLS) policies implemented
- **Authentication**: Supabase Auth with secure token storage

### Current Implementation Status ✅
- ✅ **Phase 1**: Infrastructure (theme, structure, dependencies)
- ✅ **Phase 2**: Navigation (4 tabs with earth-tone UI)
- ✅ **Supabase Setup**: Database, schema, authentication service
- 🔄 **Phase 3A**: Authentication screens (in progress)
- ⏳ **Phase 3B**: Real habit data management

---

## 🔄 Recent Session Updates (July 2025)

### **Previous Session: Bug Fixes & UX Improvements**
Major refinements and fixes to enhance user experience and data accuracy.

#### **✅ Critical Fixes Completed:**

1. **Fixed Habit Color System** 
   - Reverted to category-based coloring (user preference)
   - Habits now properly grouped by category colors for better visual organization

2. **Added Learning Category**
   - New default category with dusty blue color and book icon
   - Auto-migration system ensures existing users get new category
   - Now 4 default categories: Health, Productivity, Fitness, Learning

3. **Fixed Calendar Interaction & Search Functionality**
   - Habit detail calendar now fully functional for date selection
   - Search bar on habits tab now fully functional with real-time filtering
   - Corrected progress calculations and enhanced statistics accuracy

4. **Optimized UI & Frequency Display**
   - Removed SafeAreaView gaps, added proper padding, fixed chart layouts
   - All frequency text properly capitalized ("Daily" not "daily")

---

### **Current Session: Complete Settings Implementation & Midnight Reset**

#### **🚀 Major Features Added:**

### **1. Complete Settings Functionality**
- ✅ **Settings State Management**: Full `settingsSlice.ts` with AsyncStorage persistence
- ✅ **Profile Screen**: User stats, achievements, progress tracking with real calculations
- ✅ **Tips Library**: Searchable, categorized tips with bookmarking (12 comprehensive tips)
- ✅ **Appearance Settings**: Theme selection, font size, color scheme customization
- ✅ **Data Backup**: Export/import functionality with auto-backup settings
- ✅ **Help & Support**: FAQ, troubleshooting, getting started guide
- ✅ **About Screen**: App information, credits, legal documents, version details
- ✅ **Data Sync**: Privacy-focused data management information

### **2. Midnight Reset System**
- ✅ **Date Tracker Hook**: `useDateTracker` monitors date changes every minute
- ✅ **Automatic Reset**: Habit checkmarks reset exactly at midnight (user timezone)
- ✅ **Seamless UX**: No interruption, just fresh state when date changes
- ✅ **Data Refresh**: Today's entries reload automatically for new day

### **3. Enhanced Tips System**
- ✅ **Extended Tips Collection**: Expanded from 6 to 12 comprehensive tips
- ✅ **Categorized Tips**: Getting Started, Habit Stacking, Psychology, Environment, Motivation
- ✅ **Unified Content**: Same tips appear in Home daily rotation, Tips tab, and Tips Library
- ✅ **Better Learning**: More detailed habit formation strategies and techniques

#### **🔧 Technical Implementations:**

### **Settings Architecture:**
- **State Management**: Settings slice with theme, font size, color scheme, backup preferences
- **Navigation**: 7 new screens properly registered in AppNavigator with custom headers
- **Data Persistence**: AsyncStorage integration with error handling and default values
- **Real-time Updates**: Settings changes apply immediately with proper validation

### **Navigation Structure:**
```typescript
// All settings screens now functional:
Profile → ProfileScreen (stats, achievements, app reset)
DataSync → DataSyncScreen (privacy-focused data management)
TipsLibrary → TipsLibraryScreen (searchable tips with categories)
Appearance → AppearanceScreen (theme, font, color customization)
DataBackup → DataBackupScreen (export/import with auto-backup)
HelpSupport → HelpSupportScreen (FAQ, troubleshooting)
About → AboutScreen (app info, legal, version details)
```

### **Enhanced Tips Data:**
```typescript
// Extended from 6 to 12 tips with categories:
EXTENDED_HABIT_TIPS = [
  ...original 6 tips + 6 new comprehensive tips
  // Categories: getting-started, habit-stacking, psychology, environment, motivation
]
```

#### **✅ Current Technical Status:**
- **Architecture**: Offline-first AsyncStorage + Zustand with full settings management
- **Navigation**: Complete settings flow with 7 functional screens
- **Data Management**: Export/import, backup settings, privacy-focused design
- **User Experience**: Profile stats, achievements, comprehensive help system
- **Content**: 12 categorized tips across all screens with consistent rotation
- **Time Management**: Automatic midnight reset with timezone awareness

#### **✅ User Experience Improvements:**
- **Complete Settings**: All buttons functional with professional-grade features
- **Automatic Reset**: Habits reset at midnight without user intervention
- **Rich Content**: Extended tips library with search, categories, bookmarking
- **Progress Tracking**: Real user statistics with achievement system
- **Help System**: Comprehensive FAQ, getting started guide, troubleshooting
- **Privacy Focus**: Local-first design with export options for backup

---

**Last Updated**: 2025-07-14  
**Current Phase**: ✅ Phase 9 Complete - FULL FEATURED PRODUCTION APP  
**Architecture**: ✅ Complete Offline-First with Settings Management & Auto-Reset  
**App Status**: 🚀 PRODUCTION READY - All Features Functional Including Settings  
**Settings Status**: ✅ 100% Functional - Profile, Tips, Appearance, Backup, Help, About  
**Next Priority**: App store submission or additional advanced features