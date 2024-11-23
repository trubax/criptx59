import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const notification = {
        id: Date.now().toString(),
        ...event.detail,
        type: event.detail.type || 'info'
      };

      setNotifications(prev => [...prev, notification]);

      // Rimuovi la notifica dopo 5 secondi
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    window.addEventListener('showNotification', handleNotification as EventListener);
    return () => {
      window.removeEventListener('showNotification', handleNotification as EventListener);
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="flex items-start p-4 rounded-lg shadow-lg theme-bg-primary max-w-sm"
          >
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium theme-text">
                {notification.title}
              </p>
              <p className="mt-1 text-sm theme-text opacity-70">
                {notification.body}
              </p>
            </div>
            <button
              onClick={() => setNotifications(prev => 
                prev.filter(n => n.id !== notification.id)
              )}
              className="ml-4 flex-shrink-0 theme-text opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 