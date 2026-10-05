/**
 * Haven Firebase Cloud Integration & Personal User System
 * Connected to Firebase project: haven-ai-49237
 *
 * User Data Schema in Firestore:
 * users/{userId}
 *   - name
 *   - email
 *   - photo
 *   - preferredLanguage ('auto' | 'en' | 'ar' | 'sd')
 *   - preferences
 *   - createdAt
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUserObj,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

export interface UserPreferences {
  theme?: 'dark' | 'light';
  tone?: 'friendly' | 'professional' | 'concise' | 'creative';
  memoryConsent?: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photo?: string | null;
  preferredLanguage: 'auto' | 'en' | 'ar' | 'sd';
  preferences: UserPreferences;
  createdAt: number;
  isVIP?: boolean;
}

// Backward-compatibility interface
export type FirebaseUser = UserProfile;

export const firebaseConfig = {
  apiKey:
    process.env.FIREBASE_API_KEY ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyD8i_3hX1xTa3xyolFGwQrMYw69KzwMvGU',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'haven-ai-49237.firebaseapp.com',
  projectId:
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    'haven-ai-49237',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'haven-ai-49237.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '951160141907',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:951160141907:web:6a85b09b96abd1d624aea6',
};

let app: FirebaseApp;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization notice:', error);
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export { app, auth, db };

const LOCAL_STORAGE_USER_KEY = 'haven_current_user_profile_v2';

/**
 * Generate a clean default profile for a new user
 * Notice: This is strictly the user's own profile, NEVER creator information.
 */
export const createDefaultProfile = (uid?: string, email?: string, name?: string): UserProfile => {
  const generatedId = uid || 'user_' + Math.random().toString(36).substring(2, 10);
  const userEmail = email || 'user@haven.local';
  
  // Format clean display name from email or input
  let displayName = name;
  if (!displayName) {
    if (userEmail.includes('@') && !userEmail.startsWith('user@')) {
      const prefix = userEmail.split('@')[0].replace(/[._-]/g, ' ');
      displayName = prefix
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    } else {
      displayName = 'Personal User';
    }
  }

  return {
    uid: generatedId,
    name: displayName,
    email: userEmail,
    photo: null,
    preferredLanguage: 'auto',
    preferences: {
      theme: 'dark',
      tone: 'friendly',
      memoryConsent: true,
    },
    createdAt: Date.now(),
    isVIP: false,
  };
};

/**
 * Get current cached user profile from localStorage or create a fresh one
 */
export const getCachedFirebaseUser = (): UserProfile => {
  if (typeof window === 'undefined') {
    return createDefaultProfile('server_user', 'user@haven.local', 'Personal User');
  }

  const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure no legacy creator name is persisted as the user profile
      if (
        parsed.name?.includes('Dr. Ajak') ||
        parsed.name?.includes('Haven Sovereign Creator') ||
        parsed.email === 'creator@haven.ai'
      ) {
        // Reset to personalized user profile
        const fresh = createDefaultProfile();
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(fresh));
        return fresh;
      }
      return parsed;
    } catch {
      // fallback
    }
  }

  const defaultUser = createDefaultProfile();
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(defaultUser));
  return defaultUser;
};

/**
 * Update cached user profile and write to Firestore if connected
 */
export const updateCachedFirebaseUser = (updates: Partial<UserProfile>): UserProfile => {
  const current = getCachedFirebaseUser();
  const next: UserProfile = {
    ...current,
    ...updates,
    preferences: {
      ...current.preferences,
      ...(updates.preferences || {}),
    },
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(next));
  }

  // Sync to Firestore users/{userId} asynchronously
  if (db && next.uid) {
    try {
      const userRef = doc(db, 'users', next.uid);
      setDoc(
        userRef,
        {
          name: next.name,
          email: next.email,
          photo: next.photo || null,
          preferredLanguage: next.preferredLanguage,
          preferences: next.preferences,
          createdAt: next.createdAt,
          updatedAt: Date.now(),
        },
        { merge: true }
      ).catch((err) => {
        console.warn('Firestore user sync notice:', err?.message);
      });
    } catch (err) {
      console.warn('Firestore doc write notice:', err);
    }
  }

  return next;
};

