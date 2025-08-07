# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Key Commands

### Development (Flutter)
```bash
~/flutter/bin/flutter run -d "00008120-000A21AE1482201E"    # Run on connected iPhone
~/flutter/bin/flutter run -d "00008120-000A21AE1482201E" --hot  # Run with hot reload
~/flutter/bin/flutter devices                              # List connected devices
~/flutter/bin/flutter clean                               # Clean build cache
~/flutter/bin/flutter pub get                            # Install dependencies
```

### Code Quality
```bash
~/flutter/bin/flutter analyze     # Run Dart analyzer
~/flutter/bin/flutter test        # Run unit tests
```

### Build & Deployment
```bash
~/flutter/bin/flutter build ios --no-codesign    # Build iOS without code signing
~/flutter/bin/flutter build ios --release        # Build iOS release
```

## Critical Development Rules

### NEVER ADD DEBUGGING TOOLS TO PRODUCTION APP
- **ABSOLUTELY FORBIDDEN**: Never add debug buttons, diagnostic tools, or developer utilities to the production app interface
- **USER EXPERIENCE**: The app must always look professional and clean for end users
- **DEBUGGING APPROACH**: Debug issues by examining code, logs, and data directly - not by adding UI tools
- **PRODUCTION READY**: Every commit should result in a production-ready app interface

## Architecture Overview

### Tech Stack
- **Frontend**: Flutter (~3.32.8) with Dart (~3.6.0)
- **Backend**: Firebase (Auth + Firestore) - Ready for integration
- **State Management**: Provider pattern with feature-based providers
- **Navigation**: GoRouter for declarative routing
- **UI**: Custom components with earth-tone theme system
- **Platform**: iOS-first development (iPhone testing)

### Data Flow Architecture
1. **Primary Storage**: Firebase Firestore (ready for integration)
2. **Offline Fallback**: Local SQLite database (planned)
3. **Optimistic Updates**: Immediate UI updates with background sync
4. **Date Handling**: Local timezone operations via `dateHelpers.dart`

### Key Architectural Patterns

#### 1. Feature-Based Organization
```
lib/
├── core/              # Core utilities, themes, constants
├── data/              # Models and data structures
├── navigation/        # App routing configuration  
├── presentation/      # UI layer (screens, widgets, providers)
└── main.dart         # App entry point
```

#### 2. Provider Pattern
```dart
// State management with Provider
class HabitsProvider with ChangeNotifier {
  List<Habit> _habits = [];
  // Business logic and state updates
}
```

#### 3. GoRouter Navigation
```dart
// Declarative routing with nested routes
GoRoute(
  path: '/habits',
  builder: (context, state) => const HabitsScreen(),
  routes: [
    GoRoute(
      path: 'add',
      builder: (context, state) => const AddHabitScreen(),
    ),
  ],
),
```

## Critical Implementation Details

