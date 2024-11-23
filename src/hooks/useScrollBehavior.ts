import { useEffect } from 'react';

export const useScrollBehavior = () => {
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.scroll-container, .pwa-content')) {
        return;
      }

      const element = target.closest('.scroll-container, .pwa-content') as HTMLElement;
      const isAtTop = element.scrollTop <= 0;
      const isScrollingUp = e.touches[0].clientY > (e as any).clientY;

      if (isAtTop && !isScrollingUp) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => document.removeEventListener('touchmove', handleTouchMove);
  }, []);
}; 