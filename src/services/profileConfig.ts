import { db, storage, auth } from '../firebase';
import { 
  doc, 
  updateDoc, 
  writeBatch, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

interface ProfileData {
  displayName: string;
  photoURL: string;
  bio?: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  servicesOffered: Service[];
  servicesRequested: Service[];
  contacts: any[];
  following: string[];
  followers: string[];
  lastUpdated: any;
  privacy: {
    showServices: boolean;
    showEmail: boolean;
    showPhone: boolean;
  };
}

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  userId: string;
  createdAt: Date;
}

export const profileConfig = {
  // Percorsi storage
  storagePaths: {
    profilePhoto: (userId: string) => `users/${userId}/profile/photo.jpg`,
    postMedia: (userId: string, postId: string) => `users/${userId}/posts/${postId}`,
    videoMedia: (userId: string, videoId: string) => `users/${userId}/videos/${videoId}`,
  },

  // Percorsi Firestore
  collections: {
    users: 'users',
    posts: 'posts',
    videos: 'videos',
    collections: 'collections',
  },

  // Limiti e vincoli
  limits: {
    bioMaxLength: 500,
    maxPhotoSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 100 * 1024 * 1024, // 100MB
    maxPostsPerUser: 100,
    maxServicesPerUser: 20,
  },

  // Funzioni di utilità per aggiornamenti batch
  async updateProfileRefs(userId: string, updates: Partial<ProfileData>) {
    const batch = writeBatch(db);
    
    // Aggiorna contatti
    const contactsQuery = query(
      collection(db, 'users'), 
      where('contacts', 'array-contains', userId)
    );
    const contactsSnapshot = await getDocs(contactsQuery);
    
    contactsSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        [`contacts.${userId}`]: updates
      });
    });

    // Aggiorna chat
    const chatsQuery = query(
      collection(db, 'chats'), 
      where('participants', 'array-contains', userId)
    );
    const chatsSnapshot = await getDocs(chatsQuery);
    
    chatsSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        [`participants.${userId}`]: updates
      });
    });

    await batch.commit();
  }
}; 