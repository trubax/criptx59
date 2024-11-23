import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../services/profileService';

interface ProfileAvatarProps {
  userId: string;
  photoURL: string;
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export function ProfileAvatar({ 
  userId, 
  photoURL, 
  displayName, 
  size = 'md',
  showName = false,
  className = ''
}: ProfileAvatarProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const handleClick = () => {
    if (userId === currentUser?.uid) {
      navigate('/profile');
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer" 
      onClick={handleClick}
    >
      <img
        src={photoURL}
        alt={displayName}
        className={`rounded-full object-cover border theme-border ${sizeClasses[size]} ${className}`}
      />
      {showName && (
        <span className="text-sm font-medium theme-text">{displayName}</span>
      )}
    </div>
  );
} 