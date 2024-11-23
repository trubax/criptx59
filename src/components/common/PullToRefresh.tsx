import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
}

export default function PullToRefresh({ 
  onRefresh, 
  children, 
  className = '',
  enabled = true 
}: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const THRESHOLD = 80;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const container = containerRef.current;
    if (!container || !enabled || container.scrollTop > 0) return;
    
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = startYRef.current;
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (refreshing || !enabled) return;
    
    currentYRef.current = e.touches[0].clientY;
    const delta = currentYRef.current - startYRef.current;
    
    if (delta > 0) {
      e.preventDefault();
      const pullDistance = Math.min(delta * 0.5, THRESHOLD);
      containerRef.current?.style.setProperty(
        'transform', 
        `translateY(${pullDistance}px)`
      );
    }
  }, [refreshing, enabled]);

  const handleTouchEnd = useCallback(async () => {
    if (refreshing || !enabled) return;
    
    const delta = currentYRef.current - startYRef.current;
    if (delta >= THRESHOLD) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    containerRef.current?.style.setProperty('transform', 'translateY(0)');
  }, [onRefresh, refreshing, enabled]);

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
    <div 
      ref={containerRef}
      className={`relative scroll-container ${className}`}
      data-pull-refresh="true"
    >
      <div 
        className="absolute left-0 right-0 flex justify-center z-10 transition-transform duration-200"
        style={{ 
          transform: refreshing ? 'translateY(16px)' : 'translateY(-24px)',
          opacity: refreshing ? 1 : 0
        }}
      >
        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
      </div>
      {children}
    </div>
  );
} 