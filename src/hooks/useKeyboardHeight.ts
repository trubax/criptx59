import { useState, useEffect } from 'react';

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        const visualViewport = window.visualViewport;
        const height = visualViewport ? 
          window.innerHeight - visualViewport.height : 0;
        setKeyboardHeight(height);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

  return keyboardHeight;
}; 