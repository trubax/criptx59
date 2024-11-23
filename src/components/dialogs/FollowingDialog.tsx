import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Avatar } from '@/components/ui/Avatar';
import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { User } from '@/types/user';
import { UserMinus } from 'lucide-react';
import { unfollowUser } from '@/lib/follow';

interface FollowingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  isOwnProfile: boolean;
}

export function FollowingDialog({ isOpen, onClose, userId, isOwnProfile }: FollowingDialogProps) {
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ... resto del codice rimane uguale ...
} 