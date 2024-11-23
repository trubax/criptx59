import { Globe, Users, Lock, Plus, Search, Briefcase, HandHeart, Grid, Play, Bookmark, Heart, MessageCircle, Layers, Trash2, Instagram, Facebook, Twitter, Linkedin, Youtube, Edit, Settings, UserMinus, UserPlus, Clock } from 'lucide-react';
import { PrivacySettings } from '../../pages/ProfilePage';
import { useNavigate } from 'react-router-dom';
import ProfilePhotoUpload from './ProfilePhotoUpload';
import ProfileLayout from './ProfileLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { useAuth } from '@/hooks/useAuth';
import { ServiceModal } from './ServiceModal';
import { PostGrid } from './PostGrid';
import { VideoGrid } from './VideoGrid';
import { CollectionGrid } from './CollectionGrid';
import { ServiceDetailDialog } from '../ui/ServiceDetailDialog';
import { followUser, unfollowUser, sendFollowRequest, checkFollowRequestStatus } from '@/lib/follow';
import { db } from '@/firebase';
import { getDoc, doc } from 'firebase/firestore';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  rate?: string;
  availability?: string;
}

interface SocialLinks {
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

interface ProfileData {
  displayName: string;
  photoURL: string;
  bio?: string;
  socialLinks?: SocialLinks;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  posts?: {
    imageUrl: string;
    caption: string;
    likes: number;
    comments: number;
  }[];
  videos?: {
    url: string;
    views: number;
  }[];
  collections?: {
    coverUrl: string;
    name: string;
    itemCount: number;
  }[];
  servicesOffered: Service[];
  servicesRequested: Service[];
}

interface ProfileViewProps {
  profileData: ProfileData;
  isOwnProfile: boolean;
  privacy: PrivacySettings;
  onPhotoChange: (file: File) => Promise<void>;
  onAddService: (type: 'offered' | 'requested', service: Service) => Promise<void>;
  onDeleteService: (serviceId: string) => Promise<void>;
}

export default function ProfileView({ 
  profileData, 
  isOwnProfile, 
  privacy, 
  onPhotoChange,
  onAddService,
  onDeleteService 
}: ProfileViewProps) {
  const { isAnonymous, currentUser } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceType, setServiceType] = useState<'offered' | 'requested'>('offered');
  const [newService, setNewService] = useState<Partial<Service>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'videos' | 'collections'>('posts');
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasRequestedFollow, setHasRequestedFollow] = useState(false);
  
  // Nascondi completamente il contenuto per utenti anonimi
  if (isAnonymous) {
    return (
      <div className="p-6 text-center theme-text">
        <h2 className="text-xl font-semibold mb-4">Accesso Limitato</h2>
        <p className="mb-4">Per visualizzare i profili degli utenti devi effettuare l'accesso.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 rounded-lg theme-bg-secondary theme-text"
        >
          Accedi
        </button>
      </div>
    );
  }

  const handleAddServiceClick = (type: 'offered' | 'requested') => {
    setServiceType(type);
    setShowServiceModal(true);
  };

  const handleServiceNavigate = (direction: 'prev' | 'next') => {
    if (!selectedService) return;
    
    const allServices = [...profileData.servicesOffered, ...profileData.servicesRequested];
    const currentIndex = allServices.findIndex(s => s.id === selectedService.id);
    
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allServices.length - 1;
    } else {
      newIndex = currentIndex < allServices.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedService(allServices[newIndex]);
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await onDeleteService(serviceId);
      if (selectedService?.id === serviceId) {
        setSelectedService(null);
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione del servizio:', error);
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/manage');
  };

  // Verifica se l'utente può vedere i contenuti
  const canViewContent = () => {
    if (isOwnProfile) return true;
    if (privacy.accountType === 'public') return true;
    return isFollowing;
  };

  // Aggiungiamo la funzione per gestire le richieste di follow
  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      if (isFollowing) {
        await unfollowUser(profileData.uid);
        setIsFollowing(false);
        setProfileData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: Math.max(0, (prev.stats?.followers || 0) - 1)
          }
        }));
      } else {
        if (privacy.accountType === 'private') {
          await sendFollowRequest(profileData.uid);
          setHasRequestedFollow(true);
        } else {
          await followUser(profileData.uid);
          setIsFollowing(true);
          setProfileData(prev => ({
            ...prev,
            stats: {
              ...prev.stats,
              followers: (prev.stats?.followers || 0) + 1
            }
          }));
        }
      }
    } catch (error) {
      console.error('Errore durante l\'operazione di follow:', error);
      // Ripristina lo stato precedente in caso di errore
      setIsFollowing(prev => !prev);
      setHasRequestedFollow(false);
    }
  };

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || isOwnProfile) return;
      
      try {
        // Controlla se l'utente sta già seguendo
        const followingDoc = await getDoc(
          doc(db, 'users', currentUser.uid, 'following', profileData.uid)
        );
        setIsFollowing(followingDoc.exists());

        // Se non sta seguendo e il profilo è privato, controlla le richieste
        if (!followingDoc.exists() && privacy.accountType === 'private') {
          const requestDoc = await getDoc(
            doc(db, 'users', profileData.uid, 'followRequests', currentUser.uid)
          );
          setHasRequestedFollow(requestDoc.exists());
        }
      } catch (error) {
        console.error('Errore nel controllo dello stato del follow:', error);
      }
    };

    checkFollowStatus();
  }, [currentUser, profileData.uid, isOwnProfile, privacy.accountType]);

  return (
    <ProfileLayout>
      <div className="container mx-auto max-w-4xl mt-[60px] pb-[20px]">
        <div className="flex flex-col items-center gap-6 p-4">
          {/* Foto profilo */}
          <div className="relative z-10">
            {isOwnProfile ? (
              <ProfilePhotoUpload
                currentPhotoURL={currentUser?.photoURL || profileData.photoURL}
                onPhotoChange={onPhotoChange}
              />
            ) : (
              <img
                src={profileData.photoURL}
                alt={profileData.displayName}
                className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-2 theme-border"
              />
            )}
          </div>

          {/* Nome utente e pulsante modifica */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-xl font-semibold theme-text">{profileData.displayName}</h1>
              {isOwnProfile && (
                <button 
                  onClick={handleEditProfile}
                  className="p-2 rounded-lg hover:theme-bg-secondary transition-colors theme-text flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Modifica profilo</span>
                </button>
              )}
            </div>

            {/* Statistiche profilo */}
            <div className="flex justify-center gap-8 mt-4">
              <div className="text-center">
                <div className="font-semibold theme-text">{profileData.stats.posts}</div>
                <div className="text-sm theme-text-secondary">post</div>
              </div>
              <div className="text-center">
                <div className="font-semibold theme-text">{profileData.stats.followers}</div>
                <div className="text-sm theme-text-secondary">follower</div>
              </div>
              <div className="text-center">
                <div className="font-semibold theme-text">{profileData.stats.following}</div>
                <div className="text-sm theme-text-secondary">seguiti</div>
              </div>
              
              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  className="flex flex-col items-center gap-1 theme-text hover:opacity-80 transition-opacity"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-5 h-5" />
                      <span className="text-sm font-medium">Non seguire più</span>
                    </>
                  ) : hasRequestedFollow ? (
                    <>
                      <Clock className="w-5 h-5" />
                      <span className="text-sm font-medium">Richiesta inviata</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {privacy.accountType === 'private' ? 'Invia richiesta' : 'Segui'}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sezione Servizi */}
        {canViewContent() ? (
          <div className="grid md:grid-cols-2 gap-4 p-6">
            {/* Servizi Offerti */}
            <div className="theme-bg-primary rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold theme-text flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Servizi Offerti
                </h3>
                {isOwnProfile && (
                  <button
                    onClick={() => handleAddServiceClick('offered')}
                    className="p-2 rounded-full hover:theme-bg-secondary transition-colors"
                  >
                    <Plus className="w-5 h-5 theme-text" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {profileData.servicesOffered.map((service) => (
                  <div key={service.id} className="flex items-center justify-between w-full">
                    <button
                      onClick={() => setSelectedService(service)}
                      className="flex-1 p-3 text-left rounded-lg hover:theme-bg-secondary transition-colors theme-text"
                    >
                      {service.name}
                    </button>
                    {isOwnProfile && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteService(service.id);
                        }}
                        className="p-2 rounded-full hover:theme-bg-secondary transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4 theme-text" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Servizi Richiesti */}
            <div className="theme-bg-primary rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold theme-text flex items-center gap-2">
                  <HandHeart className="w-5 h-5" />
                  Servizi Richiesti
                </h3>
                {isOwnProfile && (
                  <button
                    onClick={() => handleAddServiceClick('requested')}
                    className="p-2 rounded-full hover:theme-bg-secondary transition-colors"
                  >
                    <Plus className="w-5 h-5 theme-text" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {profileData.servicesRequested.map((service) => (
                  <div key={service.id} className="flex items-center justify-between w-full">
                    <button
                      onClick={() => setSelectedService(service)}
                      className="flex-1 p-3 text-left rounded-lg hover:theme-bg-secondary transition-colors theme-text"
                    >
                      {service.name}
                    </button>
                    {isOwnProfile && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteService(service.id);
                        }}
                        className="p-2 rounded-full hover:theme-bg-secondary transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4 theme-text" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center theme-text">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Questo account è privato</h3>
            <p className="mb-4 text-sm opacity-70">
              Segui questo account per vedere le sue foto e video
            </p>
            {!hasRequestedFollow ? (
              <button
                onClick={handleFollowToggle}
                className="px-4 py-2 rounded-lg theme-bg-accent theme-text-on-accent"
              >
                Segui
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 rounded-lg theme-bg-secondary theme-text opacity-70"
              >
                Richiesta inviata
              </button>
            )}
          </div>
        )}

        {selectedService && (
          <ServiceDetailDialog
            open={!!selectedService}
            onOpenChange={(open) => !open && setSelectedService(null)}
            service={selectedService}
            onNavigate={handleServiceNavigate}
            onDelete={isOwnProfile ? () => handleDeleteService(selectedService.id) : undefined}
          />
        )}

        {/* Tabs per post, video e raccolte */}
        <div className="border-t theme-border mt-8">
          <div className="flex justify-center px-4">
            <div className="flex">
              <button 
                className={`flex items-center gap-2 px-6 py-4 border-t-2 ${
                  activeTab === 'posts' ? 'theme-border-accent theme-text' : 'border-transparent theme-text-secondary'
                }`}
                onClick={() => setActiveTab('posts')}
              >
                <Grid className="w-5 h-5" />
                <span className="text-sm font-medium">Post</span>
              </button>
              <button 
                className={`flex items-center gap-2 px-6 py-4 border-t-2 ${
                  activeTab === 'videos' ? 'theme-border-accent theme-text' : 'border-transparent theme-text-secondary'
                }`}
                onClick={() => setActiveTab('videos')}
              >
                <Play className="w-5 h-5" />
                <span className="text-sm font-medium">Video</span>
              </button>
              <button 
                className={`flex items-center gap-2 px-6 py-4 border-t-2 ${
                  activeTab === 'collections' ? 'theme-border-accent theme-text' : 'border-transparent theme-text-secondary'
                }`}
                onClick={() => setActiveTab('collections')}
              >
                <Bookmark className="w-5 h-5" />
                <span className="text-sm font-medium">Raccolte</span>
              </button>
            </div>
          </div>
        </div>

        {/* Griglia dei contenuti */}
        <div className="p-4 mb-20">
          {activeTab === 'posts' && (
            <div className="p-4">
              <PostGrid isOwnProfile={isOwnProfile} />
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="p-4">
              <VideoGrid isOwnProfile={isOwnProfile} />
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="p-4">
              <CollectionGrid isOwnProfile={isOwnProfile} />
            </div>
          )}
        </div>

        {/* Modal per aggiunta servizio */}
        <ServiceModal
          open={showServiceModal}
          onOpenChange={setShowServiceModal}
          type={serviceType}
          onSubmit={async (service) => {
            await onAddService(serviceType, service);
            setShowServiceModal(false);
          }}
        />
      </div>
    </ProfileLayout>
  );
} 