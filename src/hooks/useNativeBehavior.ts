import { useEffect } from 'react';

export const useNativeBehavior = () => {
  useEffect(() => {
    // Gestione orientamento
    const lockOrientation = async () => {
      try {
        await screen.orientation.lock('portrait');
      } catch (error) {
        console.warn('Orientamento non bloccabile:', error);
      }
    };

    // Gestione gesture
    const handleGesture = (e: TouchEvent) => {
      // Previeni gesture di sistema
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Gestione tastiera
    const handleKeyboard = () => {
      window.scrollTo(0, 0);
    };

    document.addEventListener('touchstart', handleGesture, { passive: false });
    window.addEventListener('resize', handleKeyboard);
    lockOrientation();

    return () => {
      document.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('resize', handleKeyboard);
    };
  }, []);
}; 