import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Shield, Globe, Users, Lock } from 'lucide-react';
import { Switch } from '../ui/Switch';

interface PrivacySettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  privacy: {
    accountType: 'public' | 'private';
    profileVisibility: 'public' | 'contacts' | 'private';
    showLastSeen: boolean;
    showStatus: boolean;
    showBio: boolean;
    showPosts: boolean;
    showServices: boolean;
    whoCanMessageMe: 'everyone' | 'followers' | 'none';
    whoCanSeeMyPosts: 'everyone' | 'followers' | 'none';
  };
  onUpdate: (privacy: Partial<PrivacySettingsDialogProps['privacy']>) => Promise<void>;
}

export default function PrivacySettingsDialog({ isOpen, onClose, privacy, onUpdate }: PrivacySettingsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 theme-text" />
          <h2 className="text-xl font-semibold theme-text">Impostazioni Privacy</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium theme-text">Visibilità Account</h3>
            <select
              value={privacy.accountType}
              onChange={(e) => onUpdate({ accountType: e.target.value as 'public' | 'private' })}
              className="w-full p-2 rounded-lg theme-bg-secondary theme-text"
            >
              <option value="public">Account Pubblico</option>
              <option value="private">Account Privato</option>
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium theme-text">Chi può vedere i miei contenuti</h3>
            <select
              value={privacy.whoCanSeeMyPosts}
              onChange={(e) => onUpdate({ whoCanSeeMyPosts: e.target.value as 'everyone' | 'followers' | 'none' })}
              className="w-full p-2 rounded-lg theme-bg-secondary theme-text"
            >
              <option value="everyone">Tutti</option>
              <option value="followers">Solo follower</option>
              <option value="none">Nessuno</option>
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium theme-text">Impostazioni Visibilità</h3>
            {Object.entries(privacy)
              .filter(([key]) => key.startsWith('show'))
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="theme-text">
                    {key === 'showLastSeen' && 'Mostra ultimo accesso'}
                    {key === 'showStatus' && 'Mostra stato online'}
                    {key === 'showBio' && 'Mostra biografia'}
                    {key === 'showPosts' && 'Mostra post'}
                    {key === 'showServices' && 'Mostra servizi'}
                  </span>
                  <Switch
                    checked={value as boolean}
                    onCheckedChange={(checked) => onUpdate({ [key]: checked })}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
} 