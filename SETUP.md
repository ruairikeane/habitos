# Setup Instructions

## Initial Git Configuration

Before making your first commit, set up your Git identity:

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## GitHub Repository Setup

1. **Create GitHub Repository:**
   - Go to GitHub and create a new repository named `habitos`
   - Don't initialize with README (we already have one)

2. **Connect Local Repository:**
   ```bash
   git remote add origin https://github.com/yourusername/habitos.git
   git branch -M main
   git push -u origin main
   ```

## Development Environment Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Install Git Hooks:**
   ```bash
   npm run prepare
   ```

## Verification

Run the validation script to ensure everything is set up correctly:

```bash
npm run validate
```

This will check:
- TypeScript compilation
- ESLint rules
- Prettier formatting
- All tests pass

## Next Steps

1. Set up your GitHub repository
2. Configure GitHub Secrets for CI/CD:
   - `EXPO_TOKEN`: Your Expo access token
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. Start development:
   ```bash
   npm start
   ```

## Development Workflow

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make Changes and Commit:**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

3. **Push and Create PR:**
   ```bash
   git push origin feature/amazing-feature
   ```

The git hooks will automatically:
- Validate TypeScript
- Check commit message format

## Professional Development Features Added

✅ **Code Quality:**
- TypeScript strict mode for type safety
- Husky git hooks for pre-commit validation
- Commitlint for conventional commit messages

✅ **Documentation:**
- Comprehensive README with setup instructions
- Contributing guide with development workflow
- Issue and PR templates
- VS Code settings for optimal development experience

✅ **CI/CD:**
- GitHub Actions for automated testing
- Build validation on push/PR
- Automated release workflow
- Artifact storage for builds

✅ **Project Structure:**
- Professional folder organization
- Environment variable management
- Git hooks for quality assurance
- Development tooling configuration