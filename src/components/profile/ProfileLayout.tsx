import React from 'react';
import Header from '../Header';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="page-layout">
      <div className="fixed-header">
        <Header />
      </div>
      <div className="scroll-view">
        {children}
      </div>
    </div>
  );
} 