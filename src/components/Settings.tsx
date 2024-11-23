import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Header from './chat/Header';
import NotificationSettings from './settings/NotificationSettings';
import { DeleteAccountDialog } from './settings/DeleteAccountDialog';
import {
  Shield,
  Lock,
  Smartphone,
  HardDrive,
  Trash2,
  LogOut,
  Palette,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AnonymousCleanupService } from '../services/AnonymousCleanupService';
import SessionSettings from './settings/SessionSettings';
import ThemeSettings from './settings/ThemeSettings';
import PrivacySettingsExpanded from './settings/PrivacySettingsExpanded';

export default function Settings() {
  const navigate = useNavigate();
  const { logout, currentUser, deleteUserAccount } = useAuth();
  const { theme, setTheme, themeColors } = useTheme();
  const [showThemes, setShowThemes] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
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

  useEffect(() => {
    const fetchPrivacySettings = async () => {
      if (!currentUser) return;
      
      const privacyDoc = await getDoc(doc(db, 'users', currentUser.uid, 'settings', 'privacy'));
      if (privacyDoc.exists()) {
        setPrivacy(privacyDoc.data() as PrivacySettings);
      }
    };

    fetchPrivacySettings();
  }, [currentUser]);

  const handleLogout = async () => {
    if (currentUser?.isAnonymous) {
      try {
        setLoading(true);
        await AnonymousCleanupService.getInstance().cleanupAnonymousData(currentUser.uid);
        await deleteUserAccount();
      } catch (error) {
        console.error('Errore durante l\'eliminazione dell\'account:', error);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await logout();
      } catch (error) {
        console.error('Errore durante il logout:', error);
      }
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteDialog(true);
  };

  const handlePrivacyUpdate = async (updates: Partial<typeof privacy>) => {
    try {
      const userRef = doc(db, 'users', currentUser?.uid || '', 'settings', 'privacy');
      await setDoc(userRef, { ...privacy, ...updates }, { merge: true });
      setPrivacy(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della privacy:', error);
    }
  };

  const SettingItem = ({ icon: Icon, title, description, onClick, value, expandable, expanded }: any) => (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 cursor-pointer transition-colors theme-bg-primary hover:theme-bg-secondary`}
    >
      <div className="flex items-center space-x-4">
        <Icon className="w-5 h-5 theme-text" />
        <div>
          <h3 className="theme-text">{title}</h3>
          {description && (
            <p className="text-sm theme-text opacity-70">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {typeof value !== 'undefined' && (
          <span className="theme-text opacity-70">
            {value}
          </span>
        )}
        {expandable && (
          expanded ? <ChevronUp className="w-5 h-5 theme-text" /> : <ChevronDown className="w-5 h-5 theme-text" />
        )}
      </div>
    </div>
  );

  return (
    <div className="page-layout settings-page">
      <div className="page-transition page-slide-enter">
        <div className="fixed-header">
          <Header />
        </div>
        <div className="settings-content-section">
          <div className="max-w-2xl mx-auto">
            {/* Profilo */}
            <div className="p-6 theme-bg-primary rounded-lg mb-4 mt-4 shadow-sm backdrop-blur-sm">
              <div 
                onClick={handleProfileClick}
                className="flex items-center space-x-4 cursor-pointer hover:theme-bg-secondary p-2 rounded-lg"
              >
                <img
                  src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || 'User')}`}
                  alt={currentUser?.displayName}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-lg font-semibold theme-text">{currentUser?.displayName}</h2>
                  <p className="theme-text opacity-70">Tocca per vedere il tuo profilo</p>
                </div>
              </div>
            </div>

            {/* Tema */}
            <div className="mb-4 rounded-lg overflow-hidden theme-bg-primary shadow-sm backdrop-blur-sm">
              <ThemeSettings
                expanded={showThemes}
                onToggle={() => setShowThemes(!showThemes)}
              />
            </div>

            {/* Sessioni */}
            <div className="mb-4 rounded-lg overflow-hidden theme-bg-primary shadow-sm backdrop-blur-sm">
              <SessionSettings
                expanded={showSessions}
                onToggle={() => setShowSessions(!showSessions)}
              />
            </div>

            {/* Notifiche */}
            <div className="mb-4 rounded-lg overflow-hidden theme-bg-primary shadow-sm backdrop-blur-sm">
              <NotificationSettings
                expanded={showNotifications}
                onToggle={() => setShowNotifications(!showNotifications)}
              />
            </div>

            {/* Privacy e Sicurezza */}
            <div className="mb-4 rounded-lg overflow-hidden theme-bg-primary shadow-sm backdrop-blur-sm">
              <PrivacySettingsExpanded
                privacy={privacy}
                onUpdate={handlePrivacyUpdate}
                expanded={showPrivacySettings}
                onToggle={() => setShowPrivacySettings(!showPrivacySettings)}
              />
            </div>

            {/* Dati e Archiviazione */}
            <div className="mb-4 rounded-lg overflow-hidden theme-bg-primary shadow-sm backdrop-blur-sm">
              <SettingItem
                icon={Smartphone}
                title="Utilizzo dati"
                description="Gestisci l'utilizzo dei dati"
              />
              <SettingItem
                icon={HardDrive}
                title="Spazio di archiviazione"
                description="Gestisci lo spazio utilizzato"
                value="2.4 GB"
              />
            </div>

            {/* Account */}
            <div className="mb-4 rounded-lg overflow-hidden theme-bg-primary shadow-sm backdrop-blur-sm">
              {!currentUser?.isAnonymous && (
                <SettingItem
                  icon={Trash2}
                  title="Elimina account"
                  description="Elimina permanentemente il tuo account"
                  onClick={handleDeleteAccountClick}
                />
              )}
              <div
                onClick={handleLogout}
                className="flex items-center space-x-4 p-4 cursor-pointer text-red-500 hover:theme-bg-secondary"
              >
                <LogOut className="w-5 h-5" />
                <span>{loading ? 'Uscita in corso...' : currentUser?.isAnonymous ? 'Esci ed elimina' : 'Logout'}</span>
              </div>
            </div>

            <div className="text-center p-4 theme-text opacity-70">
              <p className="text-sm">CriptX v1.0.0</p>
              <p className="text-xs mt-1">© 2024 CriptX. Tutti i diritti riservati.</p>
            </div>
          </div>
        </div>
      </div>

      {!currentUser?.isAnonymous && (
        <DeleteAccountDialog 
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}