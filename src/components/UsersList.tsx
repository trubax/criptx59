import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { User } from '../hooks/useUsers';

interface UsersListProps {
  users: User[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  isAnonymous?: boolean;
}

export default function UsersList({
  users,
  loading,
  error,
  hasMore,
  onLoadMore,
  isAnonymous
}: UsersListProps) {
  const navigate = useNavigate();

  const handleShare = async (user: User) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Unisciti a CriptX',
          text: `Chatta con ${user.displayName} su CriptX!`,
          url: window.location.origin
        });
      } else {
        await navigator.clipboard.writeText(
          `Unisciti a CriptX e chatta con ${user.displayName}! ${window.location.origin}`
        );
        alert('Link copiato negli appunti!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (error) {
    return (
      <div className="p-2 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="divide-y theme-divide">
      {users.map(user => (
        <div
          key={user.uid}
          className="relative flex items-center p-1.5 sm:p-2 hover:theme-bg-secondary cursor-pointer transition-colors"
        >
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 sticky left-0">
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-full h-full rounded-full object-cover"
              loading="lazy"
            />
            <span 
              className={`absolute bottom-0 right-0 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border-2 theme-bg-primary ${
                user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </div>

          <div className="ml-1.5 sm:ml-2 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium theme-text truncate text-xs sm:text-sm">
                  {user.displayName}
                </h3>
                <p className="text-[10px] sm:text-xs theme-text opacity-70 truncate">
                  {user.status === 'online' ? 'Online' : 'Offline'}
                </p>
              </div>

              <div className="flex items-center gap-0 sm:gap-0.5 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/chat/${user.uid}`);
                  }}
                  className="p-1 sm:p-1.5 rounded-full hover:theme-bg-secondary theme-accent transition-colors"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(user);
                  }}
                  className="p-1 sm:p-1.5 rounded-full hover:theme-bg-secondary theme-text transition-colors"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {loading && (
        <div className="p-1.5 sm:p-2 text-center theme-text opacity-70 text-xs sm:text-sm">
          Caricamento...
        </div>
      )}

      {hasMore && !loading && (
        <div className="p-1.5 sm:p-2 text-center">
          <button
            onClick={onLoadMore}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg theme-bg-secondary theme-text hover:opacity-90 transition-colors"
          >
            Carica altri
          </button>
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="p-1.5 sm:p-2 text-center theme-text opacity-70 text-xs sm:text-sm">
          {isAnonymous ? 'Nessun utente anonimo trovato' : 'Nessun utente registrato trovato'}
        </div>
      )}
    </div>
  );
}