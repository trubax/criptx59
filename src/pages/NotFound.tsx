import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        404
      </h1>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
        Ops! La pagina che stai cercando non esiste.
      </p>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg
                 hover:bg-blue-600 transition-colors"
      >
        <Home className="w-5 h-5" />
        Torna alla Home
      </button>
    </div>
  );
} 