# Contributing to Habitos

Thank you for your interest in contributing to Habitos! This guide will help you get started with contributing to our habit tracking app.

## 🎯 Ways to Contribute

- 🐛 **Bug Reports**: Found a bug? Report it!
- ✨ **Feature Requests**: Have an idea? We'd love to hear it!
- 📖 **Documentation**: Help improve our docs
- 🧪 **Testing**: Help us test new features
- 💻 **Code**: Submit bug fixes or new features

## 🚀 Getting Started

### Prerequisites

- Node.js (18.0.0 or higher)
- npm or yarn
- Expo CLI
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/habitos.git
   cd habitos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

4. **Run the app**
   ```bash
   npm start
   ```

## 📝 Development Guidelines

### Code Style

We focus on TypeScript best practices and consistent code organization:

### TypeScript

- Use strict TypeScript
- Define proper types for all props and state
- Avoid `any` type when possible
- Use interfaces for object types

### Component Guidelines

```typescript
// Good: Proper TypeScript interface
interface HabitCardProps {
  habit: Habit;
  onPress: (habitId: string) => void;
  showProgress?: boolean;
}

export function HabitCard({ habit, onPress, showProgress = true }: HabitCardProps) {
  // Component implementation
}
```

### Styling

- Use the existing design system (`src/styles/theme.ts`)
- Follow the earth-tone color palette
- Use consistent spacing from the spacing scale
- Prefer StyleSheet.create over inline styles

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Writing Tests

```typescript
// Example test
import { render, fireEvent } from '@testing-library/react-native';
import { HabitCard } from '../HabitCard';

describe('HabitCard', () => {
  it('should render habit name', () => {
    const mockHabit = { id: '1', name: 'Test Habit' };
    const { getByText } = render(
      <HabitCard habit={mockHabit} onPress={jest.fn()} />
    );
    expect(getByText('Test Habit')).toBeTruthy();
  });
});
```

## 📦 Pull Request Process

### Before Submitting

1. **Run validation**
   ```bash
   npm run validate
   ```

2. **Test your changes**
   ```bash
   npm test
   ```

3. **Update documentation** if needed

### Pull Request Guidelines

1. **Use descriptive titles**
   - Good: `feat: add habit completion animations`
   - Bad: `fix stuff`

2. **Follow conventional commits**
   - `feat:` new features
   - `fix:` bug fixes
   - `docs:` documentation changes
   - `style:` formatting changes
   - `refactor:` code refactoring
   - `test:` adding tests
   - `chore:` maintenance tasks

3. **Include a detailed description**
   - What changes were made?
   - Why were they needed?
   - How were they tested?

4. **Reference related issues**
   - `Fixes #123`
   - `Closes #456`
   - `Related to #789`

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test with latest version**
3. **Check if it's a known issue**

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Device: [e.g. iPhone 12]
- OS: [e.g. iOS 15.0]
- App Version: [e.g. 1.0.0]
- Expo Version: [e.g. 53.0.17]

## Screenshots
If applicable, add screenshots
```

## ✨ Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this work?

## Alternative Solutions
Other approaches considered

## Additional Context
Any other relevant information
```

## 📚 Documentation

### Documentation Guidelines

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep it up to date

### Documentation Structure

```
docs/
├── api.md              # API documentation
├── architecture.md     # Architecture guide
├── deployment.md       # Deployment guide
├── testing.md         # Testing guide
└── troubleshooting.md  # Common issues
```

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special thanks in the app's about section

## 📞 Questions?

- 💬 [GitHub Discussions](https://github.com/yourusername/habitos/discussions)
- 📧 Email: contribute@habitos.app
- 🐛 [GitHub Issues](https://github.com/yourusername/habitos/issues)

Thank you for contributing to Habitos! 🙏