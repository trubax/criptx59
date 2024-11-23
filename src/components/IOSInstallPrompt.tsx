import { useState, useEffect } from 'react';
import { Share2, X } from 'lucide-react';

export default function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Controlla se è iOS e non è già in modalità standalone
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = ('standalone' in window.navigator) && (window.navigator['standalone'] as boolean);
    
    if (isIOS && !isStandalone) {
      setShowPrompt(true);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 
                    border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Installa l'App
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            1. Tocca il pulsante Condividi
            <Share2 className="inline-block w-4 h-4 mx-1" />
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            2. Scorri e seleziona "Aggiungi alla schermata Home"
          </p>
        </div>
        <button 
          onClick={() => setShowPrompt(false)}
          className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 
                     dark:hover:text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 