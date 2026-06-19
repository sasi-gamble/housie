import { initializeApp } from 'firebase/app';
import { getDatabase, serverTimestamp } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);

// Silently sign in anonymously — every visitor gets a UID
// This is required for security rules to work (auth != null)
let authReady = false;
const authReadyPromise = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authReady = true;
      resolve(user);
    } else {
      // Not signed in yet, attempt anonymous sign-in
      signInAnonymously(auth).catch((err) => {
        console.error('Anonymous auth failed:', err);
        resolve(null);
      });
    }
  });
});

/**
 * Wait for Firebase auth to be ready before performing writes.
 * Returns the current user or null.
 */
export function waitForAuth() {
  return authReadyPromise;
}

/**
 * Check if auth is ready synchronously (for fast checks).
 */
export function isAuthReady() {
  return authReady;
}

/**
 * Get Firebase server timestamp placeholder for use in update() calls.
 */
export function getServerTimestampValue() {
  return serverTimestamp();
}
