import { useEffect } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { SessionService } from '../services/SessionService';

export function useOnlinePresence() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const sessionService = SessionService.getInstance();
    let isInitialized = false;

    const updateOnlineStatus = async (status: 'online' | 'offline') => {
      try {
        await updateDoc(userDocRef, {
          status,
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    const init = async () => {
      if (isInitialized) return;
      
      const existingSession = await sessionService.findExistingSession(currentUser.uid);
      if (!existingSession) {
        await sessionService.registerSession(currentUser.uid);
      }
      isInitialized = true;
      await updateOnlineStatus('online');
    };

    init();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Se è un refresh, non eliminare la sessione
      const isRefresh = e.currentTarget === window;
      sessionService.cleanup(isRefresh);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Non chiamare cleanup qui per evitare la cancellazione durante i refresh
    };
  }, [currentUser]);
} 