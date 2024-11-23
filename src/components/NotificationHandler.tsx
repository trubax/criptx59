import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, BellOff } from 'lucide-react';

export default function NotificationHandler() {
  const { currentUser } = useAuth();
  const { notificationPermission, error, requestPermission } = useNotifications(currentUser?.uid);

  useEffect(() => {
    if (error) {
      console.error('Errore notifiche:', error);
    }
  }, [error]);

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {notificationPermission !== 'granted' && (
        <button
          onClick={requestPermission}
          className="flex items-center space-x-2 px-4 py-2 rounded-full theme-bg-primary shadow-lg hover:theme-bg-secondary transition-colors"
        >
          <Bell className="w-5 h-5 theme-text" />
          <span className="theme-text text-sm">Attiva notifiche</span>
        </button>
      )}
    </div>
  );
} 