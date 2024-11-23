import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import ProfileLayout from './ProfileLayout';
import { UserPlus, UserMinus } from 'lucide-react';

interface PublicProfileProps {
  userId: string;
  profileData: {
    displayName: string;
    photoURL: string;
    bio: string;
    location?: string;
    website?: string;
    stats: {
      posts: number;
      followers: number;
      following: number;
    };
    followers?: string[];
    following?: string[];
  };
}

export default function PublicProfileView({ userId, profileData }: PublicProfileProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(profileData.stats?.followers || 0);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser) return;
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      setIsFollowing(userData?.followers?.includes(currentUser.uid) || false);
      setFollowersCount(userData?.followers?.length || 0);
    };

    checkFollowStatus();
  }, [userId, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      const currentUserRef = doc(db, 'users', currentUser.uid);

      if (isFollowing) {
        // Unfollow
        await updateDoc(userRef, {
          followers: arrayRemove(currentUser.uid)
        });
        await updateDoc(currentUserRef, {
          following: arrayRemove(userId)
        });
        setFollowersCount(prev => prev - 1);
      } else {
        // Follow
        await updateDoc(userRef, {
          followers: arrayUnion(currentUser.uid)
        });
        await updateDoc(currentUserRef, {
          following: arrayUnion(userId)
        });
        setFollowersCount(prev => prev + 1);
      }
      
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del follow:', error);
    }
  };

  return (
    <ProfileLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 p-6">
        <div className="flex-shrink-0">
          <img
            src={profileData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.displayName)}`}
            alt={profileData.displayName}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-2 theme-border"
          />
        </div>

        <div className="flex-grow">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-xl font-semibold theme-text">{profileData.displayName}</h1>
            {currentUser?.uid !== userId && (
              <button
                onClick={handleFollow}
                className={`px-4 py-1.5 rounded-lg ${
                  isFollowing 
                    ? 'theme-bg-secondary theme-text' 
                    : 'theme-bg-accent theme-text'
                } text-sm font-medium flex items-center gap-2`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    Non seguire più
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Segui
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex gap-8 mb-4">
            <div className="text-center">
              <span className="font-semibold theme-text block">{profileData.stats?.posts || 0}</span>
              <span className="text-sm theme-text opacity-70">post</span>
            </div>
            <div className="text-center">
              <span className="font-semibold theme-text block">{followersCount}</span>
              <span className="text-sm theme-text opacity-70">follower</span>
            </div>
            <div className="text-center">
              <span className="font-semibold theme-text block">{profileData.stats?.following || 0}</span>
              <span className="text-sm theme-text opacity-70">seguiti</span>
            </div>
          </div>

          {profileData.bio && (
            <p className="theme-text whitespace-pre-wrap">{profileData.bio}</p>
          )}
          
          {profileData.location && (
            <p className="text-sm theme-text opacity-70 mt-2">📍 {profileData.location}</p>
          )}
          
          {profileData.website && (
            <a 
              href={profileData.website}
              target="_blank"
              rel="noopener noreferrer" 
              className="text-sm theme-accent hover:underline mt-1 block"
            >
              🔗 {profileData.website}
            </a>
          )}
        </div>
      </div>
    </ProfileLayout>
  );
} 