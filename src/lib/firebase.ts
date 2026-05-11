import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// All values come from VITE_ environment variables — never from committed files
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID as string,
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID as string | undefined;

export const app = initializeApp(firebaseConfig);
export const db  = firestoreDatabaseId
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
