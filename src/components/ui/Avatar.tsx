interface AvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

export function Avatar({ src, alt, className = "" }: AvatarProps) {
  return (
    <img
      src={src || '/default-avatar.png'}
      alt={alt || 'Avatar utente'}
      className={`w-10 h-10 rounded-full object-cover ${className}`}
    />
  );
} 