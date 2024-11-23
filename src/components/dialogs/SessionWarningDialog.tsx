import { Dialog } from '@headlessui/react';

export function SessionWarningDialog({ isOpen, onClose, onConfirm }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="theme-bg-primary bg-opacity-95 rounded-xl shadow-lg max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sessione già attiva</h3>
            <p className="opacity-70">
              È stata rilevata una sessione attiva su un altro dispositivo. 
              Vuoi disconnettere l'altra sessione?
            </p>
          </div>
          
          <div className="p-4 border-t theme-divide flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg theme-bg-secondary"
            >
              Annulla
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-red-500 text-white"
            >
              Disconnetti
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 