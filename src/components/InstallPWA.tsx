import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const checkAndroid = /Android/i.test(navigator.userAgent);
    setIsAndroid(checkAndroid);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      if (checkAndroid) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('CriptX è stata installata');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Errore durante l\'installazione:', error);
    }
  };

  if (!showInstallPrompt || !isAndroid) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg 
                    flex items-center justify-between z-50">
      <div className="flex-1">
        <h3 className="font-semibold">Installa CriptX</h3>
        <p className="text-sm opacity-90">
          Installa l'app per un'esperienza migliore
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="px-3 py-1.5 text-sm bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Non ora
        </button>
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 text-sm bg-white text-blue-500 rounded-md 
                   hover:bg-blue-50 flex items-center gap-1"
        >
          <Download className="w-4 h-4" />
          Installa
        </button>
      </div>
    </div>
  );
} 