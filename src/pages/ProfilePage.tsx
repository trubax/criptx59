import React, { useState, useEffect } from 'react';
import { Edit3, Bell, Shield, Globe, Briefcase, HelpCircle } from 'lucide-react';
import ProfileView from '../components/profile/ProfileView';
import { useTheme } from '../contexts/ThemeContext';
import { getDoc, doc, updateDoc, serverTimestamp, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, writeBatch, arrayUnion } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export interface PrivacySettings {
  accountType: 'public' | 'private';
  profileVisibility: 'public' | 'private';
  showLastSeen: boolean;
  showStatus: boolean;
  showBio: boolean;
  showPosts: boolean;
  showServices: boolean;
  whoCanMessageMe: 'everyone' | 'followers' | 'none';
  whoCanSeeMyPosts: 'everyone' | 'followers' | 'none';
  blockedUsers: string[];
  closeFollowers: string[];
}

const ProfilePage = () => {
  const { theme } = useTheme();
  const { userId } = useParams();
  const { currentUser, isAnonymous } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);

  if (isAnonymous) {
    return <Navigate to="/" replace />;
  }

  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || 'Utente',
    photoURL: currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent('Utente')}`,
    bio: '',
    phoneNumbers: [],
    secondaryEmail: '',
    socialLinks: {},
    stats: {
      posts: 0,
      followers: 0,
      following: 0
    },
    servicesOffered: [],
    servicesRequested: []
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    accountType: 'public',
    profileVisibility: 'public',
    showLastSeen: true,
    showStatus: true,
    showBio: true,
    showPosts: true,
    showServices: true,
    whoCanMessageMe: 'everyone',
    whoCanSeeMyPosts: 'everyone',
    blockedUsers: [],
    closeFollowers: []
  });

  const handlePhotoChange = async (photoURL: string) => {
    try {
      setLoading(true);
      
      // Aggiorna il documento utente
      const userRef = doc(db, 'users', currentUser?.uid || '');
      await updateDoc(userRef, {
        photoURL,
        updatedAt: serverTimestamp()
      });

      // Aggiorna lo stato locale immediatamente dopo l'upload
      setProfileData(prev => ({
        ...prev,
        photoURL
      }));

      // Aggiorna l'auth state di Firebase
      if (currentUser) {
        await updateProfile(currentUser, {
          photoURL
        });
      }

      // Aggiorna tutti i contatti dell'utente
      const contactsRef = collection(db, 'users');
      const contactsQuery = query(contactsRef, where('contacts', 'array-contains', currentUser?.uid));
      const contactsSnapshot = await getDocs(contactsQuery);

      const batch = writeBatch(db);
      contactsSnapshot.docs.forEach(doc => {
        const contactRef = doc.ref;
        batch.update(contactRef, {
          [`contacts.${currentUser?.uid}.photoURL`]: photoURL
        });
      });
      await batch.commit();

      // Aggiorna tutte le chat dell'utente
      const chatsRef = collection(db, 'chats');
      const chatsQuery = query(chatsRef, where('participants', 'array-contains', currentUser?.uid));
      const chatsSnapshot = await getDocs(chatsQuery);

      const chatsBatch = writeBatch(db);
      chatsSnapshot.docs.forEach(doc => {
        const chatRef = doc.ref;
        chatsBatch.update(chatRef, {
          [`participants.${currentUser?.uid}.photoURL`]: photoURL
        });
      });
      await chatsBatch.commit();

    } catch (error) {
      console.error('Errore durante l\'aggiornamento della foto:', error);
      throw new Error('Impossibile aggiornare la foto del profilo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const userRef = doc(db, 'users', currentUser?.uid || '');
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const isOffered = userData.servicesOffered?.some((s: Service) => s.id === serviceId);
      
      if (isOffered) {
        await updateDoc(userRef, {
          servicesOffered: arrayRemove(...userData.servicesOffered.filter((s: Service) => s.id === serviceId))
        });
        setProfileData(prev => ({
          ...prev,
          servicesOffered: prev.servicesOffered.filter(s => s.id !== serviceId)
        }));
      } else {
        await updateDoc(userRef, {
          servicesRequested: arrayRemove(...userData.servicesRequested.filter((s: Service) => s.id === serviceId))
        });
        setProfileData(prev => ({
          ...prev,
          servicesRequested: prev.servicesRequested.filter(s => s.id !== serviceId)
        }));
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione del servizio:', error);
    }
  };

  const handleAddService = async (type: 'offered' | 'requested', service: Partial<Service>) => {
    const newService = {
      id: crypto.randomUUID(),
      userId: currentUser?.uid,
      ...service,
      createdAt: new Date(),
    };

    try {
      const userRef = doc(db, 'users', currentUser?.uid || '');
      
      if (type === 'offered') {
        await updateDoc(userRef, {
          servicesOffered: arrayUnion(newService)
        });
        setProfileData(prev => ({
          ...prev,
          servicesOffered: [...(prev.servicesOffered || []), newService]
        }));
      } else {
        await updateDoc(userRef, {
          servicesRequested: arrayUnion(newService)
        });
        setProfileData(prev => ({
          ...prev,
          servicesRequested: [...(prev.servicesRequested || []), newService]
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Errore durante il salvataggio del servizio:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId || currentUser?.uid || 'default'));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Conta i post
          const postsQuery = query(collection(db, 'posts'), where('userId', '==', userId || currentUser?.uid));
          const postsSnapshot = await getDocs(postsQuery);
          const postsCount = postsSnapshot.size;
          
          // Conta i follower
          const followersQuery = query(collection(db, 'users'), where('following', 'array-contains', userId || currentUser?.uid));
          const followersSnapshot = await getDocs(followersQuery);
          const followersCount = followersSnapshot.size;
          
          // Conta i following
          const followingCount = userData.following?.length || 0;
          
          setProfileData(prevData => ({
            ...prevData,
            ...userData,
            photoURL: userId === currentUser?.uid ? currentUser?.photoURL || userData.photoURL : userData.photoURL,
            stats: {
              posts: postsCount,
              followers: followersCount,
              following: followingCount
            }
          }));
        }
      } catch (error) {
        console.error('Errore nel caricamento del profilo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUser]);

  useEffect(() => {
    const fetchPrivacySettings = async () => {
      const privacyDoc = await getDoc(doc(db, 'users', userId || currentUser?.uid, 'settings', 'privacy'));
      if (privacyDoc.exists()) {
        setPrivacy(privacyDoc.data() as PrivacySettings);
      }
    };
    
    fetchPrivacySettings();
  }, [userId, currentUser]);

  const isOwnProfile = userId === currentUser?.uid || !userId;

  return (
    <div className="min-h-screen theme-bg-base">
      <div className="container mx-auto max-w-4xl">
        <ProfileView 
          profileData={profileData}
          isOwnProfile={isOwnProfile}
          privacy={privacy}
          onPhotoChange={handlePhotoChange}
          onDeleteService={handleDeleteService}
          onAddService={handleAddService}
        />
      </div>
    </div>
  );
};

export default ProfilePage;