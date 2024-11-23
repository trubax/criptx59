import { useNavigate } from 'react-router-dom';

interface UserAvatarProps {
  photoURL: string;
  userId: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ photoURL, userId, name, size = 'md', className = '' }: UserAvatarProps) {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <button
      onClick={() => navigate(`/profile/${userId}`)}
      className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}
    >
      <img
        src={photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`}
        alt={name}
        className="w-full h-full object-cover"
      />
    </button>
  );
} 