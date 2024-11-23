import { useState, useEffect } from 'react';
import { StepIndicator } from './StepIndicator';

interface PrivacySetupProps {
  settings: any;
  onUpdate: (settings: any) => void;
  onComplete: () => void;
  onBack?: () => void;
  showBack?: boolean;
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

export function PrivacySetup({ settings, onUpdate, onComplete, onBack, showBack, steps }: PrivacySetupProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Aggiorna le impostazioni nel componente padre
      onUpdate(localSettings);
      
      // Completa il setup
      await onComplete();
      
    } catch (error: any) {
      console.error('Errore durante il salvataggio delle impostazioni:', error);
      alert(error.message || 'Si è verificato un errore durante il salvataggio delle impostazioni. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useIOSFullscreen();

  return (
    <div className="ios-scroll-container">
      <div className="ios-content setup-container">
        <StepIndicator steps={steps} currentStep={3} />
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold theme-text mb-2">Impostazioni Privacy</h2>
            <p className="theme-text-secondary">
              Controlla chi può vedere le tue informazioni
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="theme-text">Tipo Account</label>
              <select
                value={settings.accountType}
                onChange={(e) => onUpdate('accountType', e.target.value)}
                className="p-2 rounded-lg theme-bg-secondary theme-text"
              >
                <option value="public">Pubblico</option>
                <option value="private">Privato</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="theme-text">Chi può vedere i miei post</label>
              <select
                value={settings.whoCanSeeMyPosts}
                onChange={(e) => onUpdate('whoCanSeeMyPosts', e.target.value)}
                className="p-2 rounded-lg theme-bg-secondary theme-text"
              >
                <option value="everyone">Tutti</option>
                <option value="followers">Solo follower</option>
                <option value="none">Nessuno</option>
              </select>
            </div>

            {/* Altri controlli privacy */}
          </div>

          <div className="mt-4 flex gap-4">
            {showBack && (
              <button
                onClick={onBack}
                disabled={isSubmitting}
                className="flex-1 border border-gray-300 theme-border theme-text py-2 px-4 rounded-full hover:theme-bg-secondary transition-colors disabled:opacity-50"
              >
                Indietro
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              Completa Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 