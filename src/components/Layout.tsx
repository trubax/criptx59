import React from 'react';
import { useOnlinePresence } from '../hooks/useOnlinePresence';
import { useFullscreen } from '../services/AuthService';
import BottomNavigation from './navigation/BottomNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useOnlinePresence();
  useFullscreen({ orientation: 'portrait' });

  return (
    <div className="min-h-screen theme-bg">
      {children}
      <BottomNavigation />
    </div>
  );
} 