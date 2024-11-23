import { useContext } from 'react';
import { ProfileContext } from '../contexts/ProfileContext';
import { Post } from '../types';

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile deve essere utilizzato all\'interno di un ProfileProvider');
  }
  return context;
} 