import { useEffect, useRef, useState, useCallback } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

const PullToRefresh = ({ onRefresh, children, disabled = false }: PullToRefreshProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const refreshingRef = useRef(false);
  const [pullProgress, setPullProgress] = useState(0);
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const container = containerRef.current;
    if (!container || disabled || container.scrollTop > 0) return;
    
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = startYRef.current;
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (refreshingRef.current || disabled) return;
    
    currentYRef.current = e.touches[0].clientY;
    const delta = currentYRef.current - startYRef.current;
    
    if (delta > 0) {
      e.preventDefault();
      setPullProgress(Math.min(delta / 100, 1));
    }
  }, [disabled]);

  const handleTouchEnd = useCallback(async () => {
    if (refreshingRef.current || disabled) return;
    
    if (pullProgress >= 1) {
      refreshingRef.current = true;
      try {
        await onRefresh();
      } finally {
        refreshingRef.current = false;
        setPullProgress(0);
      }
    } else {
      setPullProgress(0);
    }
  }, [onRefresh, pullProgress, disabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto overscroll-none">
      <div 
        className="transition-transform duration-200 ease-out"
        style={{ 
          transform: pullProgress > 0 ? `translateY(${pullProgress * 50}px)` : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh; 