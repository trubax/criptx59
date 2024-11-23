export function ForceLogoutAlert() {
  return (
    <Dialog open={true} className="z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="theme-bg-primary bg-opacity-95 rounded-xl shadow-lg max-w-md w-full p-6">
          <h2 className="text-xl font-semibold theme-text mb-4">
            Sessione terminata
          </h2>
          <p className="theme-text opacity-70">
            Il tuo account è stato aperto in un'altra finestra. 
            Questa sessione è stata terminata.
          </p>
        </div>
      </div>
    </Dialog>
  );
} 