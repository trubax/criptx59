import { useEffect } from 'react';

export const useFullscreenApp = () => {
  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isAndroid) {
      const enableFullscreen = () => {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
      };
      
      // Forza il fullscreen all'avvio
      enableFullscreen();
      
      // Riprova il fullscreen quando l'app torna in foreground
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          enableFullscreen();
        }
      });
    }
  }, []);
};

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