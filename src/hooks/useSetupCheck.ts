import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function useSetupCheck() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    const checkSetupStatus = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (currentUser.isAnonymous) {
          // Per utenti anonimi, controlla se esiste il documento e se il setup è completato
          const setupNeeded = !userDoc.exists() || !userDoc.data()?.setupCompleted;
          setNeedsSetup(setupNeeded);
          if (setupNeeded && window.location.pathname !== '/setup/anonymous') {
            navigate('/setup/anonymous');
          }
        } else {
          // Per utenti regolari, mantieni la logica esistente
          const setupNeeded = !userDoc.exists() || !userDoc.data()?.setupCompleted;
          setNeedsSetup(setupNeeded);
          if (setupNeeded && window.location.pathname !== '/setup') {
            navigate('/setup');
          }
        }
      } catch (error) {
        console.error('Errore nel controllo setup:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSetupStatus();
  }, [currentUser, navigate]);

  return { loading, needsSetup };
} 