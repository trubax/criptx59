import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function RefreshPrompt() {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Registra il listener per gli aggiornamenti del service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('controllerchange', () => {
          // Quando il controller cambia, ricarica la pagina
          window.location.reload();
        });
      });

      // Controlla gli aggiornamenti
      const handleUpdate = (registration: ServiceWorkerRegistration) => {
        const waitingServiceWorker = registration.waiting;
        if (waitingServiceWorker) {
          setWaitingWorker(waitingServiceWorker);
          setShowReload(true);
        }
      };

      // Registra il listener per gli aggiornamenti
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                handleUpdate(registration);
              }
            });
          }
        });
      });

      // Controlla subito se ci sono aggiornamenti
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
        if (registration.waiting) {
          handleUpdate(registration);
        }
      });
    }
  }, []);

  const reloadPage = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowReload(false);
  };

  if (!showReload) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-4 flex items-center 
                    justify-between z-50 shadow-lg">
      <p className="text-sm">
        Nuova versione disponibile di CriptX
      </p>
      <button
        onClick={reloadPage}
        className="px-3 py-1.5 bg-white text-blue-500 rounded-md text-sm 
                 hover:bg-blue-50 flex items-center gap-1"
      >
        <RefreshCw className="w-4 h-4" />
        Aggiorna
      </button>
    </div>
  );
} 