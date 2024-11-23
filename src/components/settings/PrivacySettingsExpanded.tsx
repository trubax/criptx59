import React from 'react';
import { Shield, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Switch } from '../ui/Switch';
import type { PrivacySettings } from '@/types/privacy';

interface PrivacySettingsExpandedProps {
  privacy: PrivacySettings;
  onUpdate: (updates: Partial<PrivacySettings>) => Promise<void>;
  expanded: boolean;
  onToggle: () => void;
}

export default function PrivacySettingsExpanded({ privacy, onUpdate, expanded, onToggle }: PrivacySettingsExpandedProps) {
  return (
    <div>
      <div
        onClick={onToggle}
        className="flex items-center justify-between p-4 cursor-pointer hover:theme-bg-secondary"
      >
        <div className="flex items-center space-x-4">
          <Shield className="w-5 h-5 theme-text" />
          <div>
            <h3 className="theme-text">Privacy</h3>
            <p className="text-sm theme-text-secondary">Chi può vedere le tue informazioni</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 theme-text" />
        ) : (
          <ChevronDown className="w-5 h-5 theme-text" />
        )}
      </div>

      {expanded && (
        <div className="p-4 space-y-6 theme-border-t">
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

          <div>
            <h3 className="text-lg font-medium theme-text mb-4">Chi può vedere i contenuti</h3>
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
      )}
    </div>
  );
} 