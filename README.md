# Habitos - Professional Habit Tracking App

<div align="center">
  <img src="assets/icon.png" alt="Habitos Logo" width="120" height="120">
  
  **A beautiful, science-based habit tracking app built with React Native + Expo**
  
  ![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)
  ![Expo](https://img.shields.io/badge/Expo-~53.0.17-black.svg)
  ![TypeScript](https://img.shields.io/badge/TypeScript-~5.8.3-blue.svg)
  ![Supabase](https://img.shields.io/badge/Supabase-2.50.5-green.svg)
  ![License](https://img.shields.io/badge/License-MIT-yellow.svg)
</div>

## 🎯 Overview

Habitos is a production-ready habit tracking mobile app that helps users build sustainable habits through science-based guidance, visual progress tracking, and a calming earth-tone design. The app combines modern React Native architecture with comprehensive offline-first functionality.

### ✨ Key Features

- **📱 Cross-Platform**: iOS and Android support via Expo
- **🔄 Offline-First**: Full functionality without internet connection
- **🎨 Beautiful Design**: Calming earth-tone UI with modern typography
- **📊 Progress Tracking**: Visual charts and streak tracking
- **🧠 Science-Based**: Habit stacking and implementation intentions
- **🔐 Secure**: Row-level security with Supabase authentication
- **📈 Analytics**: Comprehensive progress insights and data export

## 🚀 Quick Start

### Prerequisites

- Node.js (18.0.0 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/habitos.git
   cd habitos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open in Expo Go**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)

## 📱 App Structure

### Core Features

- **🏠 Home Tab**: Today's habits, daily tips, and quick completion
- **📝 Habits Tab**: Full habit management with search and filtering
- **📊 Statistics Tab**: Progress visualization and analytics
- **⚙️ Settings Tab**: Preferences, tips library, and data management

### Technical Architecture

- **Frontend**: React Native + Expo with TypeScript
- **Backend**: Supabase (PostgreSQL + Authentication)
- **State Management**: Zustand with feature-based slices
- **Navigation**: React Navigation v6
- **Styling**: Earth-tone theme with Inter font
- **Storage**: Hybrid (AsyncStorage + Supabase sync)

## 🛠️ Development

### Available Scripts

```bash
# Development
npm start                 # Start Expo development server
npm run android          # Start with Android tunnel
npm run ios              # Start with iOS tunnel

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
npm run typecheck        # Run TypeScript compiler

# Testing & Validation
npm run test             # Run tests
npm run validate         # Run all checks (typecheck + lint + format)
```

### Project Structure

```
habitos/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components by feature
│   ├── navigation/         # Navigation configuration
│   ├── store/             # Zustand state management
│   ├── services/          # Business logic & external APIs
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Pure utility functions
│   └── styles/            # Global themes and styles
├── assets/                # Static assets
├── docs/                  # Documentation
└── .github/               # GitHub workflows
```

### Code Quality Standards

- **ESLint**: TypeScript and React Native best practices
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking
- **Husky**: Git hooks for pre-commit validation
- **Conventional Commits**: Standardized commit messages

## 🎨 Design System

### Color Palette

The app uses a carefully crafted earth-tone palette for a calming user experience:

```typescript
const colors = {
  background: '#F8F6F3',    // Warm off-white
  primary: '#8B7355',       // Warm taupe
  success: '#7A8471',       // Muted sage green
  warning: '#B8956A',       // Dusty gold
  // ... complete palette in src/styles/theme.ts
}
```

### Typography

- **Font Family**: Inter (modern, screen-optimized)
- **Scale**: Harmonious type scale with proper line heights
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

## 📊 Features in Detail

### Habit Management
- Create, edit, and delete habits with categories
- Habit stacking templates and implementation intentions
- Smart suggestions based on existing habits
- Flexible frequency settings (daily, weekly, custom)

### Progress Tracking
- Real-time streak calculations
- Monthly progress visualization
- Historical trend analysis
- Category-based performance insights

### Offline-First Architecture
- Complete functionality without internet
- Automatic sync when connection restored
- Conflict resolution for concurrent edits
- Local data persistence with AsyncStorage

### Educational Content
- Science-based habit formation tips
- Daily rotating guidance
- Comprehensive tips library
- Habit stacking and implementation strategies

## 🔐 Security & Privacy

- **Authentication**: Secure email/password with Supabase Auth
- **Data Protection**: Row-level security (RLS) policies
- **Local Storage**: Secure credential storage with Expo SecureStore
- **Privacy-First**: Local data processing with optional cloud sync

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

Testing stack:
- Jest for unit testing
- React Native Testing Library for component testing
- Detox for E2E testing (coming soon)

## 📦 Deployment

### Development Build
```bash
# Create development build
eas build --platform ios --profile development
eas build --platform android --profile development
```

### Production Build
```bash
# Create production build
eas build --platform ios --profile production
eas build --platform android --profile production
```

### App Store Deployment
```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run validation: `npm run validate`
5. Commit your changes: `git commit -m 'feat: add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Architecture Guide](docs/architecture.md)
- [Deployment Guide](docs/deployment.md)
- [Testing Guide](docs/testing.md)
- [Contributing Guide](CONTRIBUTING.md)

## 🛣️ Roadmap

- [ ] **v1.1**: Social features and habit sharing
- [ ] **v1.2**: Apple Watch and Android Wear support
- [ ] **v1.3**: Advanced analytics and insights
- [ ] **v1.4**: Habit templates and community features
- [ ] **v2.0**: Web app and desktop clients

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing React Native toolchain
- [Supabase](https://supabase.com/) for the backend infrastructure
- [React Navigation](https://reactnavigation.org/) for navigation
- [Zustand](https://zustand-demo.pmnd.rs/) for state management
- [Victory](https://formidable.com/open-source/victory/) for data visualization

## 📞 Support

- 📧 Email: support@habitos.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/habitos/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/habitos/discussions)

---

<div align="center">
  Made with ❤️ by the Habitos team
</div>