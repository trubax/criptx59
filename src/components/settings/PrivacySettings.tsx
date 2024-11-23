import React from 'react';
import { Shield, Globe, Users, Lock } from 'lucide-react';
import { Switch } from '../ui/Switch';
import type { PrivacySettings as PrivacySettingsType } from '@/types/privacy';

interface PrivacySettingsProps {
  privacy: PrivacySettingsType;
  onUpdate: (privacy: Partial<PrivacySettingsType>) => Promise<void>;
}

export default function PrivacySettings({ privacy, onUpdate }: PrivacySettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium theme-text mb-4">Visibilità Account</h3>
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
        <h3 className="text-lg font-medium theme-text">Visibilità Contenuti</h3>
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
        <h3 className="text-lg font-medium theme-text">Impostazioni Privacy</h3>
        <div className="space-y-4">
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
  );
} 