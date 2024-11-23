import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { Terms } from './Terms';
import { ProfileSetup } from './ProfileSetup';
import { PrivacySetup } from './PrivacySetup';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { updateProfile, reauthenticateWithCredential } from 'firebase/auth';
import { Service } from '../../profileConfig';
import { ContactSetup } from './ContactSetup';
import { useOnlineUsers } from '../../hooks/useOnlineUsers';
import { EmailAuthProvider } from 'firebase/auth';
import { StepIndicator } from './StepIndicator';

interface SetupStep {
  title: string;
  description: string;
}

const useIOSFullscreen = () => {
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && window.navigator.standalone) {
      // Forza la modalità fullscreen
      document.documentElement.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
      
      // Previeni il bounce effect
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    }
  }, []);
};

export default function SetupWizard() {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    photoURL: currentUser?.photoURL || '',
    bio: '',
    phoneNumbers: [''],
    secondaryEmail: '',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      facebook: '',
      tiktok: ''
    }
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showLastSeen: true,
    showStatus: true,
    showBio: true,
    showPosts: true,
    showServices: true
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setProfileData(prev => ({
        ...prev,
        displayName: currentUser.displayName || '',
        photoURL: currentUser.photoURL || '',
        phoneNumber: currentUser.phoneNumber || ''
      }));
    }
  }, [currentUser]);

  const handleComplete = async () => {
    if (!currentUser) return;

    try {
      let finalPhotoURL = profileData.photoURL;
      
      if (profileData.photoURL && profileData.photoURL.startsWith('data:')) {
        try {
          const timestamp = Date.now();
          const storageRef = ref(storage, `profile_photos/${currentUser.uid}_${timestamp}.jpg`);
          
          const metadata = {
            contentType: 'image/jpeg',
            customMetadata: {
              userId: currentUser.uid,
              uploadedAt: new Date().toISOString()
            }
          };
          
          const uploadResult = await uploadString(storageRef, profileData.photoURL, 'data_url', metadata);
          finalPhotoURL = await getDownloadURL(uploadResult.ref);

          await updateProfile(currentUser, {
            displayName: profileData.displayName,
            photoURL: finalPhotoURL
          });

          await profileConfig.updateProfileRefs(currentUser.uid, {
            photoURL: finalPhotoURL,
            displayName: profileData.displayName
          });

        } catch (error) {
          console.error('Errore durante il caricamento della foto:', error);
          finalPhotoURL = currentUser.photoURL || '';
        }
      }

      const userData = {
        displayName: profileData.displayName,
        photoURL: finalPhotoURL,
        bio: profileData.bio,
        phoneNumber: profileData.phoneNumber,
        secondaryEmail: profileData.secondaryEmail,
        socialLinks: profileData.socialLinks,
        setupCompleted: true,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        status: 'online'
      };

      await setDoc(doc(db, 'users', currentUser.uid), userData, { merge: true });
      await updateProfile(currentUser, {
        displayName: profileData.displayName,
        photoURL: finalPhotoURL
      });

      if (currentUser.email && localStorage.getItem('authCredentials')) {
        const credentials = JSON.parse(localStorage.getItem('authCredentials') || '{}');
        const authCredential = EmailAuthProvider.credential(
          currentUser.email,
          credentials.password
        );
        await reauthenticateWithCredential(currentUser, authCredential);
      }

      navigate('/chat', { replace: true });
    } catch (error) {
      console.error('Errore durante il setup:', error);
      throw new Error('Impossibile completare il setup. Riprova.');
    }
  };

  const steps: SetupStep[] = [
    {
      title: 'Termini di Servizio',
      description: 'Leggi e accetta i termini di utilizzo'
    },
    {
      title: 'Profilo',
      description: 'Personalizza il tuo profilo'
    },
    {
      title: 'Contatti e Social',
      description: 'Aggiungi i tuoi contatti e social'
    },
    {
      title: 'Privacy',
      description: 'Imposta le tue preferenze di privacy'
    }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Terms onAccept={() => setCurrentStep(1)} steps={steps} />;
      case 1:
        return (
          <ProfileSetup
            initialData={profileData}
            onUpdate={(data) => setProfileData(prev => ({ ...prev, ...data }))}
            onNext={() => setCurrentStep(2)}
            onBack={() => setCurrentStep(0)}
            showBack={true}
            steps={steps}
          />
        );
      case 2:
        return (
          <ContactSetup
            initialData={{
              phoneNumbers: profileData.phoneNumbers,
              secondaryEmail: profileData.secondaryEmail,
              socialLinks: profileData.socialLinks
            }}
            onUpdate={(data) => setProfileData(prev => ({ ...prev, ...data }))}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
            showBack={true}
            steps={steps}
          />
        );
      case 3:
        return (
          <PrivacySetup
            settings={privacySettings}
            onUpdate={setPrivacySettings}
            onComplete={handleComplete}
            onBack={() => setCurrentStep(2)}
            showBack={true}
            steps={steps}
          />
        );
      default:
        return null;
    }
  };

  useIOSFullscreen();

  return (
    <div className="setup-container">
      <div className="flex flex-col h-full">
        <StepIndicator steps={steps} currentStep={currentStep} />
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-4">
            {renderStep()}
          </div>
        </div>

        {currentStep === 0 && (
          <div className="flex-none p-4 border-t theme-border bg-transparent backdrop-blur-sm safe-area-bottom">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex-1 py-2 px-4 rounded-full transition-colors flex items-center justify-center w-full
                bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              Accetta e Continua
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 