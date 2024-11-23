import { useEffect } from 'react';

export const useStandaloneMode = () => {
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone;

    if (isIOS && isStandalone) {
      // Previeni solo il pull-to-refresh
      const preventPullToRefresh = (e: TouchEvent) => {
        const touchY = e.touches[0].pageY;
        if (window.pageYOffset === 0 && touchY > 0) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchmove', preventPullToRefresh, { passive: false });
      
      return () => {
        document.removeEventListener('touchmove', preventPullToRefresh);
      };
    }
  }, []);
}; 