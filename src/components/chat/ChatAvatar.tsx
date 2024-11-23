import { Archive } from 'lucide-react';
import { ChatPreview } from './types';

interface ChatAvatarProps {
  chat: ChatPreview;
}

export const ChatAvatar = ({ chat }: ChatAvatarProps) => {
  if (chat.type === 'personal_notes') {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center theme-bg-secondary">
        <Archive className="w-6 h-6 theme-text" />
      </div>
    );
  }

  return (
    <img 
      src={chat.photoURL} 
      alt={chat.name}
      className="w-10 h-10 rounded-full object-cover"
    />
  );
}; 