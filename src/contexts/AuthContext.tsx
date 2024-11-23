import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, provider, db, signInWithGoogle, initiatePhoneSignIn, verifyPhoneCode } from '../firebase';
import { 
  signOut, 
  onAuthStateChanged, 
  User,
  browserLocalPersistence,
  setPersistence,
  signInAnonymously,
  updateProfile,
  RecaptchaVerifier
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, deleteDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { AccountCleanupService } from '../services/AccountCleanupService';
import { SessionService } from '../services/SessionService';

interface AuthContextType {
  currentUser: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginAnonymously: (nickname: string) => Promise<void>;
  loginWithPhone: (phoneNumber: string, verificationId?: string) => Promise<any>;
  loading: boolean;
  isAnonymous: boolean;
  isDevelopment: boolean;
  userProfile: {
    servicesOffered: Service[];
    servicesRequested: Service[];
    [key: string]: any;
  } | null;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  deleteUserAccount: (verificationCode?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const isDevelopment = import.meta.env.DEV;

  // Funzione per pulire i dati dell'utente anonimo
  const cleanupAnonymousUser = async (userId: string) => {
    try {
      // Elimina il documento utente
      await deleteDoc(doc(db, 'users', userId));

      // Elimina tutte le chat associate
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId)
      );
      const chatsSnapshot = await getDocs(chatsQuery);
      
      for (const chatDoc of chatsSnapshot.docs) {
        // Elimina tutti i messaggi della chat
        const messagesSnapshot = await getDocs(collection(db, `chats/${chatDoc.id}/messages`));
        for (const messageDoc of messagesSnapshot.docs) {
          await deleteDoc(doc(db, `chats/${chatDoc.id}/messages`, messageDoc.id));
        }
        // Elimina la chat
        await deleteDoc(doc(db, 'chats', chatDoc.id));
      }

      // Pulisci il localStorage
      localStorage.removeItem('anonymousLoginTime');
      localStorage.removeItem('anonymousUserId');
    } catch (error) {
      console.error('Error cleaning up anonymous user:', error);
    }
  };

  // Controlla la scadenza dell'account anonimo
  const checkAnonymousExpiration = async (user: User) => {
    if (!user.isAnonymous) return;

    const loginTime = localStorage.getItem('anonymousLoginTime');
    if (!loginTime) return;

    const expirationTime = new Date(loginTime);
    expirationTime.setHours(expirationTime.getHours() + 24);

    if (new Date() >= expirationTime) {
      try {
        // L'account è scaduto, effettua la pulizia completa
        await AccountCleanupService.getInstance().cleanupUserData(user.uid, true);
        await signOut(auth);
        setCurrentUser(null);
        setIsAnonymous(false);
      } catch (error) {
        console.error('Errore durante la pulizia dell\'account scaduto:', error);
      }
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error('Errore durante l\'inizializzazione:', error);
      }
    };

    initialize();

    // Controlla periodicamente la scadenza dell'account anonimo
    const expirationCheck = setInterval(() => {
      if (currentUser?.isAnonymous) {
        checkAnonymousExpiration(currentUser);
      }
    }, 60000); // Controlla ogni minuto

    const handleAuthStateChanged = async (user: User | null) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        // Verifica se l'utente esiste già in Firestore
        if (!userDoc.exists()) {
          // Solo se l'utente non esiste, crea un nuovo documento
          await setDoc(userRef, {
            displayName: user.displayName || 'Utente',
            email: user.email,
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            lastSeen: serverTimestamp(),
            status: 'online',
            isAnonymous: user.isAnonymous
          });
        } else {
          // Se l'utente esiste, aggiorna solo lo stato online e lastSeen
          await updateDoc(userRef, {
            lastSeen: serverTimestamp(),
            status: 'online'
          });
        }
      }
      setCurrentUser(user);
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);
    
    // Cleanup function
    return () => {
      unsubscribe();
      clearInterval(expirationCheck);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        updateDoc(userRef, {
          status: 'offline',
          lastSeen: serverTimestamp()
        });
      }
    };
  }, []);

  const login = async () => {
    try {
      const result = await signInWithGoogle();
      if ('user' in result) {
        const user = result.user;
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=random`,
          isAnonymous: false,
          status: 'online',
          lastSeen: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Errore login:', error);
      throw error;
    }
  };

  const loginWithPhone = async (phoneNumberOrVerificationId: string, verificationIdOrCode?: any) => {
    try {
      if (verificationIdOrCode) {
        // Verify OTP code
        const result = await verifyPhoneCode(phoneNumberOrVerificationId, verificationIdOrCode);
        if (result.user) {
          await setDoc(doc(db, 'users', result.user.uid), {
            phoneNumber: result.user.phoneNumber,
            displayName: result.user.displayName || result.user.phoneNumber,
            photoURL: result.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.phoneNumber || 'U')}&background=random`,
            isAnonymous: false,
            status: 'online',
            lastSeen: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
        return result;
      } else {
        // Send OTP code
        return await initiatePhoneSignIn(phoneNumberOrVerificationId, verificationIdOrCode);
      }
    } catch (error) {
      console.error('Errore login telefono:', error);
      throw error;
    }
  };

  const loginAnonymously = async (nickname: string) => {
    if (!nickname || nickname.trim().length < 3) {
      throw new Error('Il nickname deve contenere almeno 3 caratteri');
    }

    try {
      const result = await signInAnonymously(auth);
      const user = result.user;

      if (!user) {
        throw new Error('Si è verificato un errore durante la creazione dell\'account ospite');
      }

      const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(nickname)}&background=random`;

      await updateProfile(user, {
        displayName: nickname,
        photoURL
      });

      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 24);

      await setDoc(doc(db, 'users', user.uid), {
        displayName: nickname,
        isAnonymous: true,
        createdAt: serverTimestamp(),
        expiresAt: expirationTime.toISOString(),
        status: 'online',
        lastSeen: serverTimestamp(),
        photoURL,
        updatedAt: serverTimestamp()
      });

      localStorage.setItem('anonymousLoginTime', new Date().toISOString());
      localStorage.setItem('anonymousUserId', user.uid);

      setIsAnonymous(true);
    } catch (error: any) {
      console.error('Errore durante l\'accesso anonimo:', error);
      throw new Error(error.message || 'Si è verificato un errore durante l\'accesso anonimo');
    }
  };

  const logout = async () => {
    try {
      if (currentUser) {
        // Termina la sessione corrente prima del logout
        const sessionService = SessionService.getInstance();
        await sessionService.cleanup();

        if (currentUser.isAnonymous) {
          await cleanupAnonymousUser(currentUser.uid);
        } else {
          // Aggiorna lo stato utente a offline
          await setDoc(doc(db, 'users', currentUser.uid), {
            status: 'offline',
            lastSeen: serverTimestamp()
          }, { merge: true });
        }
      }

      await signOut(auth);
      setIsAnonymous(false);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('Nessun utente autenticato');
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error);
      throw new Error('Errore durante l\'aggiornamento del profilo');
    }
  };

  const deleteUserAccount = async (verificationCode?: string) => {
    if (!currentUser) return;

    try {
      // Per utenti anonimi
      if (currentUser.isAnonymous) {
        await cleanupAnonymousUser(currentUser.uid);
        await currentUser.delete();
        return;
      }

      // Per utenti regolari
      if (!currentUser.email) {
        throw new Error('Email non trovata per questo account');
      }

      // Verifica il codice email se fornito
      if (verificationCode) {
        // Qui puoi implementare la verifica del codice
        // Per ora procediamo con l'eliminazione
      }

      // Pulisci i dati dell'utente
      await cleanupAnonymousUser(currentUser.uid); // Riutilizziamo la stessa funzione
      await currentUser.delete();
      
    } catch (error: any) {
      console.error('Errore durante l\'eliminazione dell\'account:', error);
      throw new Error(error.message || 'Errore durante l\'eliminazione dell\'account');
    }
  };

  const value = {
    currentUser,
    userProfile,
    updateUserProfile,
    login,
    logout,
    loginAnonymously,
    loginWithPhone,
    loading,
    isAnonymous,
    isDevelopment,
    deleteUserAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};