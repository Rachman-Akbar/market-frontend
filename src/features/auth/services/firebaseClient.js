import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const envFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const windowFirebaseConfig = typeof window !== "undefined" ? window.__MARKETKU_FIREBASE_CONFIG__ : null;

const firebaseConfig = {
  ...envFirebaseConfig,
  ...(windowFirebaseConfig || {}),
};

const requiredConfigKeys = ["apiKey", "authDomain", "projectId", "appId"];

export function hasFirebaseConfig() {
  return requiredConfigKeys.every((key) => Boolean(firebaseConfig[key]));
}

function createFirebaseApp() {
  if (!hasFirebaseConfig()) return null;
  return getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
}

export const firebaseApp = createFirebaseApp();
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const googleProvider = firebaseAuth ? new GoogleAuthProvider() : null;
