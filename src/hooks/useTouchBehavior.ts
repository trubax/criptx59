import { useEffect, useRef } from 'react';

interface TouchOptions {
  pullToRefreshThreshold?: number;
  preventBounce?: boolean;
  onPullToRefresh?: () => Promise<void>;
}

export const useTouchBehavior = (options: TouchOptions = {}) => {
  const {
    pullToRefreshThreshold = 80,
    preventBounce = true,
    onPullToRefresh
  } = options;

  const startY = useRef(0);
  const startX = useRef(0);
  const pullDistance = useRef(0);
  const isRefreshing = useRef(false);
  const lastTouchTime = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      startY.current = e.touches[0].clientY;
      startX.current = e.touches[0].clientX;
      pullDistance.current = 0;
      lastTouchTime.current = Date.now();
    };

    const handleTouchMove = async (e: TouchEvent) => {
      const element = e.target as HTMLElement;
      const scrollableElement = element.closest('[data-pull-refresh="true"]');
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - startY.current;
      const deltaX = currentX - startX.current;
      
      // Previeni il bounce effect nelle aree non scrollabili
      if (!scrollableElement && preventBounce) {
        const isScrollContainer = element.closest('.scroll-container');
        if (!isScrollContainer) {
          e.preventDefault();
          return;
        }
      }

      // Gestione pull-to-refresh
      if (scrollableElement && onPullToRefresh) {
        const isAtTop = scrollableElement.scrollTop <= 0;
        const isPullingDown = deltaY > 0;
        const isHorizontalScroll = Math.abs(deltaX) > Math.abs(deltaY);

        if (isAtTop && isPullingDown && !isHorizontalScroll && !isRefreshing.current) {
          pullDistance.current = Math.min(deltaY * 0.5, pullToRefreshThreshold);
          
          if (pullDistance.current >= pullToRefreshThreshold) {
            isRefreshing.current = true;
            await onPullToRefresh();
            isRefreshing.current = false;
            pullDistance.current = 0;
          }
          
          // Aggiungi feedback visivo
          scrollableElement.style.transform = `translateY(${pullDistance.current}px)`;
        }
      }
    };

    const handleTouchEnd = () => {
      const element = document.querySelector('[data-pull-refresh="true"]');
      if (element) {
        element.style.transform = 'translateY(0)';
      }
      pullDistance.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
  }, [pullToRefreshThreshold, preventBounce, onPullToRefresh]);
}; 