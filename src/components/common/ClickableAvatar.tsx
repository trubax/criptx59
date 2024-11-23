import { useNavigate } from 'react-router-dom';

interface ClickableAvatarProps {
  userId: string;
  photoURL: string;
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ClickableAvatar({
  userId,
  photoURL,
  displayName,
  size = 'md',
  className = ''
}: ClickableAvatarProps) {
  const navigate = useNavigate();
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  return (
    <img
      src={photoURL}
      alt={displayName}
      onClick={handleClick}
      className={`rounded-full object-cover cursor-pointer ${sizeClasses[size]} ${className}`}
    />
  );
} 