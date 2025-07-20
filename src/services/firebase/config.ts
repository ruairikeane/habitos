import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];
  
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.warn('Missing Firebase configuration fields:', missingFields);
    return false;
  }
  
  return true;
};

// Initialize Firebase
let app: any = null;
let auth: any = null;
let firestore: any = null;
let storage: any = null;

try {
  const isConfigured = validateFirebaseConfig();
  
  if (isConfigured) {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
    
    console.log('Firebase initialized successfully');
    
    // Connect to emulators in development if needed
    if (__DEV__ && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('Connected to Firebase emulators');
      } catch (error) {
        console.warn('Failed to connect to Firebase emulators:', error);
      }
    }
  } else {
    console.warn('Firebase not configured properly. Using offline mode.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export Firebase services
export { app, auth, firestore, storage };

// Firebase collections
export const COLLECTIONS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  HABITS: 'habits',
  HABIT_ENTRIES: 'habit_entries',
  USER_PREFERENCES: 'user_preferences',
} as const;

// Helper to check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return app !== null && auth !== null && firestore !== null;
};

// Get Firebase configuration status
export const getFirebaseConfig = () => ({
  isConfigured: isFirebaseConfigured(),
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

// Error handling helper
export const handleFirebaseError = (error: any): string => {
  if (error?.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'User not found';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'Email already in use';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'firestore/permission-denied':
        return 'Permission denied';
      case 'firestore/unavailable':
        return 'Service temporarily unavailable';
      default:
        return error.message || 'An error occurred';
    }
  }
  return 'An unexpected error occurred';
};