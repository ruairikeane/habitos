import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, addDoc } from 'firebase/firestore';
import { auth, firestore, COLLECTIONS, handleFirebaseError } from './config';
import { BiometricService } from '@/services/biometric';

export interface AuthUser extends FirebaseUser {
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: string | null;
}

export class FirebaseAuthService {
  /**
   * Sign up a new user
   */
  static async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      if (!auth || !firestore) {
        throw new Error('Firebase not initialized');
      }

      const { email, password, displayName } = data;
      
      // Create user account
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create user profile document
      const userProfile: UserProfile = {
        id: user.uid,
        email: user.email || '',
        displayName: displayName || '',
        avatarUrl: user.photoURL || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(firestore, COLLECTIONS.USERS, user.uid), userProfile);

      // Create default categories
      await this.createDefaultCategories(user.uid);

      return {
        user: { ...user, profile: userProfile } as AuthUser,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        error: handleFirebaseError(error)
      };
    }
  }

  /**
   * Sign in an existing user
   */
  static async signIn(data: SignInData, enableBiometric: boolean = false): Promise<AuthResponse> {
    try {
      if (!auth || !firestore) {
        throw new Error('Firebase not initialized');
      }

      const { email, password } = data;
      
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user profile
      const profile = await this.getUserProfile(user.uid);

      // Store credentials for biometric authentication if enabled
      if (enableBiometric) {
        await BiometricService.storeCredentialsForBiometric(email, password);
        await BiometricService.setBiometricEnabled(true);
      }

      return {
        user: { ...user, profile } as AuthUser,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        error: handleFirebaseError(error)
      };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ error: string | null }> {
    try {
      if (!auth) {
        throw new Error('Firebase not initialized');
      }

      await signOut(auth);
      
      // Clear biometric credentials on sign out
      await BiometricService.clearStoredCredentials();
      
      return { error: null };
    } catch (error) {
      return { error: handleFirebaseError(error) };
    }
  }

  /**
   * Get the current user
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      if (!auth) {
        return null;
      }

      const user = auth.currentUser;
      if (!user) {
        return null;
      }

      const profile = await this.getUserProfile(user.uid);
      return { ...user, profile } as AuthUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Reset password via email
   */
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      if (!auth) {
        throw new Error('Firebase not initialized');
      }

      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error: handleFirebaseError(error) };
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      if (!auth?.currentUser) {
        throw new Error('No user signed in');
      }

      await updatePassword(auth.currentUser, newPassword);
      return { error: null };
    } catch (error) {
      return { error: handleFirebaseError(error) };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: {
    displayName?: string;
    avatarUrl?: string;
  }): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      if (!auth?.currentUser || !firestore) {
        throw new Error('Firebase not initialized or no user signed in');
      }

      const user = auth.currentUser;

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: updates.displayName,
        photoURL: updates.avatarUrl,
      });

      // Update Firestore profile document
      const userDocRef = doc(firestore, COLLECTIONS.USERS, user.uid);
      await setDoc(userDocRef, {
        displayName: updates.displayName,
        avatarUrl: updates.avatarUrl,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const profile = await this.getUserProfile(user.uid);
      return { user: { ...user, profile } as AuthUser, error: null };
    } catch (error) {
      return { user: null, error: handleFirebaseError(error) };
    }
  }

  /**
   * Get user profile from Firestore
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!firestore) {
        return null;
      }

      const userDoc = await getDoc(doc(firestore, COLLECTIONS.USERS, userId));
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Create default categories for new users
   */
  private static async createDefaultCategories(userId: string): Promise<void> {
    try {
      if (!firestore) {
        return;
      }

      const defaultCategories = [
        { name: 'Health', color: '#9CAF88', icon: 'heart' },
        { name: 'Productivity', color: '#A4956B', icon: 'briefcase' },
        { name: 'Learning', color: '#8FA4B2', icon: 'book' },
        { name: 'Fitness', color: '#A67C7C', icon: 'barbell' },
        { name: 'Mindfulness', color: '#9B8BA4', icon: 'leaf' },
        { name: 'Social', color: '#B8956A', icon: 'people' }
      ];

      const categoriesRef = collection(firestore, COLLECTIONS.CATEGORIES);
      
      for (const category of defaultCategories) {
        await addDoc(categoriesRef, {
          ...category,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      console.log('Default categories created for user:', userId);
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  }

  /**
   * Authenticate with biometrics
   */
  static async authenticateWithBiometrics(): Promise<AuthResponse> {
    try {
      // Check if biometric auth is enabled
      const isBiometricEnabled = await BiometricService.isBiometricEnabled();
      if (!isBiometricEnabled) {
        return {
          user: null,
          error: 'Biometric authentication is not enabled'
        };
      }

      // Check if device supports biometrics
      const capabilities = await BiometricService.checkBiometricCapabilities();
      if (!capabilities.isAvailable) {
        return {
          user: null,
          error: 'Biometric authentication is not available on this device'
        };
      }

      // Authenticate with biometrics
      const biometricTypeName = await BiometricService.getBiometricTypeName();
      const biometricResult = await BiometricService.authenticateWithBiometrics(
        `Use your ${biometricTypeName} to sign in`
      );

      if (!biometricResult.success) {
        return {
          user: null,
          error: biometricResult.error || 'Biometric authentication failed'
        };
      }

      // Get stored credentials
      const storedCredentials = await BiometricService.getStoredCredentials();
      if (!storedCredentials) {
        return {
          user: null,
          error: 'No stored credentials found'
        };
      }

      // Sign in with stored credentials
      const signInResult = await this.signIn({
        email: storedCredentials.email,
        password: storedCredentials.encryptedData
      });

      return signInResult;
    } catch (error) {
      return {
        user: null,
        error: handleFirebaseError(error)
      };
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!auth) {
      return () => {};
    }

    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await this.getUserProfile(user.uid);
        callback({ ...user, profile } as AuthUser);
      } else {
        callback(null);
      }
    });
  }
}