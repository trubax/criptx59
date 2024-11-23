import { useNotifications } from '../hooks/useNotifications';

export default function NotificationPrompt() {
  const { permission, requestPermission } = useNotifications();

  const handleEnable = async () => {
    try {
      await requestPermission();
    } catch (error) {
      console.error('Errore abilitazione notifiche:', error);
    }
  };

  if (permission === 'granted') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 safe-area-bottom">
      <div className="flex items-center justify-between">
        <span className="text-white">Abilita le notifiche per non perdere nuovi messaggi</span>
        <button 
          onClick={handleEnable}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Abilita
        </button>
      </div>
    </div>
  );
} 