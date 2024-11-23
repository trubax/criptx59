import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AnonymousTimer() {
  const { currentUser, deleteUserAccount } = useAuth();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [colorClass, setColorClass] = useState<string>('theme-text');

  useEffect(() => {
    if (!currentUser?.isAnonymous) return;

    const loginTime = localStorage.getItem('anonymousLoginTime');
    if (!loginTime) return;

    const calculateTimeLeft = () => {
      const start = new Date(loginTime).getTime();
      const now = new Date().getTime();
      const end = start + (24 * 60 * 60 * 1000);
      const remaining = end - now;

      if (remaining <= 0) {
        deleteUserAccount()
          .then(() => navigate('/login'))
          .catch(console.error);
        return '00:00:00';
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      
      if (hours <= 6) {
        setColorClass('text-red-500');
      } else if (hours <= 12) {
        setColorClass('text-orange-500');
      } else {
        setColorClass('theme-text');
      }

      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser, deleteUserAccount, navigate]);

  if (!currentUser?.isAnonymous || !timeLeft) return null;

  return (
    <div className={`flex items-center space-x-1 text-sm ${colorClass} opacity-70`}>
      <Clock className="w-4 h-4" />
      <span>{timeLeft}</span>
    </div>
  );
} 