import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog } from '../ui/Dialog';
import { AccountCleanupService } from '../../services/AccountCleanupService';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const { currentUser, deleteUserAccount } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'ELIMINA') {
      setError('Per favore scrivi "ELIMINA" per confermare');
      return;
    }

    try {
      setLoading(true);
      if (currentUser) {
        // Pulisci tutti i dati prima di eliminare l'account
        await AccountCleanupService.getInstance().cleanupUserData(currentUser.uid);
        await deleteUserAccount();
      }
      onClose();
    } catch (error: any) {
      console.error('Errore durante l\'eliminazione dell\'account:', error);
      setError(error.message || 'Errore durante l\'eliminazione dell\'account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="theme-bg-primary bg-opacity-95 rounded-xl shadow-lg max-w-md w-full overflow-hidden">
          <div className="p-4 border-b theme-divide">
            <h2 className="text-xl font-semibold theme-text">Elimina Account</h2>
          </div>

          <div className="p-6 space-y-4">
            <p className="theme-text opacity-70">
              {currentUser?.isAnonymous 
                ? "Questa azione eliminerà permanentemente il tuo account anonimo e tutti i dati associati."
                : "Questa azione eliminerà permanentemente il tuo account e tutti i dati associati."}
            </p>

            <input
              type="text"
              placeholder='Scrivi "ELIMINA" per confermare'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full p-3 rounded-lg theme-bg-secondary theme-text 
                       placeholder-gray-500 focus:outline-none focus:ring-2 
                       focus:ring-accent transition-all duration-200"
            />

            {error && (
              <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
                {error}
              </p>
            )}
          </div>

          <div className="p-4 border-t theme-divide flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg theme-bg-secondary theme-text 
                       hover:opacity-90 transition-all duration-200"
            >
              Annulla
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-500 text-white 
                       hover:bg-red-600 transition-all duration-200 
                       disabled:opacity-50"
            >
              {loading ? 'Eliminazione...' : 'Elimina Account'}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 