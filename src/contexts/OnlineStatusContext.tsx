import React, { createContext, useContext, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const OnlineStatusContext = createContext<null>(null);

export function OnlineStatusProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    let activityTimeout: NodeJS.Timeout;

    const checkActivity = () => {
      clearTimeout(activityTimeout);
      updateDoc(userRef, {
        status: 'online',
        lastSeen: serverTimestamp()
      });

      activityTimeout = setTimeout(() => {
        updateDoc(userRef, {
          status: 'offline',
          lastSeen: serverTimestamp()
        });
      }, 120000); // 2 minuti
    };

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ];

    activityEvents.forEach(event => {
      document.addEventListener(event, checkActivity);
    });

    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        checkActivity();
      } else {
        updateDoc(userRef, {
          status: 'offline',
          lastSeen: serverTimestamp()
        });
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    window.addEventListener('beforeunload', () => {
      updateDoc(userRef, {
        status: 'offline',
        lastSeen: serverTimestamp()
      });
    });

    // Imposta lo stato iniziale
    checkActivity();

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      activityEvents.forEach(event => {
        document.removeEventListener(event, checkActivity);
      });
      clearTimeout(activityTimeout);
    };
  }, [currentUser]);

  return (
    <OnlineStatusContext.Provider value={null}>
      {children}
    </OnlineStatusContext.Provider>
  );
} 