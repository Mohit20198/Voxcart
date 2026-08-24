import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const USER_ID_KEY = 'voxcart_user_id';

function generateId(): string {
  // Generate a simple random ID like user-1a2b3c4d
  return 'user-' + Math.random().toString(36).substring(2, 10);
}

export function useUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Determine fallback guest ID
    let storedId = localStorage.getItem(USER_ID_KEY);
    if (!storedId) {
      storedId = generateId();
      localStorage.setItem(USER_ID_KEY, storedId);
    }
    
    // Set initially to stored ID
    setUserId(storedId);

    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If a real Firebase user is logged in, use their UID
        setUserId(user.uid);
      } else {
        // Fall back to guest mock ID
        setUserId(storedId);
      }
    });

    return () => unsubscribe();
  }, []);

  return userId;
}
