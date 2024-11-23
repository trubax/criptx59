import { useState } from 'react';
import { useGroupChat } from '../hooks/useGroupChat';
import { useTouchBehavior } from '../hooks/useTouchBehavior';
import PullToRefresh from './common/PullToRefresh';

export default function GroupChatUsersList({ groupId }: { groupId: string }) {
  const { users, refreshUsers } = useGroupChat(groupId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUsers();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="mobile-container">
      <Header title="Partecipanti" />
      <div className="scroll-container">
        <PullToRefresh 
          onRefresh={handleRefresh}
          className="group-users-container"
          data-pull-refresh="true"
        >
          <div className="users-list space-y-2">
            {users.map(user => (
              <div 
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg theme-bg-primary"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}`}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                    {user.status === 'online' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 theme-bg-primary bg-green-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium theme-text">{user.displayName}</h4>
                    <p className="text-sm theme-text opacity-70">
                      {user.status === 'online' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
} 