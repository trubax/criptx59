interface DialogAccessProps {
  isOpen: boolean;
  onClose: () => void;
  access: Access | null;
}

export function DialogAccess({ isOpen, onClose, access }: DialogAccessProps) {
  if (!access) return null;

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="p-6 bg-gray-800 rounded-lg space-y-4">
        <h3 className="text-xl font-semibold text-white">Dettagli Accesso</h3>
        
        <div className="space-y-3">
          <p className="text-gray-300">
            <span className="font-semibold">Dispositivo:</span> {access.deviceInfo.platform}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold">Browser:</span> {access.deviceInfo.browser}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold">Sistema Operativo:</span> {access.deviceInfo.os}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold">Data accesso:</span> {
              format(access.timestamp, 'dd/MM/yyyy HH:mm')
            }
          </p>
          <p className="text-gray-300">
            <span className="font-semibold">Scade il:</span> {
              format(access.expiresAt, 'dd/MM/yyyy HH:mm')
            }
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 mt-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
        >
          Chiudi
        </button>
      </div>
    </Dialog>
  );
} 