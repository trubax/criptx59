import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Phone } from 'lucide-react';
import { StepIndicator } from './StepIndicator';

interface PhoneSetupProps {
  initialPhone: string;
  onUpdate: (data: { phoneNumber: string }) => void;
  onNext: () => void;
  onBack: () => void;
  showBack: boolean;
  steps: SetupStep[];
}

const useIOSFullscreen = () => {
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && window.navigator.standalone) {
      // Forza la modalità fullscreen
      document.documentElement.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
      
      // Previeni il bounce effect
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    }
  }, []);
};

export function PhoneSetup({ initialPhone, onUpdate, onNext, onBack, showBack, steps }: PhoneSetupProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone || '');
  const { currentUser } = useAuth();
  const isGoogleUser = currentUser?.providerData[0]?.providerId === 'google.com';

  const handleSubmit = () => {
    onUpdate({ phoneNumber });
    onNext();
  };

  useIOSFullscreen();

  if (!isGoogleUser || currentUser?.phoneNumber) {
    onNext();
    return null;
  }

  return (
    <div className="setup-container">
      <StepIndicator steps={steps} currentStep={2} />
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold theme-text mb-2">Numero di Telefono</h2>
              <p className="theme-text-secondary">
                Aggiungi un numero di telefono per permettere ai tuoi contatti di trovarti più facilmente
              </p>
            </div>

            <div className="w-full max-w-md mx-auto space-y-4">
              <div className="bg-opacity-20 theme-bg-secondary p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="w-6 h-6 theme-text-secondary" />
                  <p className="text-sm theme-text-secondary">
                    Il numero di telefono è facoltativo ma aiuta i tuoi contatti a trovarti
                  </p>
                </div>
                
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg theme-border theme-bg-primary theme-text"
                  placeholder="+39 123 456 7890"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-none p-4 border-t theme-border bg-transparent backdrop-blur-sm safe-area-bottom">
          <div className="flex gap-3 w-full">
            {showBack && (
              <button
                onClick={onBack}
                className="flex-1 py-2 px-4 rounded-full transition-colors border theme-border theme-text hover:theme-bg-secondary"
              >
                Indietro
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 px-4 rounded-full transition-colors flex items-center justify-center
                bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              Continua
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 