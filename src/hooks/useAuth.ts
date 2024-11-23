import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { SessionService } from '../services/SessionService';
import { auth } from '../firebase';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
} 

const handleLogout = async () => {
  try {
    await SessionService.getInstance().cleanup();
    await auth.signOut();
  } catch (error) {
    console.error('Errore durante il logout:', error);
  }
}; 