# Firebase Setup Instructions

## Deploy Firestore Security Rules

To fix the Firebase permission errors and allow your app to access data, you need to deploy the Firestore security rules.

### Option 1: Deploy via Firebase Console (Easiest)

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project: `habitos-firebase`
3. In the left menu, click on **Firestore Database**
4. Click on the **Rules** tab
5. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own habits
    match /habits/{habitId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Allow users to read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own completions
    match /completions/{completionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Allow users to read and write their own settings
    match /settings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Click **Publish** to deploy the rules

### Option 2: Deploy via Firebase CLI

1. Open Terminal and navigate to the project directory:
   ```bash
   cd /Users/ruairi/habitos
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your project: `habitos-firebase`
   - Use existing files when prompted

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Verify Setup

After deploying the rules, restart your app and the Firebase permission errors should be resolved. Your data will now be accessible while maintaining security - each user can only access their own data.

## What These Rules Do

- **Authentication Required**: All operations require the user to be signed in
- **User Isolation**: Users can only read and write their own data
- **Collections Protected**:
  - `habits`: Users can only access habits where `userId` matches their auth ID
  - `users`: Users can only access their own user document
  - `completions`: Users can only access completions they created
  - `settings`: Users can only access their own settings

## Troubleshooting

If you still see permission errors after deploying:
1. Make sure you're signed in to the app
2. Check that the Firebase project ID matches: `habitos-firebase`
3. Verify the rules were published successfully in the Firebase Console
4. Try signing out and signing back in to refresh the authentication token