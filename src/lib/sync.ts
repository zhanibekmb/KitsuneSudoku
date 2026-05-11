import { useEffect, useState } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { auth, db } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export function useSyncFirebase() {
  const user = useUserStore(state => state.user);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        signInAnonymously(auth).catch((error) => {
          console.error("Firebase Auth Error: Please enable Anonymous Authentication in the Firebase Console.", error);
        });
      } else {
        setUid(firebaseUser.uid);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !uid) return;
    
    const { id, stats, ...rest } = user;
    try {
      setDoc(doc(db, 'users', uid), {
        uid: uid,
        statsPlayed: stats.played || 0,
        statsWon: stats.won || 0,
        ...rest
      }, { merge: true }).catch(console.error);
    } catch(e) {
      console.error(e);
    }
  }, [user, uid]);
}
