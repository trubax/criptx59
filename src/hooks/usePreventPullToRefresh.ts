export const usePreventPullToRefresh = () => {
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const scrollTop = document.documentElement.scrollTop;
      
      if (scrollTop <= 0 && touchY > 0) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventDefault, { passive: false });
    return () => {
      document.removeEventListener('touchstart', preventDefault);
    };
  }, []);
}; 