export function AnonymousLogoutDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { deleteUserAccount, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      if (currentUser) {
        await AccountCleanupService.getInstance().cleanupUserData(currentUser.uid);
        await deleteUserAccount();
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione dell\'account:', error);
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
            <h2 className="text-xl font-semibold theme-text">Conferma uscita</h2>
          </div>

          <div className="p-6">
            <p className="theme-text opacity-70">
              I contenuti dell'account anonimo non saranno più accessibili dopo il logout.
            </p>
          </div>

          <div className="p-4 border-t theme-divide flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg theme-bg-secondary theme-text 
                       hover:opacity-90 transition-all duration-200"
            >
              No
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-500 text-white 
                       hover:bg-red-600 transition-all duration-200 
                       disabled:opacity-50"
            >
              {loading ? 'Uscita...' : 'Si'}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 