/**
 * Fetch personal profile from Firestore: users/{userId}
 */
export const fetchUserProfileFromFirestore = async (userId: string): Promise<UserProfile | null> => {
  if (!db || !userId) return null;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      const profile: UserProfile = {
        uid: userId,
        name: data.name || 'Personal User',
        email: data.email || '',
        photo: data.photo || null,
        preferredLanguage: data.preferredLanguage || 'auto',
        preferences: data.preferences || { theme: 'dark', tone: 'friendly', memoryConsent: true },
        createdAt: data.createdAt || Date.now(),
        isVIP: data.isVIP || false,
      };
      // Update cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      }
      return profile;
    }
  } catch (err: any) {
    console.warn('fetchUserProfileFromFirestore notice:', err?.message);
  }
  return null;
};

/**
 * Save / Create User in Firestore: users/{userId}
 */
export const saveUserProfileToFirestore = async (profile: UserProfile): Promise<void> => {
  if (!db || !profile.uid) return;
  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(
      userRef,
      {
        name: profile.name,
        email: profile.email,
        photo: profile.photo || null,
        preferredLanguage: profile.preferredLanguage,
        preferences: profile.preferences,
        createdAt: profile.createdAt || Date.now(),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err: any) {
    console.warn('saveUserProfileToFirestore notice:', err?.message);
  }
};

/**
 * Sign In with Email & Password
 */
export const signInWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
  if (!auth) throw new Error('Firebase Auth is not available.');
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const uid = cred.user.uid;
  const existing = await fetchUserProfileFromFirestore(uid);
  if (existing) {
    return existing;
  }
  const newProfile = createDefaultProfile(uid, email, cred.user.displayName || undefined);
  await saveUserProfileToFirestore(newProfile);
  updateCachedFirebaseUser(newProfile);
  return newProfile;
};

/**
 * Register with Email & Password
 */
export const registerWithEmail = async (email: string, pass: string, name: string): Promise<UserProfile> => {
  if (!auth) throw new Error('Firebase Auth is not available.');
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const uid = cred.user.uid;
  const newProfile: UserProfile = {
    uid,
    name: name || 'Personal User',
    email,
    photo: null,
    preferredLanguage: 'auto',
    preferences: { theme: 'dark', tone: 'friendly', memoryConsent: true },
    createdAt: Date.now(),
    isVIP: false,
  };
  await saveUserProfileToFirestore(newProfile);
  updateCachedFirebaseUser(newProfile);
  return newProfile;
};

/**
 * Sign In as Guest / Anonymously
 */
export const signInGuest = async (): Promise<UserProfile> => {
  if (!auth) {
    const guest = createDefaultProfile('guest_' + Math.random().toString(36).substring(2, 9), 'guest@haven.local', 'Guest User');
    return updateCachedFirebaseUser(guest);
  }
  try {
    const cred = await signInAnonymously(auth);
    const uid = cred.user.uid;
    const existing = await fetchUserProfileFromFirestore(uid);
    if (existing) return existing;
    const guest = createDefaultProfile(uid, 'guest@haven.local', 'Guest User');
    await saveUserProfileToFirestore(guest);
    return updateCachedFirebaseUser(guest);
  } catch (err) {
    console.warn('Anonymous sign-in fallback:', err);
    const guest = createDefaultProfile('guest_' + Math.random().toString(36).substring(2, 9), 'guest@haven.local', 'Guest User');
    return updateCachedFirebaseUser(guest);
  }
};

/**
 * Sign Out
 */
export const logoutUser = async (): Promise<void> => {
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    // Clear old chat cache for privacy
    sessionStorage.clear();
  }
};

export default {
  app,
  auth,
  db,
  config: firebaseConfig,
  getUser: getCachedFirebaseUser,
  updateUser: updateCachedFirebaseUser,
  signInWithEmail,
  registerWithEmail,
  signInGuest,
  logoutUser,
  fetchUserProfileFromFirestore,
  saveUserProfileToFirestore,
};
