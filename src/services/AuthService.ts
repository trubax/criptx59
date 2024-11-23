import { useEffect } from 'react';

// Interfaccia per la configurazione dello schermo intero
interface FullscreenConfig {
  navigationUI?: 'hide' | 'show';
  orientation?: 'portrait' | 'landscape' | 'any';
}

// Funzione per richiedere lo schermo intero
export const requestFullscreen = async (element: HTMLElement, config?: FullscreenConfig) => {
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      await (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      await (element as any).msRequestFullscreen();
    }

    // Gestione specifica per Android
    if ('screen' in window && 'orientation' in (window as any).screen) {
      if (config?.orientation) {
        await (window as any).screen.orientation.lock(config.orientation);
      }
    }

    // Gestione specifica per iOS
    if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
      if ('standalone' in window.navigator && !(window.navigator as any).standalone) {
        // Aggiungi classe CSS per gestire il notch su iOS
        document.documentElement.classList.add('ios-fullscreen');
      }
    }
  } catch (error) {
    console.error('Errore durante la richiesta schermo intero:', error);
  }
};

// Hook personalizzato per gestire lo schermo intero
export const useFullscreen = (config?: FullscreenConfig) => {
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement !== null;
      document.documentElement.classList.toggle('fullscreen', isFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // Richiedi schermo intero all'avvio
    const rootElement = document.documentElement;
    requestFullscreen(rootElement, config);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);
};

// Funzione per uscire dallo schermo intero
export const exitFullscreen = async () => {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
    }
  } catch (error) {
    console.error('Errore durante l\'uscita dallo schermo intero:', error);
  }
}; 