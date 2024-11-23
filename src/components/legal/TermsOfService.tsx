export default function TermsOfService() {
  return (
    <div className="min-h-screen theme-bg flex flex-col">
      <div className="flex justify-center py-4">
        <img
          src="/Criplogo.png"
          alt="CriptX Logo"
          className="w-16 h-16 object-contain"
        />
      </div>
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold theme-text mb-6">Termini di Servizio</h1>
        {/* Contenuto dei termini di servizio */}
      </div>

      <footer className="py-4 px-6 border-t theme-border">
        <div className="flex items-center justify-center gap-2 text-sm theme-text-secondary">
          <img
            src="/Criplogo.png"
            alt="CriptX Logo"
            className="w-4 h-4 object-contain"
          />
          <span>© {new Date().getFullYear()} CriptX. Tutti i diritti riservati.</span>
        </div>
      </footer>
    </div>
  );
} 