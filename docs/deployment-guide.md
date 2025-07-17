# Habitos - Deployment Guide

## Pre-Deployment Checklist

### 📋 Code & Configuration
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Production environment variables configured
- [ ] Supabase project configured for production
- [ ] App.json metadata updated
- [ ] Version numbers incremented
- [ ] Release notes prepared

### 🔧 Build Configuration
- [ ] Expo CLI installed and updated
- [ ] EAS CLI installed (`npm install -g @expo/eas-cli`)
- [ ] Logged into Expo account (`eas login`)
- [ ] Build profiles configured in eas.json

### 🎨 Assets & Metadata
- [ ] App icons generated for all sizes
- [ ] Splash screens created
- [ ] App store screenshots prepared
- [ ] Privacy policy published
- [ ] Terms of service published

## Deployment Steps

### 1. Prepare Build Configuration

Create `eas.json` in project root:

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true,
      "cache": {
        "disabled": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 2. Configure Environment Variables

Set up production environment variables:

```bash
# Supabase Production Configuration
EXPO_PUBLIC_SUPABASE_URL=your_production_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# Additional Production Variables
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_API_URL=https://api.habitos.app
```

### 3. Build for iOS

#### Development Build
```bash
eas build --platform ios --profile development
```

#### Production Build
```bash
eas build --platform ios --profile production
```

#### Submit to App Store
```bash
eas submit --platform ios
```

### 4. Build for Android

#### Development Build
```bash
eas build --platform android --profile development
```

#### Production Build
```bash
eas build --platform android --profile production
```

#### Submit to Google Play
```bash
eas submit --platform android
```

### 5. Configure App Store Connect (iOS)

1. **App Information**
   - Set app name: "Habitos"
   - Add subtitle: "Science-based habit building"
   - Set primary language: English (US)
   - Add app description from app-store-metadata.md

2. **Pricing and Availability**
   - Set price: Free
   - Select all territories
   - Set availability date

3. **App Privacy**
   - Configure data collection disclosure
   - Link to privacy policy
   - Set age rating: 4+

4. **App Review Information**
   - Add demo account if needed
   - Provide review notes
   - Add contact information

5. **Version Information**
   - Add release notes
   - Upload screenshots (5 required)
   - Upload app preview videos (optional)

### 6. Configure Google Play Console (Android)

1. **Store Listing**
   - Add app title and description
   - Upload graphics and screenshots
   - Set content rating: Everyone
   - Add privacy policy link

2. **Content Rating**
   - Complete questionnaire
   - Receive rating certificate

3. **App Pricing**
   - Set as free app
   - Configure country availability

4. **App Content**
   - Add target audience
   - Declare ads (none for Habitos)
   - Complete content declarations

### 7. Update Documentation

Update the main CLAUDE.md file with final status:

```markdown
## 🚀 Implementation Phases - COMPLETED STATUS

### ✅ Phase 8: Polish & Launch - COMPLETED
- ✅ Performance optimization with memoization and React optimizations
- ✅ Comprehensive error handling with ErrorBoundary
- ✅ Complete app store metadata and privacy policy
- ✅ Final testing checklist and bug fixes
- ✅ Production deployment configuration
- ✅ Ready for App Store and Google Play submission

**Current Status**: 🎉 PRODUCTION READY
**App Store Status**: Ready for submission
**Google Play Status**: Ready for submission
```

## Post-Deployment Monitoring

### 📊 Analytics Setup
- Configure app analytics (Firebase, Amplitude, or similar)
- Set up crash reporting (Sentry, Bugsnag)
- Monitor key metrics:
  - Daily/Weekly/Monthly Active Users
  - Habit completion rates
  - User retention
  - App performance metrics

### 🐛 Error Monitoring
- Monitor crash reports
- Track API error rates
- Monitor app performance metrics
- Set up alerts for critical issues

### 📈 Success Metrics
- **User Engagement**: DAU/MAU ratio > 0.2
- **Retention**: Day 7 retention > 40%
- **Habit Success**: Average completion rate > 60%
- **App Performance**: Crash rate < 1%
- **User Satisfaction**: App store rating > 4.0

## Maintenance & Updates

### Regular Updates Schedule
- **Patch Updates**: Monthly (bug fixes, small improvements)
- **Minor Updates**: Quarterly (new features, enhancements)  
- **Major Updates**: Bi-annually (significant features, redesigns)

### Update Process
1. Increment version numbers
2. Update release notes
3. Test on staging environment
4. Build and submit to stores
5. Monitor post-release metrics
6. Address any critical issues

### Backup & Recovery
- Regular database backups via Supabase
- Code repository backed up on GitHub
- Environment configurations documented
- Disaster recovery plan established

## Security Checklist

### Data Security
- [ ] All API keys secured
- [ ] Database access restricted
- [ ] User data encrypted
- [ ] HTTPS enforced
- [ ] Authentication tokens secured

### App Security
- [ ] No sensitive data in logs
- [ ] Code obfuscation enabled
- [ ] Certificate pinning (if applicable)
- [ ] Secure storage for sensitive data
- [ ] Regular security audits

### Privacy Compliance
- [ ] GDPR compliance implemented
- [ ] CCPA compliance implemented
- [ ] Data retention policies defined
- [ ] User data deletion process
- [ ] Privacy policy updated

## Launch Marketing

### Pre-Launch
- [ ] Landing page created
- [ ] Social media accounts set up
- [ ] Press kit prepared
- [ ] Beta testing feedback collected
- [ ] App store optimization completed

### Launch Day
- [ ] App store submissions approved
- [ ] Social media announcement
- [ ] Press release distributed
- [ ] Community outreach
- [ ] User support ready

### Post-Launch
- [ ] Monitor app store reviews
- [ ] Respond to user feedback
- [ ] Track key metrics
- [ ] Plan feature updates
- [ ] Build user community

## Support & Maintenance

### User Support
- **Support Email**: support@habitos.app
- **Response Time Target**: < 24 hours
- **Knowledge Base**: https://habitos.app/help
- **FAQ Section**: Common user questions addressed

### Technical Support
- **Critical Issues**: < 4 hours response
- **Bug Reports**: < 48 hours response
- **Feature Requests**: Logged and prioritized
- **User Feedback**: Regular review and implementation

## Success Criteria

### Technical Success
- [ ] App launches successfully on both platforms
- [ ] Zero critical bugs in first week
- [ ] Performance targets met
- [ ] Security standards maintained

### Business Success
- [ ] 1,000+ downloads in first month
- [ ] 4.0+ app store rating
- [ ] 40%+ day-7 retention rate
- [ ] Positive user feedback and reviews

### User Success
- [ ] Users successfully create and track habits
- [ ] Habit completion rates improve over time
- [ ] Users engage with analytics features
- [ ] Users report improved habit formation

---

## Emergency Procedures

### Critical Bug Response
1. Assess severity and impact
2. Hotfix preparation and testing
3. Emergency app store submission
4. User communication via app/email
5. Post-incident review

### Server Outage Response
1. Check Supabase status
2. Enable offline mode messaging
3. Monitor restoration progress
4. Communicate with affected users
5. Review and improve resilience

### Security Incident Response
1. Immediate threat assessment
2. Isolate affected systems
3. User notification if required
4. Implement security patches
5. External security audit

**Deployment Date**: Ready for immediate deployment
**Deployed By**: Development Team
**Next Review**: 30 days post-launch