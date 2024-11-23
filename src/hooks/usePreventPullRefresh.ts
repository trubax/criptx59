import { useEffect } from 'react';

export const usePreventPullRefresh = () => {
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const element = e.target as HTMLElement;
      const isAtTop = element.scrollTop <= 0;
      
      if (isAtTop && touchY > 0) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventDefault, { passive: false });
    document.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventDefault);
      document.removeEventListener('touchmove', preventDefault);
    };
  }, []);
}; 