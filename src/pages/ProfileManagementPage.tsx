import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { Phone, Mail, Github, Linkedin, Twitter, Facebook, Instagram, Send, Music } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

interface ProfileData {
  displayName: string;
  photoURL: string;
  bio: string;
  phoneNumbers: string[];
  secondaryEmail: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
    tiktok?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export default function ProfileManagementPage() {
  const { currentUser, isAnonymous } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    photoURL: '',
    bio: '',
    phoneNumbers: [''],
    secondaryEmail: '',
    socialLinks: {}
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData({
            displayName: userData.displayName || '',
            photoURL: userData.photoURL || '',
            bio: userData.bio || '',
            phoneNumbers: userData.phoneNumbers || [''],
            secondaryEmail: userData.secondaryEmail || '',
            socialLinks: userData.socialLinks || {}
          });
        }
      } catch (error) {
        console.error('Errore nel caricamento del profilo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userRef = doc(db, 'users', currentUser.uid);
      
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });

      await updateProfile(currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });

      navigate('/profile');

    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      alert('Errore durante il salvataggio delle modifiche');
    } finally {
      setLoading(false);
    }
  };

  if (isAnonymous) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="page-layout">
      <div className="fixed-header">
        <div className="bg-opacity-80 backdrop-blur-sm theme-bg-base p-4 border-b theme-border">
          <div className="container mx-auto max-w-4xl flex justify-between items-center">
            <h1 className="text-xl font-bold theme-text">Modifica Profilo</h1>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
          </div>
        </div>
      </div>

      <div className="scroll-view mt-[64px]">
        <div className="container mx-auto max-w-4xl p-4 pb-[120px]">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-6 bg-opacity-20 theme-bg-secondary p-6 rounded-lg">
              {/* Informazioni base */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold theme-text">Informazioni Base</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-medium theme-text">Nome utente</label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full p-3 rounded-lg theme-bg-secondary theme-text border theme-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium theme-text">Biografia</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full p-3 rounded-lg theme-bg-secondary theme-text border theme-border min-h-[100px]"
                  />
                </div>
              </div>

              {/* Contatti */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold theme-text">Contatti</h2>
                {profileData.phoneNumbers.map((phone, index) => (
                  <div key={index} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium theme-text">
                      <Phone className="w-4 h-4" />
                      Telefono {index + 1}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const newPhones = [...profileData.phoneNumbers];
                        newPhones[index] = e.target.value;
                        setProfileData(prev => ({ ...prev, phoneNumbers: newPhones }));
                      }}
                      className="w-full p-3 rounded-lg theme-bg-secondary theme-text border theme-border"
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium theme-text">
                    <Mail className="w-4 h-4" />
                    Email secondaria
                  </label>
                  <input
                    type="email"
                    value={profileData.secondaryEmail}
                    onChange={(e) => setProfileData(prev => ({ ...prev, secondaryEmail: e.target.value }))}
                    className="w-full p-3 rounded-lg theme-bg-secondary theme-text border theme-border"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold theme-text">Social</h2>
                {Object.entries({
                  facebook: { icon: Facebook, label: 'Facebook' },
                  instagram: { icon: Instagram, label: 'Instagram' },
                  telegram: { icon: Send, label: 'Telegram' },
                  tiktok: { icon: Music, label: 'TikTok' },
                  github: { icon: Github, label: 'GitHub' },
                  linkedin: { icon: Linkedin, label: 'LinkedIn' },
                  twitter: { icon: Twitter, label: 'Twitter' }
                }).map(([key, { icon: Icon, label }]) => (
                  <div key={key} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium theme-text">
                      <Icon className="w-4 h-4" />
                      {label}
                    </label>
                    <input
                      type="url"
                      value={profileData.socialLinks[key as keyof typeof profileData.socialLinks] || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          [key]: e.target.value
                        }
                      }))}
                      className="w-full p-3 rounded-lg theme-bg-secondary theme-text border theme-border"
                      placeholder={`https://${key}.com/username`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 