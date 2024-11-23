import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Avatar } from '@/components/ui/Avatar';
import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { User } from '@/types/user';

interface FollowersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function FollowersDialog({ isOpen, onClose, userId }: FollowersDialogProps) {
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const followersRef = collection(db, 'users', userId, 'followers');
        const snapshot = await getDocs(followersRef);
        
        const followersData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const userData = await getDocs(doc(db, 'users', doc.data().userId));
            return { id: doc.id, ...userData.data() } as User;
          })
        );
        
        setFollowers(followersData);
      } catch (error) {
        console.error('Errore nel caricamento dei followers:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchFollowers();
    }
  }, [userId, isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Followers</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-4 p-1">
              {followers.map((follower) => (
                <div key={follower.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Avatar src={follower.photoURL} alt={follower.displayName} />
                  <span className="theme-text font-medium">{follower.displayName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 