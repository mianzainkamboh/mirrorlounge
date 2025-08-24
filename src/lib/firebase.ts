// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Validate Firebase environment variables
function validateFirebaseConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.trim() === '';
  });

  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase services
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;

// Initialize Firebase only on client side
function initializeFirebase() {
  if (typeof window === 'undefined') {
    console.log('Server side detected, skipping Firebase initialization');
    return;
  }
  
  if (app) {
    console.log('Firebase already initialized');
    return;
  }
  
  const configValidation = validateFirebaseConfig();
  
  if (configValidation.isValid) {
    try {
      // Initialize Firebase
      app = initializeApp(firebaseConfig);
      
      // Initialize Firebase services
      db = getFirestore(app);
      storage = getStorage(app);
      auth = getAuth(app);
      
      // Verify auth is properly initialized
      if (auth) {
        console.log('Firebase Auth initialized successfully:', {
          app: !!app,
          auth: !!auth,
          authType: typeof auth
        });
      } else {
        console.error('Firebase Auth failed to initialize - auth is null');
      }
      
      // Initialize Analytics with error handling
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.warn('Firebase Analytics initialization failed:', error);
        analytics = null;
      }
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      // Ensure auth is null on error
      auth = null;
    }
  } else {
    console.warn('Firebase configuration is incomplete. Missing environment variables:', configValidation.missingVars);
    console.warn('Please check your .env.local file and ensure all Firebase environment variables are set.');
    console.warn('The application will continue to run without Firebase functionality.');
    // Explicitly set auth to null when config is invalid
    auth = null;
  }
}

// Initialize Firebase on client side
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Export Firebase services (may be null if not configured)
export { db, storage, auth, analytics, initializeFirebase };
export default app;

// Helper function to check if Firebase is configured
export function isFirebaseConfigured(): boolean {
  return app !== null;
}

// Helper function to get Firebase configuration status
export function getFirebaseStatus() {
  const configValidation = validateFirebaseConfig();
  return {
    configured: app !== null,
    services: {
      app: app !== null,
      db: db !== null,
      storage: storage !== null,
      auth: auth !== null,
      analytics: analytics !== null
    },
    missingVars: configValidation.isValid ? [] : configValidation.missingVars
  };
}
