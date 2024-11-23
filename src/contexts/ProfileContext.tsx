import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { useParams } from 'react-router-dom';

interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  createdAt: any;
}

interface ProfileContextType {
  activeTab: 'posts' | 'videos' | 'collections';
  setActiveTab: (tab: 'posts' | 'videos' | 'collections') => void;
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  refreshPosts: () => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<'posts' | 'videos' | 'collections'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const { currentUser } = useAuth();
  const { userId } = useParams();

  const refreshPosts = async () => {
    try {
      const targetUserId = userId || currentUser?.uid;
      if (!targetUserId) return;
      
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef, 
        where('userId', '==', targetUserId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const fetchedPosts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          imageUrl: data.imageUrl,
          caption: data.caption,
          likes: data.likes,
          comments: data.comments,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Post;
      });
      
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Errore nel recupero dei post:', error);
    }
  };

  // Aggiorna i post quando cambia l'utente visualizzato o il tab
  useEffect(() => {
    refreshPosts();
  }, [userId, currentUser, activeTab]);

  return (
    <ProfileContext.Provider value={{ 
      activeTab, 
      setActiveTab, 
      posts, 
      setPosts, 
      refreshPosts 
    }}>
      {children}
    </ProfileContext.Provider>
  );
} 