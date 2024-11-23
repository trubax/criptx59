import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useOnlineUsers(isAnonymous: boolean = false) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Query per gli utenti online/offline
    const usersQuery = query(
      collection(db, 'users'),
      where('isAnonymous', '==', isAnonymous)
    );

    // Ascolta i cambiamenti degli utenti
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs
        .map(doc => ({
          uid: doc.id,
          ...doc.data()
        }))
        .filter(user => user.uid !== currentUser.uid);

      setOnlineUsers(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, isAnonymous]);

  return { onlineUsers, loading };
}