### Earth-Tone Color System
- **Primary Colors**: Browns, beiges, earth yellows
- **NO BLUE COLORS**: Replaced with warm sand tones
- **Psychology Category**: Dark earthy orange (#B87333)
- **Category Colors**: Each habit category has unique earth-tone color

### Date/Time Handling
**IMPORTANT**: Always use local timezone, not UTC
```dart
import '../../core/utils/date_helpers.dart';
// Returns YYYY-MM-DD in local timezone
final today = DateHelpers.getTodayLocalDate();
```

### Typography System
- **Font**: System default for friendly appearance
- **Sizes**: Reduced for softer, more approachable look
- **Weights**: w500-w600 instead of bold for gentler appearance

## Environment Setup

### Required Environment Variables
```bash
# Firebase Configuration (when integrated)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# AI Integration
EXPO_PUBLIC_GEMINI_API_KEY=
```

### Testing on Device
1. Connect iPhone via USB-C
2. Run `~/flutter/bin/flutter devices` to verify connection
3. Run `~/flutter/bin/flutter run -d "00008120-000A21AE1482201E"`
4. App launches directly on device

## Major Features Implemented

### ✅ Complete Flutter Migration (January 2025)
**Migration from React Native to Flutter:**
- Clean slate setup with optimized project structure
- Feature-based architecture with proper separation of concerns
- All React Native/Expo files removed and replaced with Flutter equivalents
- iOS deployment successfully configured and tested on device

### ✅ Core App Structure
**Navigation & Routing:**
- 5-tab bottom navigation (Home, Habits, Statistics, Tips, Settings)
- Stack navigation for detail screens and modals
- GoRouter for type-safe routing with nested routes

**Theme System:**
- Comprehensive earth-tone color palette
- Typography system with friendly, readable fonts
- Consistent spacing and styling across all screens
- Dark earthy orange for psychology category (#B87333)

### ✅ Screen Implementation
**All Major Screens Completed:**
1. **Sign-In Screen**: Clean authentication interface
2. **Home Screen**: Daily tip, today's habits, progress tracking
3. **Habits Screen**: Habit list with add functionality
4. **Add Habit Screen**: Complete habit creation with categories, icons, frequency
5. **Statistics Screen**: Month navigation, 6-month bar graph, habit progress
6. **Tips Screen**: Categorized habit tips with earth-tone category badges
7. **Settings Screen**: User preferences and app settings

### ✅ Advanced Features

**Gamification & Streaks:**
- Comprehensive streak tracking system
- Weekly milestones (7, 14, 21, 28, 35, 42, 49, 56 days)
- Major milestones (30, 90, 365 days)  
- Achievement badges with unique icons and earth-tone colors
- Celebration notifications for milestone achievements
- Streak counters displayed on habit cards with fire icons

**Statistics & Analytics:**
- Month navigation with arrow controls
- 6-month comparison bar graph with proper sizing
- Individual habit progress bars with category colors
- Monthly completion percentages
- Data changes dynamically based on selected month
- Overview cards showing total habits, completed today, monthly goals

**User Experience:**
- Pull-to-refresh functionality on all screens with feedback
- Optimistic UI updates for instant feedback
- Loading states and error handling
- Success notifications with visual feedback
- Earth-tone color coordination throughout

### ✅ UI/UX Enhancements
**Typography & Visual Appeal:**
- Softer, more friendly font system
- Reduced header sizes and weights
- Improved letter spacing and readability
- Visual hierarchy with consistent styling

**Interactive Elements:**
- Icon selection grid for habits (16+ icons)
- Category selection with visual indicators
- Frequency options (Daily, Weekly, Custom)
- Time picker for habit reminders
- Form validation and error messaging

**Responsive Design:**
- Proper spacing and padding systems
- Card-based layouts with shadows and borders
- Mobile-optimized touch targets
- Smooth animations and transitions

## Current Status

### ✅ Ready for Use
- **Core Functionality**: All main features implemented and working
- **Device Testing**: Successfully running on iPhone via USB connection
- **UI Polish**: Earth-tone theme, friendly typography, gamification complete
- **Navigation**: All screens accessible and properly connected

### 🔄 Next Phase (Ready for Development)
- **Firebase Integration**: Connect authentication and data persistence
- **Offline Storage**: Implement SQLite for offline-first functionality  
- **Push Notifications**: Add reminder system
- **Data Persistence**: Connect habit creation/completion to real storage
- **Biometric Authentication**: Face ID/Touch ID integration

### 📱 Testing
- **Primary Device**: iPhone (00008120-000A21AE1482201E)
- **Hot Reload**: Working for rapid development
- **Pull-to-Refresh**: Implemented with user feedback
- **Touch Interactions**: All buttons and gestures working properly

## Development Notes

### Flutter-Specific Considerations
- iOS Simulator: Face ID falls back to passcode (hardware limitation)
- Hot Reload: Automatic on file changes, manual trigger available
- Device Connection: USB-C required for iPhone testing
- Build System: Xcode integration for iOS deployment

### Known Architecture Decisions
- **Provider Pattern**: Chosen over Riverpod/Bloc for simplicity
- **GoRouter**: Declarative routing over imperative Navigator
- **Earth-Tone Only**: No blue colors in entire app palette
- **Local Timezone**: All date operations use device timezone
- **iOS-First**: Primary development and testing platform

## Recent Migration Session (January 2025)

### Complete React Native to Flutter Migration
Successfully migrated the entire Habitos app from React Native/Expo to Flutter with significant improvements and new features.

#### ✅ Migration Accomplished:

1. **Clean Architecture Setup**
   - Removed all React Native/Expo dependencies and files
   - Created Flutter project with iOS platform configuration
   - Implemented feature-based architecture with proper separation
   - Set up Provider state management with clean patterns

2. **Complete UI Implementation**
   - All 7 major screens fully implemented and functional
   - Earth-tone color system with psychology category improvements
   - Friendly typography with softer, more approachable styling
   - Comprehensive theme system with consistent spacing

3. **Advanced Gamification System**
   - Weekly streak milestones (every 7 days from 7-56+ days)
   - Major achievement milestones (30, 90, 365 days)
   - Visual achievement badges with unique icons and colors
   - Streak counters with fire icons on habit cards
   - Celebration notifications for milestone achievements

4. **Enhanced Statistics**
   - Month navigation with arrow controls for historical data
   - 6-month comparison bar graph with proper sizing
   - Individual habit progress bars matching category colors
   - Dynamic data that changes based on selected month
   - Comprehensive overview with multiple metrics

5. **Complete Add Habit Functionality**
   - Full form with name, description, category selection
   - Icon picker with 16+ habit icons in grid layout
   - Frequency selection (Daily, Weekly, Custom)
   - Optional reminder time picker
   - Form validation and success feedback
   - Proper navigation and state management

6. **Production-Ready Polish**
   - Pull-to-refresh with user feedback on all screens
   - Loading states and error handling throughout
   - Optimistic UI updates for instant responsiveness
   - Clean, professional interface without debugging tools
   - Consistent earth-tone styling across all components

#### 🔧 Technical Achievements:
- **iOS Deployment**: Successfully configured and tested on physical iPhone
- **Hot Reload**: Working development workflow with instant updates
- **State Management**: Provider pattern with proper separation of concerns
- **Navigation**: GoRouter with nested routes and type safety
- **Theme System**: Comprehensive design system with earth tones only
- **User Experience**: Gamified habit tracking with streak celebrations

#### ✅ Current Status:
- **Fully Functional**: All core features implemented and working
- **Device Tested**: Running perfectly on iPhone hardware
- **UI Complete**: Production-ready interface with earth-tone styling
- **Gamification**: Comprehensive streak system with achievements
- **Statistics**: Advanced analytics with month navigation and progress tracking

The app is now a complete, gamified habit tracking experience built in Flutter with a clean architecture and beautiful earth-tone design system.