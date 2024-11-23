import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { AnonymousTerms } from './AnonymousTerms';
import { SessionService } from '../../services/SessionService';

const useIOSFullscreen = () => {
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && window.navigator.standalone) {
      // Forza la modalità fullscreen
      document.documentElement.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
      
      // Previeni il bounce effect
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    }
  }, []);
};

export default function AnonymousSetup() {
  const [loading, setLoading] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Controlla se l'utente è autenticato
    if (!currentUser || !currentUser.isAnonymous) {
      navigate('/login', { replace: true });
      return;
    }

    // Controlla se il setup è già stato completato
    const checkSetupStatus = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().setupCompleted) {
          navigate('/chat', { replace: true });
        }
      } catch (error) {
        console.error('Errore nel controllo dello stato del setup:', error);
        navigate('/login', { replace: true });
      }
    };

    checkSetupStatus();
  }, [currentUser, navigate]);

  useIOSFullscreen();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    
    const element = e.currentTarget;
    const isAtBottom = Math.abs(
      element.scrollHeight - element.scrollTop - element.clientHeight
    ) < 50;
    
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleTermsAccept = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);

      const guestNumber = Math.floor(1000 + Math.random() * 9000);
      const displayName = `Guest${guestNumber}`;
      const photoURL = `https://ui-avatars.com/api/?name=G${guestNumber}&background=random`;

      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        photoURL,
        isAnonymous: true,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'online',
        lastSeen: serverTimestamp(),
        settings: {
          theme: 'system',
          notifications: false,
          sound: true
        },
        setupCompleted: true
      });

      await updateProfile(currentUser, {
        displayName,
        photoURL
      });

      // Salva il timestamp di login per l'account anonimo
      localStorage.setItem('anonymousLoginTime', new Date().toISOString());
      localStorage.setItem('anonymousUserId', currentUser.uid);

      // Registra la sessione dopo il setup
      await SessionService.getInstance().registerSession(currentUser.uid);

      navigate('/chat', { replace: true });
    } catch (error) {
      console.error('Errore durante il setup anonimo:', error);
      throw new Error('Impossibile completare il setup. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="flex flex-col h-full">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto ios-scroll-container"
        >
          <div className="p-4">
            <AnonymousTerms onAccept={handleTermsAccept} />
          </div>
        </div>
        
        <div className="p-4 border-t theme-border bg-transparent backdrop-blur-sm safe-area-bottom">
          <button
            onClick={handleTermsAccept}
            disabled={loading || (isMobile && !hasScrolledToBottom)}
            className={`flex-1 py-2 px-4 rounded-full transition-colors flex items-center justify-center w-full
              ${(isMobile && !hasScrolledToBottom) 
                ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            {loading ? 'Creazione account...' : (
              isMobile && !hasScrolledToBottom ? 
                'Scorri fino in fondo per accettare' : 
                'Accetta e Continua'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 